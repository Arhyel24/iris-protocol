"use client"

import React from "react";
import { LoginButton } from "@/components/auth/AuthButtons";
import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-iris-dark flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-iris-darker/80 backdrop-blur-md border-b border-iris-purple/10">
        <div className="container mx-auto flex justify-between items-center h-16 px-4">
          <div className="flex items-center space-x-1">
            <Shield className="h-6 w-6 text-iris-purple" />
            <span className="font-orbitron text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-iris-purple-light to-iris-blue-light">
              IRIS
            </span>
            <Badge
              variant="outline"
              className="ml-2 text-xs font-medium text-iris-blue-light"
            >
              BETA
            </Badge>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full p-8 glass-card rounded-xl shadow-xl border border-iris-purple/20"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-iris-darker/50 border border-iris-purple/20">
              <Shield className="h-12 w-12 text-iris-purple" />
            </div>
          </div>

          <h1 className="text-2xl font-orbitron text-white text-center mb-2">
            Welcome to IRIS
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Connect your account to access the features
          </p>

          <div className="flex justify-center">
            <LoginButton />
          </div>

          <p className="text-xs text-center text-muted-foreground mt-8">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>
      </main>
    </div>
  );
}