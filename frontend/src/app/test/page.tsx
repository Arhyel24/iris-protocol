"use client";

import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useUser, UserButton } from "@civic/auth-web3/react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useAuth } from "@/contexts/AuthContext";

const AppContent = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { user } = useUser();
  const [balance, setBalance] = useState<number | null>(null);
  const {user: civicUser } = useAuth()

  useEffect(() => {
    const fetchBalance = async () => {
      if (publicKey) {
        const lamports = await connection.getBalance(publicKey);
        setBalance(lamports / 1e9);
      }
    };

    fetchBalance();
  }, [publicKey, connection]);

  return (
    <div>
      <WalletMultiButton />
      <h1>My App</h1>
      <p>Hello {user?.email ?? "Guest"}!</p>
      <p>Hello from Civic {civicUser?.email ?? "Guest"}!</p>
      {publicKey && (
        <>
          <p>Wallet address: {publicKey.toString()}</p>
          <p>Balance: {balance !== null ? `${balance} SOL` : "Loading..."}</p>
        </>
      )}
      <UserButton />
    </div>
  );
};

export default AppContent