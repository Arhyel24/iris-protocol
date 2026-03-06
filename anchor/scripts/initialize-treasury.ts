/**
 * IRIS Protocol — Devnet: Deploy & Initialize Treasury
 * ======================================================
 * Run after `anchor deploy --provider.cluster devnet`:
 *
 *   cd anchor
 *   npx tsx scripts/initialize-treasury.ts
 *
 * What it does:
 *  1. Derives the TreasuryState PDA (seeds: ["treasury", oracle_pubkey])
 *  2. Creates / gets the treasury's devnet USDC ATA (owner = TreasuryState PDA)
 *  3. Calls `initialize_treasury` on-chain
 *  4. Prints all on-chain addresses for reference
 */

import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import {
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";

// ─── Config ──────────────────────────────────────────────────────────────────

const PROGRAM_ID = new PublicKey(
  "ECDThuwStZ4a1ksQE2C9wakVoa4RYtBp5e7YAXsTJCHN",
);

// Devnet USDC (Circle devnet faucet mint)
const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");

const RPC_URL = "https://api.devnet.solana.com";

// Path to oracle keypair (relative to this script)
const ORACLE_KEYPAIR_PATH = path.resolve(
  __dirname,
  "../../backend/oracle-keypair.json",
);

// IDL
const IDL_PATH = path.resolve(__dirname, "../target/idl/anchor.json");
// Fallback: use the frontend copy if target/idl was cleaned
const IDL_FALLBACK = path.resolve(
  __dirname,
  "../../frontend/public/anchor-idl.json",
);

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  // Load oracle keypair
  if (!fs.existsSync(ORACLE_KEYPAIR_PATH)) {
    throw new Error(`Oracle keypair not found at ${ORACLE_KEYPAIR_PATH}`);
  }
  const rawKey = JSON.parse(fs.readFileSync(ORACLE_KEYPAIR_PATH, "utf-8"));
  const oracleKp = Keypair.fromSecretKey(Uint8Array.from(rawKey));
  console.log("Oracle pubkey:", oracleKp.publicKey.toBase58());

  // Load IDL
  const idlPath = fs.existsSync(IDL_PATH) ? IDL_PATH : IDL_FALLBACK;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const idl = require(idlPath);

  // Set up provider
  const connection = new Connection(RPC_URL, "confirmed");
  const wallet = new Wallet(oracleKp);
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  // Check balance
  const balance = await connection.getBalance(oracleKp.publicKey);
  console.log(`Oracle balance: ${balance / 1e9} SOL`);
  if (balance < 0.05 * 1e9) {
    throw new Error(
      "Oracle wallet has insufficient SOL. Need at least 0.05 SOL.",
    );
  }

  // Derive Treasury PDA
  const [treasuryPDA, treasuryBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("treasury"), oracleKp.publicKey.toBuffer()],
    PROGRAM_ID,
  );
  console.log(
    "Treasury PDA:  ",
    treasuryPDA.toBase58(),
    "(bump:",
    treasuryBump,
    ")",
  );

  // Create or get the treasury USDC ATA (owner = treasury PDA, allowOwnerOffCurve = true)
  console.log("\nCreating / fetching treasury USDC token account ...");
  const treasuryUsdcATA = await getOrCreateAssociatedTokenAccount(
    connection,
    oracleKp, // payer
    USDC_MINT,
    treasuryPDA, // owner = PDA (off-curve)
    true, // allowOwnerOffCurve
  );
  console.log("Treasury USDC: ", treasuryUsdcATA.address.toBase58());

  // Check if treasury is already initialized
  const program = new Program(idl, provider);
  let alreadyInit = false;
  try {
    const ts = await (program.account as any).treasuryState.fetch(treasuryPDA);
    console.log("\nTreasury already initialized:");
    console.log("  admin:", ts.admin.toBase58());
    console.log(
      "  totalPremiumsCollected:",
      ts.totalPremiumsCollected.toString(),
    );
    console.log("  totalPayouts:", ts.totalPayouts.toString());
    alreadyInit = true;
  } catch {
    // not yet initialized
  }

  if (!alreadyInit) {
    console.log("\nCalling initialize_treasury ...");
    const tx = await (program.methods as any)
      .initializeTreasury()
      .accounts({
        treasuryState: treasuryPDA,
        treasuryUsdc: treasuryUsdcATA.address,
        admin: oracleKp.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([oracleKp])
      .rpc();

    console.log("Transaction:", tx);
    console.log(
      "Explorer:   ",
      `https://explorer.solana.com/tx/${tx}?cluster=devnet`,
    );

    const ts = await (program.account as any).treasuryState.fetch(treasuryPDA);
    console.log("\nTreasury initialized:");
    console.log("  admin:", ts.admin.toBase58());
  }

  // ─── Summary ───────────────────────────────────────────────────────────────
  console.log("\n========================================");
  console.log("IRIS Devnet Deployment Summary");
  console.log("========================================");
  console.log("Program ID:    ", PROGRAM_ID.toBase58());
  console.log("Oracle/Admin:  ", oracleKp.publicKey.toBase58());
  console.log("Treasury PDA:  ", treasuryPDA.toBase58());
  console.log("Treasury USDC: ", treasuryUsdcATA.address.toBase58());
  console.log("USDC Mint:     ", USDC_MINT.toBase58());
  console.log(
    "Explorer:       https://explorer.solana.com/address/" +
      PROGRAM_ID.toBase58() +
      "?cluster=devnet",
  );
  console.log("========================================");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
