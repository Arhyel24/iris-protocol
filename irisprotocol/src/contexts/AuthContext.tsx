"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@civic/auth-web3/react";
import { getTokens } from "@civic/auth-web3/nextjs";
import { getSupabaseClientWithJWT } from "@/integrations/supabase/createClient";
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
  supabase: any | null;
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
  const [supabaseClient, setSupabaseClient] = useState<any | null>(null);
  const { toast } = useToast();
  const { publicKey, signMessage } = useWallet();

  useEffect(() => {
    const syncUserWithSupabase = async () => {
      if (!civicUser) {
        setProfile(null);
        setWallets(null);
        setSupabaseClient(null);
        setLoading(false);
        return;
      }

      console.log("User:",civicUser)

      const token = await getTokens()
      console.log("Token (auth):", token?.accessToken)

      try {
        const client = await getSupabaseClientWithJWT();
        setSupabaseClient(client);

        const { data: existingUser, error: fetchError } = await client
          .from("profiles")
          .select("*")
          .eq("civic_id", civicUser.id)
          .single();

          if (fetchError && fetchError.code === "PGRST116") {
            const { error: createProfileError } = await client.from("profiles").insert({
              civic_id: civicUser.id,
              email: civicUser.email,
              full_name: civicUser.name,
              created_at: new Date().toISOString(),
            });
          
            const { error: upsertUserError } = await client
              .from("users")
              .upsert({ civic_id: civicUser.id });
          
            if (createProfileError || upsertUserError) {
              throw createProfileError || upsertUserError;
            }
          }          

        await fetchProfile(client, civicUser.id);
        await fetchWallets(client, civicUser.id);
      } catch (error: any) {
        console.error("Error syncing user:", error);
        toast({
          title: "Error syncing user data",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    syncUserWithSupabase();
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
      const signature = await signMessage(message); // signature is just proof of ownership

      if (!signature) throw new Error("Signature failed");

      // Proceed to add the wallet
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
}, [publicKey]);


  const fetchProfile = async (client: any, civicId: string) => {
    const { data, error } = await client
      .from("profiles")
      .select("*")
      .eq("civic_id", civicId)
      .single();
    if (error) throw error;
    setProfile(data);
  };

  const fetchWallets = async (client: any, civicId: string) => {
    const { data, error } = await client
      .from("wallets")
      .select("*")
      .eq("civic_id", civicId)
      .order("is_primary", { ascending: false });
    if (error) throw error;
    setWallets(data || []);
  };

  const refreshProfile = async () => {
    if (!civicUser || !supabaseClient) return;
    await fetchProfile(supabaseClient, civicUser.id);
  };

  const refreshWallets = async () => {
    if (!civicUser || !supabaseClient) return;
    await fetchWallets(supabaseClient, civicUser.id);
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
    if (!civicUser || !supabaseClient) return;

    try {
      const isPrimary = !wallets || wallets.length === 0;

      const { error } = await supabaseClient.from("wallets").insert({
        civic_id: civicUser.id,
        address,
        name: name || `Wallet ${wallets?.length ? wallets.length + 1 : 1}`,
        is_primary: isPrimary,
      });

      if (error) throw error;

      toast({
        title: "Wallet added",
        description: "Your wallet has been added successfully.",
      });

      await refreshWallets();
    } catch (error: any) {
      toast({
        title: "Error adding wallet",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const setWalletAsPrimary = async (walletId: string) => {
    if (!civicUser || !supabaseClient) return;

    try {
      await supabaseClient
        .from("wallets")
        .update({ is_primary: false })
        .eq("civic_id", civicUser.id);

      const { error } = await supabaseClient
        .from("wallets")
        .update({ is_primary: true })
        .eq("id", walletId);

      if (error) throw error;

      toast({
        title: "Primary wallet updated",
        description: "Your primary wallet has been updated.",
      });

      await refreshWallets();
    } catch (error: any) {
      toast({
        title: "Error updating wallet",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeWallet = async (walletId: string) => {
    if (!civicUser || !supabaseClient) return;

    try {
      const walletToRemove = wallets?.find((w) => w.id === walletId);
      const isPrimary = walletToRemove?.is_primary;

      const { error } = await supabaseClient
        .from("wallets")
        .delete()
        .eq("id", walletId);

      if (error) throw error;

      if (isPrimary && wallets && wallets.length > 1) {
        const nextWallet = wallets.find((w) => w.id !== walletId);
        if (nextWallet) {
          await supabaseClient
            .from("wallets")
            .update({ is_primary: true })
            .eq("id", nextWallet.id);
        }
      }

      toast({
        title: "Wallet removed",
        description: "Your wallet has been removed successfully.",
      });

      await refreshWallets();
    } catch (error: any) {
      toast({
        title: "Error removing wallet",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: civicUser,
        profile,
        wallets,
        loading,
        supabase: supabaseClient,
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
function getSupabaseWithJWT(accessToken: string | undefined) {
  throw new Error("Function not implemented.");
}

