"use client"

import React, { useState, useEffect } from "react";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useUser } from "@civic/auth-web3/react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Wallet, PlusCircle, Trash2, CheckCircle2 } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";

type WalletFormData = {
  address: string;
  name: string;
};

export default function Wallets() {
  const { wallets, addWallet, setWalletAsPrimary, removeWallet } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<WalletFormData>();

  const { publicKey } = useWallet();
    const { connection } = useConnection();
    const { user } = useUser();
    const [balance, setBalance] = useState<number | null>(null);
  
    useEffect(() => {
      const fetchBalance = async () => {
        if (publicKey) {
          const lamports = await connection.getBalance(publicKey);
          setBalance(lamports / 1e9);
        }
      };
  
      fetchBalance();
    }, [publicKey, connection]);
  
  const onSubmit = async (data: WalletFormData) => {
    await addWallet(data.address, data.name);
    reset();
    setDialogOpen(false);
  };

  return (
      <div className="min-h-screen bg-iris-dark">
        <Navbar />
        <main className="container mx-auto px-4 py-20">
          <div className="space-y-8">
            <h1 className="text-2xl font-orbitron font-bold text-white mt-4 mb-6">My Wallets</h1>
            
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">
                Manage your connected wallets and control which one is used as your primary wallet.
              </p>
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="neo-button">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Wallet
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] glass-card border border-iris-purple/20">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                      <DialogTitle className="text-white">Add New Wallet</DialogTitle>
                      <DialogDescription>
                        Connect a new wallet address to your account.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="address">Wallet Address</Label>
                        <Input
                          id="address"
                          placeholder="Enter Solana wallet address"
                          {...register("address", { 
                            required: "Address is required",
                            pattern: {
                              value: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
                              message: "Please enter a valid Solana address"
                            }
                          })}
                        />
                        {errors.address && (
                          <p className="text-sm text-red-500">{errors.address.message}</p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="name">Wallet Name (Optional)</Label>
                        <Input
                          id="name"
                          placeholder="My Main Wallet"
                          {...register("name")}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="neo-button">Add Wallet</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="glass-card border-none shadow-lg relative border-l-4 border-l-iris-purple">
                  <div className="absolute top-3 right-3 bg-iris-blue/20 text-iris-blue text-xs py-1 px-2 rounded-full flex items-center">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Embedded
                  </div>
                  <CardHeader>
                    <CardTitle className="font-orbitron text-white flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      Embedded
                    </CardTitle>
                    <CardDescription className="text-xs font-mono break-all text-white/60">
                      {publicKey
                        ? `${publicKey.toString().slice(0, 4)}...${publicKey
                            .toString()
                            .slice(-4)}`
                        : "No wallet connected"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-white/80">
                      Added: {new Date().toLocaleDateString()}
                    </p>
                    <p className="text-sm text-white mt-2">
                      Balance:{" "}
                      <span className="font-semibold text-iris-purple">
                        {balance !== null ? `${balance.toFixed(4)} SOL` : "Loading..."}
                      </span>
                    </p>
                </CardContent>
                {/* <CardFooter className="flex justify-between gap-2">
                        
                          <Button 
                            variant="outline" 
                    className="flex-1"
                    disabled
                           >
                            Auto generated wallet
                          </Button>
                      </CardFooter> */}
                </Card>
              </motion.div>

              {wallets && wallets.length > 0 ? (
                wallets.map((wallet) => (
                  <motion.div
                    key={wallet.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className={`glass-card border-none shadow-lg relative ${wallet.is_primary ? 'border-l-4 border-l-iris-purple' : ''}`}>
                      {wallet.is_primary && (
                        <div className="absolute top-3 right-3 bg-iris-purple/20 text-iris-purple text-xs py-1 px-2 rounded-full flex items-center">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Primary
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="font-orbitron text-white flex items-center gap-2">
                          <Wallet className="h-5 w-5" />
                          {wallet.name || `Wallet ${wallets.indexOf(wallet) + 1}`}
                        </CardTitle>
                        <CardDescription className="text-xs font-mono break-all">
                          {wallet.address.substring(0, 4)}...{wallet.address.substring(wallet.address.length - 4)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-white/80">
                          Added: {new Date(wallet.created_at).toLocaleDateString()}
                        </p>
                      </CardContent>
                      <CardFooter className="flex justify-between gap-2">
                        {!wallet.is_primary && (
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setWalletAsPrimary(wallet.id)}
                          >
                            Set as Primary
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          onClick={() => removeWallet(wallet.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center p-12">
                  <div className="flex justify-center mb-4">
                    <Wallet className="h-12 w-12 text-iris-purple opacity-50" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">No Wallets Connected</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't added any wallets to your account yet.
                  </p>
                  <Button className="neo-button" onClick={() => setDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Connect Your First Wallet
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
  );
};
