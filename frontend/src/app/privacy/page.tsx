"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

const privacyItems = [
  {
    title: "Data Access",
    content:
      "IRIS exclusively interacts with publicly available on-chain data such as token balances, transaction histories, wallet interactions, and DeFi protocol usage. No off-chain identifiers (such as emails or IPs) or private keys are collected or accessed at any time.",
  },
  {
    title: "AI Training",
    content:
      "Wallet-related insights may be anonymized, aggregated, and used to improve IRIS’s AI models and predictive capabilities. No personally identifiable information (PII) is ever linked to model training data.",
  },
  {
    title: "No Tracking",
    content:
      "IRIS is built with a strong privacy-first architecture. It does not employ cookies, browser fingerprinting, analytics scripts, or any off-chain tracking mechanisms. All interactions remain fully on-chain and wallet-based.",
  },
  {
    title: "Non-Custodial",
    content:
      "All risk evaluations and actions performed by IRIS are executed through user-authorized smart contracts. IRIS never holds custody of funds or assets, and users maintain complete control of their wallets.",
  },
  {
    title: "Third Parties",
    content:
      "IRIS does not sell, monetize, or share user data with any third parties, including marketers, advertisers, or data brokers. Any integrations with other dApps or protocols are performed securely on-chain and with user consent.",
  },
  {
    title: "Security",
    content:
      "IRIS follows industry-leading security practices including third-party audits, formal verification where applicable, and active bug bounty programs. Data and smart contracts are reviewed to maintain privacy, integrity, and resilience.",
  },
];

  return (
    <div className="min-h-screen bg-iris-dark">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center justify-center mb-10">
            <div className="bg-gradient-to-r from-iris-purple to-iris-blue p-[1px] rounded-full">
              <div className="bg-iris-darker p-4 rounded-full">
                <Shield className="h-10 w-10 text-iris-purple" />
              </div>
            </div>
          </div>

          <motion.h1
            className="text-4xl font-orbitron font-bold text-white text-center mb-6 glow-border"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Privacy Policy
          </motion.h1>

          <motion.p
            className="text-muted-foreground text-lg text-center mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            IRIS respects your privacy and is committed to transparency in how
            it handles user data
          </motion.p>

          <Card className="glass-card border-none shadow-lg">
            <CardContent className="pt-6">
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-6"
              >
                {privacyItems.map((privacyItem, index) => (
                  <motion.div
                    key={index}
                    variants={item}
                    className="border-b border-iris-purple/10 pb-6 last:border-0 last:pb-0"
                  >
                    <h3 className="text-xl font-medium text-white mb-2">
                      {privacyItem.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {privacyItem.content}
                    </p>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 p-5 bg-iris-purple/5 border border-iris-purple/10 rounded-lg"
              >
                <h3 className="text-white font-medium mb-2">Contact Us</h3>
                <p className="text-muted-foreground">
                  If you have questions or concerns about your privacy, contact
                  the IRIS team via the official Discord or GitHub repository.
                </p>
              </motion.div>
            </CardContent>
          </Card>

          <motion.div
            className="mt-10 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            <p className="text-muted-foreground text-sm">
              Last updated: April 20, 2025. Privacy Policy is subject to change.
            </p>
          </motion.div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
