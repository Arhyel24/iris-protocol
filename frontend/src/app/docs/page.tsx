"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, ShieldCheck, Cpu, FileText } from "lucide-react";

export default function DocumentationPage() {
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

  return (
    <div className="min-h-screen bg-iris-dark">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-center mb-10">
            <div className="bg-gradient-to-r from-iris-purple to-iris-blue p-[1px] rounded-full">
              <div className="bg-iris-darker p-4 rounded-full">
                <BookOpen className="h-10 w-10 text-iris-purple" />
              </div>
            </div>
          </div>

          <motion.h1
            className="text-4xl font-orbitron font-bold text-white text-center mb-6 glow-border"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            IRIS Protocol Documentation
          </motion.h1>

          <motion.p
            className="text-muted-foreground text-lg text-center mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Your comprehensive guide to using IRIS for DeFi risk protection
          </motion.p>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-3 mb-8 bg-iris-darker/50 p-1">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-8"
              >
                <motion.div variants={item}>
                  <Card className="glass-card border-none shadow-lg">
                    <CardContent className="pt-6">
                      <h2 className="text-2xl font-orbitron text-white mb-4 glow-border">
                        Introduction
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        IRIS is a Solana-based, AI-powered DeFi risk protection
                        protocol designed to help users automatically safeguard
                        their crypto portfolios from major market losses. It
                        does this through real-time risk analysis, automated
                        asset swaps, NFT-based insurance, and a transparent
                        claim system—all powered by secure, non-custodial smart
                        contracts.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={item}>
                  <Card className="glass-card border-none shadow-lg">
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-4">
                        <ShieldCheck className="h-6 w-6 text-iris-purple mr-2" />
                        <h3 className="text-xl font-orbitron text-white">
                          Key Benefits
                        </h3>
                      </div>
                      <ul className="space-y-3 text-muted-foreground">
                        <li className="flex items-start">
                          <div className="bg-iris-purple/10 p-1 rounded mr-2 mt-1">
                            <span className="text-iris-purple text-xs">•</span>
                          </div>
                          <span>
                            Proactive risk management through AI-powered
                            analytics
                          </span>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-iris-purple/10 p-1 rounded mr-2 mt-1">
                            <span className="text-iris-purple text-xs">•</span>
                          </div>
                          <span>
                            Automatic protection against sudden market downturns
                          </span>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-iris-purple/10 p-1 rounded mr-2 mt-1">
                            <span className="text-iris-purple text-xs">•</span>
                          </div>
                          <span>
                            Customizable risk thresholds and protection settings
                          </span>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-iris-purple/10 p-1 rounded mr-2 mt-1">
                            <span className="text-iris-purple text-xs">•</span>
                          </div>
                          <span>
                            Transparent, on-chain insurance claims and payouts
                          </span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>

            <TabsContent value="features">
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <motion.div variants={item}>
                  <Card className="glass-card border-none shadow-lg h-full">
                    <CardContent className="pt-6 h-full">
                      <div className="flex items-center mb-4">
                        <Cpu className="h-6 w-6 text-iris-blue mr-2" />
                        <h3 className="text-xl font-orbitron text-white">
                          AI Risk Analysis
                        </h3>
                      </div>
                      <p className="text-muted-foreground">
                        Our AI engine continuously monitors market conditions,
                        token volatility, and on-chain activity to assign
                        dynamic risk scores to your holdings. These scores help
                        you understand your exposure and inform automated
                        protection actions.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={item}>
                  <Card className="glass-card border-none shadow-lg h-full">
                    <CardContent className="pt-6 h-full">
                      <div className="flex items-center mb-4">
                        <ShieldCheck className="h-6 w-6 text-iris-purple mr-2" />
                        <h3 className="text-xl font-orbitron text-white">
                          NFT Insurance
                        </h3>
                      </div>
                      <p className="text-muted-foreground">
                        IRIS offers tiered insurance coverage through NFT
                        assets. These NFTs entitle holders to claim compensation
                        for qualifying losses, with different tiers providing
                        varying coverage caps and premium requirements.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={item}>
                  <Card className="glass-card border-none shadow-lg h-full">
                    <CardContent className="pt-6 h-full">
                      <div className="flex items-center mb-4">
                        <FileText className="h-6 w-6 text-iris-blue mr-2" />
                        <h3 className="text-xl font-orbitron text-white">
                          Claims Processing
                        </h3>
                      </div>
                      <p className="text-muted-foreground">
                        All claims are processed transparently on-chain, with
                        clear requirements for validation. Claims can be
                        auto-triggered based on market conditions or manually
                        submitted with evidence of loss.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={item}>
                  <Card className="glass-card border-none shadow-lg h-full">
                    <CardContent className="pt-6 h-full">
                      <div className="flex items-center mb-4">
                        <FileText className="h-6 w-6 text-iris-purple mr-2" />
                        <h3 className="text-xl font-orbitron text-white">
                          Auto-Swaps
                        </h3>
                      </div>
                      <p className="text-muted-foreground">
                        Based on user-defined thresholds, IRIS can automatically
                        swap risky assets to stablecoins when risk scores exceed
                        your comfort level, protecting your portfolio from
                        further downside.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>

            <TabsContent value="technical">
              <motion.div variants={container} initial="hidden" animate="show">
                <motion.div variants={item}>
                  <Card className="glass-card border-none shadow-lg">
                    <CardContent className="pt-6">
                      <h2 className="text-2xl font-orbitron text-white mb-4">
                        Technical Overview
                      </h2>
                      <p className="text-muted-foreground leading-relaxed mb-6">
                        IRIS is built on Solana to leverage the network&apos;s
                        high speed and low transaction costs. The protocol
                        consists of several core components working together to
                        provide comprehensive protection.
                      </p>

                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium text-white mb-2">
                            Smart Contracts
                          </h3>
                          <p className="text-muted-foreground">
                            Non-custodial contracts written in Rust power the
                            core functionality, handling token swaps, insurance
                            minting, and claim processing with maximum security
                            and transparency.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium text-white mb-2">
                            AI Risk Engine
                          </h3>
                          <p className="text-muted-foreground">
                            A sophisticated machine learning model trained on
                            historical market data that generates risk scores
                            for tokens and portfolios in real-time.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium text-white mb-2">
                            Oracles
                          </h3>
                          <p className="text-muted-foreground">
                            Integration with Pyth Network and other oracles
                            provides accurate, tamper-resistant price data for
                            risk calculations and claim validation.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
