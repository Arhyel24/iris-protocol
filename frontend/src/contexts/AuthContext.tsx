"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@civic/auth-web3/react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

interface CivicUser {
  id: string;
  email?: string;
  username?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  updated_at?: Date;
}

type AuthContextType = {
  user: CivicUser | null;
  profile: any | null;
  wallets: any[] | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshWallets: () => Promise<void>;
  addWallet: (address: string, name?: string) => Promise<void>;
  setWalletAsPrimary: (walletId: string) => Promise<void>;
  removeWallet: (walletId: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user: civicUser, signIn, signOut: logOut } = useUser();
  const [profile, setProfile] = useState<any | null>(null);
  const [wallets, setWallets] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { publicKey, signMessage } = useWallet();

  useEffect(() => {
    if (civicUser) {
      setProfile({
        civic_id: civicUser.id,
        email: civicUser.email,
        full_name: civicUser.name,
      });
      setWallets([]);
    } else {
      setProfile(null);
      setWallets(null);
    }
    setLoading(false);
  }, [civicUser]);

  useEffect(() => {
    const connectWallet = async () => {
      if (!publicKey || !signMessage) return;

      const address = publicKey.toString();
      const isAlreadyAdded = wallets?.some(wallet => wallet.address === address);

      if (isAlreadyAdded) {
        toast({
          title: "Wallet already added",
          description: "The wallet you're trying to add is already linked to your account.",
        });
        return;
      }

      try {
        const message = new TextEncoder().encode("Sign this message to confirm wallet ownership.");
        const signature = await signMessage(message);

        if (!signature) throw new Error("Signature failed");

        await addWallet(address, `Wallet ${wallets ? wallets.length + 2 : "01"}`);

        toast({
          title: "New wallet added successfully",
          description: "A new wallet has been linked to your account.",
        });
      } catch (error) {
        console.error("Wallet signature failed:", error);
        toast({
          title: "Signature required",
          description: "You must sign the message to verify ownership before linking this wallet.",
          variant: "destructive",
        });
      }
    };

    connectWallet();
  }, [publicKey, wallets]);

  const refreshProfile = async () => {
    // Backend profile fetching logic would go here
  };

  const refreshWallets = async () => {
    // Backend wallet fetching logic would go here
  };

  const signInWithGoogle = async () => {
    toast({
      title: "Login clicked",
      description: "The login flow has started successfully.",
    });
    await signIn("new_tab");
  };

  const signOut = async () => {
    await logOut();
  };

  const addWallet = async (address: string, name?: string) => {
    const newWallet = {
      id: address,
      address,
      name: name || `Wallet ${wallets?.length ? wallets.length + 1 : 1}`,
      is_primary: wallets?.length === 0,
    };
    setWallets(prev => prev ? [...prev, newWallet] : [newWallet]);
  };

  const setWalletAsPrimary = async (walletId: string) => {
    setWallets(prev => prev?.map(w => ({ ...w, is_primary: w.id === walletId })) || null);
  };

  const removeWallet = async (walletId: string) => {
    setWallets(prev => prev?.filter(w => w.id !== walletId) || null);
  };

  return (
    <AuthContext.Provider
      value={{
        user: civicUser as any,
        profile,
        wallets,
        loading,
        signInWithGoogle,
        signOut,
        refreshProfile,
        refreshWallets,
        addWallet,
        setWalletAsPrimary,
        removeWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
