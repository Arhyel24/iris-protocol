/**
 * IRIS Protocol — Anchor Client (Frontend)
 * =========================================
 * Provides a typed `purchasePolicy()` helper that calls the on-chain
 * `purchase_policy` instruction.  The function:
 *
 *  1. Derives the PolicyState PDA for the given (user, quoteId) pair.
 *  2. Derives the first PremiumRecord PDA (index 0).
 *  3. Gets (or creates) the user's USDC associated token account.
 *  4. Sends the `purchase_policy` transaction signed by the wallet.
 *  5. Returns the tx signature and the PolicyState PDA address.
 *
 * Prerequisites (must be present before calling):
 *  - Wallet connected + signed in (JWT).
 *  - User has a USDC token account with sufficient balance.
 *  - Backend has issued a quote (quoteId passed from the API response).
 */

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Deployed program ID — must match lib.rs declare_id! */
export const IRIS_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_IRIS_PROGRAM_ID ??
    "ECDThuwStZ4a1ksQE2C9wakVoa4RYtBp5e7YAXsTJCHN", // devnet program
);

/** Devnet USDC mint (override via env for mainnet) */
export const USDC_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_USDC_MINT ??
    "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", // devnet USDC
);

// ---------------------------------------------------------------------------
// Seed helpers
// ---------------------------------------------------------------------------

/**
 * SHA-256 hash a quote ID string to a fixed 32-byte seed.
 * Solana PDA seeds are limited to 32 bytes each; UUIDs/CUIDs exceed this.
 */
async function hashQuoteId(quoteId: string): Promise<Buffer> {
  const data = Buffer.from(quoteId); // Buffer has a concrete ArrayBuffer
  const buf = await crypto.subtle.digest("SHA-256", data.buffer as ArrayBuffer);
  return Buffer.from(buf);
}

// ---------------------------------------------------------------------------
// PDA helpers
// ---------------------------------------------------------------------------

export function deriveTreasuryPDA(adminPubkey: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("treasury"), adminPubkey.toBuffer()],
    IRIS_PROGRAM_ID,
  );
}

export async function derivePolicyPDA(
  userPubkey: PublicKey,
  quoteId: string,
): Promise<[PublicKey, number]> {
  const quoteIdHash = await hashQuoteId(quoteId);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("policy"), userPubkey.toBuffer(), quoteIdHash],
    IRIS_PROGRAM_ID,
  );
}

export function derivePremiumRecordPDA(
  policyPubkey: PublicKey,
  paymentIndex: number,
): [PublicKey, number] {
  const idxBuf = Buffer.alloc(4);
  idxBuf.writeUInt32LE(paymentIndex, 0);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("premium"), policyPubkey.toBuffer(), idxBuf],
    IRIS_PROGRAM_ID,
  );
}

// ---------------------------------------------------------------------------
// IDL loader (lazy — fetched from /anchor-idl.json served by Next.js public/)
// ---------------------------------------------------------------------------

let _idl: AnchorIdl | null = null;

interface AnchorIdl {
  address: string;
  metadata?: { address: string };
  instructions: Array<{
    name: string;
    discriminator: number[];
    accounts: Array<{ name: string; isMut?: boolean; isSigner?: boolean }>;
    args: Array<{ name: string; type: unknown }>;
  }>;
}

async function getIdl(): Promise<AnchorIdl> {
  if (_idl) return _idl;
  const res = await fetch("/anchor-idl.json");
  if (!res.ok)
    throw new Error("Failed to load anchor IDL from /anchor-idl.json");
  _idl = (await res.json()) as AnchorIdl;
  return _idl;
}

// ---------------------------------------------------------------------------
// Instruction discriminator helper
// ---------------------------------------------------------------------------

async function sha256(data: Uint8Array): Promise<Uint8Array> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    Buffer.from(data).buffer as ArrayBuffer,
  );
  return new Uint8Array(buf);
}

async function instructionDiscriminator(name: string): Promise<Buffer> {
  const preimage = `global:${name}`;
  const hash = await sha256(new TextEncoder().encode(preimage));
  return Buffer.from(hash.slice(0, 8));
}

// ---------------------------------------------------------------------------
// purchasePolicy
// ---------------------------------------------------------------------------

export interface PurchasePolicyParams {
  /** Connected wallet public key */
  userPubkey: PublicKey;
  /** Admin / oracle public key (known constant, configured in .env) */
  adminPubkey: PublicKey;
  /** Quote ID returned by the backend (used as on-chain seed) */
  quoteId: string;
  /**
   * Monthly premium in USDC base units (1 USDC = 1_000_000).
   * Passed as u64 to the instruction.
   */
  monthlyPremiumLamports: bigint;
  /** Number of months for this policy (e.g. 12) */
  durationMonths: number;
  /** Solana RPC connection */
  connection: Connection;
  /**
   * sendTransaction from useWallet().
   * Signature: (tx: Transaction, connection: Connection) => Promise<string>
   */
  sendTransaction: (tx: Transaction, connection: Connection) => Promise<string>;
}

export interface PurchasePolicyResult {
  /** Solana tx signature */
  txHash: string;
  /** On-chain PolicyState PDA — pass to backend as escrowAccount */
  policyPda: string;
  /** User's USDC ATA (pass to backend for scheduler use) */
  userUsdcAccount: string;
  /** Treasury USDC ATA (pass to backend for scheduler use) */
  treasuryUsdcAccount: string;
}

/**
 * Send the `purchase_policy` instruction and return the tx signature + PDAs.
 *
 * NOTE: This builds the instruction manually using the discriminator + Borsh
 * serialisation rather than pulling in the full @coral-xyz/anchor runtime,
 * which keeps the Next.js bundle small.  For a production app you could use
 * the full Anchor `Program` object.
 */
export async function purchasePolicy(
  params: PurchasePolicyParams,
): Promise<PurchasePolicyResult> {
  const {
    userPubkey,
    adminPubkey,
    quoteId,
    monthlyPremiumLamports,
    durationMonths,
    connection,
    sendTransaction,
  } = params;

  // --- Derive accounts ---
  // Account order MUST match the Rust #[derive(Accounts)] struct PurchasePolicy:
  //   0. policy_state        (PDA, init, writable)
  //   1. first_premium_record(PDA, init, writable)
  //   2. treasury_state      (PDA, mut)
  //   3. user_usdc           (mut)
  //   4. treasury_usdc       (mut)
  //   5. user                (signer, mut — payer)
  //   6. token_program
  //   7. system_program
  const [treasuryPda] = deriveTreasuryPDA(adminPubkey);
  const [policyPda] = await derivePolicyPDA(userPubkey, quoteId);
  const [premiumRecord0Pda] = derivePremiumRecordPDA(policyPda, 0);

  const userUsdc = await getAssociatedTokenAddress(USDC_MINT, userPubkey);
  const treasuryUsdc = await getAssociatedTokenAddress(
    USDC_MINT,
    treasuryPda,
    true, // allowOwnerOffCurve — treasury PDA is off-curve
  );

  // --- Ensure user's USDC ATA exists ---
  // If the ATA doesn't exist yet, prepend a createAssociatedTokenAccount ix.
  const preIxs: TransactionInstruction[] = [];
  const userUsdcInfo = await connection.getAccountInfo(userUsdc);
  if (!userUsdcInfo) {
    preIxs.push(
      createAssociatedTokenAccountInstruction(
        userPubkey, // payer
        userUsdc, // ata
        userPubkey, // owner
        USDC_MINT,
      ),
    );
  }

  // --- Borsh-encode instruction data ---
  // Layout: discriminator(8) | quote_id_len(4) | quote_id_bytes | monthly_premium(8) | duration_months(4)
  const disc = await instructionDiscriminator("purchase_policy");
  const quoteIdBytes = new TextEncoder().encode(quoteId);
  const data = Buffer.alloc(8 + 4 + quoteIdBytes.length + 8 + 4);
  let offset = 0;
  disc.copy(data, offset);
  offset += 8;
  data.writeUInt32LE(quoteIdBytes.length, offset);
  offset += 4;
  Buffer.from(quoteIdBytes).copy(data, offset);
  offset += quoteIdBytes.length;
  // writeBigUInt64LE is Node-only; write as two 32-bit LE words for browser compat
  const lo = Number(monthlyPremiumLamports & BigInt(0xffffffff));
  const hi = Number(monthlyPremiumLamports >> BigInt(32));
  data.writeUInt32LE(lo, offset);
  data.writeUInt32LE(hi, offset + 4);
  offset += 8;
  data.writeUInt32LE(durationMonths, offset);

  // --- Build purchase_policy instruction ---
  const ix = new TransactionInstruction({
    programId: IRIS_PROGRAM_ID,
    keys: [
      // Must match PurchasePolicy struct field order exactly:
      { pubkey: policyPda, isSigner: false, isWritable: true }, // policy_state
      { pubkey: premiumRecord0Pda, isSigner: false, isWritable: true }, // first_premium_record
      { pubkey: treasuryPda, isSigner: false, isWritable: true }, // treasury_state
      { pubkey: userUsdc, isSigner: false, isWritable: true }, // user_usdc
      { pubkey: treasuryUsdc, isSigner: false, isWritable: true }, // treasury_usdc
      { pubkey: userPubkey, isSigner: true, isWritable: true }, // user (payer)
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, // token_program
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program
    ],
    data,
  });

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();
  const tx = new Transaction({
    recentBlockhash: blockhash,
    feePayer: userPubkey,
  });
  // Prepend ATA creation if needed, then the purchase instruction
  for (const preIx of preIxs) tx.add(preIx);
  tx.add(ix);

  const txHash = await sendTransaction(tx, connection);
  await connection.confirmTransaction(
    { signature: txHash, blockhash, lastValidBlockHeight },
    "confirmed",
  );

  return {
    txHash,
    policyPda: policyPda.toBase58(),
    userUsdcAccount: userUsdc.toBase58(),
    treasuryUsdcAccount: treasuryUsdc.toBase58(),
  };
}
