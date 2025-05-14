"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

const faqItems = [
  {
    question: "What is IRIS Protocol?",
    answer:
      "IRIS is an AI-powered, decentralized risk protection platform built on Solana. It monitors wallet activity, market conditions, and protocol exposure in real time to assign risk scores and execute protective strategies like automated token swaps, insurance coverage, or alerts—helping users minimize losses during volatile or malicious events.",
  },
  {
    question: "Do I need to give IRIS control over my wallet?",
    answer:
      "Absolutely not. IRIS is entirely non-custodial. All actions—such as enabling protections or executing swaps—are initiated via secure smart contracts that require explicit user approval. Your private keys and funds always remain in your control.",
  },
  {
    question: "How does the risk scoring system work?",
    answer:
      "IRIS uses a combination of on-chain data, such as transaction history, asset age, token volatility, DEX volume, liquidity depth, whale exposure, and oracle pricing. Our AI models analyze these in real-time and assign a dynamic risk score per token and for the entire wallet, updating as market conditions evolve.",
  },
  {
    question: "What triggers a protection mechanism?",
    answer:
      "You define your own risk tolerance through custom thresholds. When your wallet or a specific token surpasses these thresholds—due to volatility spikes, slippage, declining liquidity, or sudden dumps—IRIS takes action based on your pre-set preferences: alerting you, swapping to stablecoins, or filing insurance claims automatically.",
  },
  {
    question: "What are Insurance NFTs?",
    answer:
      "Insurance NFTs are programmable, tiered digital policies that represent your coverage agreement with IRIS. Holding one grants eligibility for claims in the event of certain loss events. Different tiers—Basic, Pro, Institutional—define your payout caps, cooldown periods, claim review criteria, and additional features like real-time hedging.",
  },
  {
    question: "How are claims processed?",
    answer:
      "Claims may be triggered either automatically via smart contract logic or manually by the user. Upon submission, claims are validated on-chain and either settled instantly by the contract (for qualifying events) or routed to the IRIS DAO for community verification. All claim activity is recorded transparently.",
  },
  {
    question: "What tokens and wallets are supported?",
    answer:
      "IRIS currently supports popular SPL tokens including SOL, USDC, USDT, BONK, and more. Wallets supported at launch include Phantom, Backpack, Solflare, Ledger, and other Solana-compatible wallet providers. More integrations are planned through our SDK.",
  },
  {
    question: "Is this platform open-source?",
    answer:
      "Yes. IRIS promotes transparency and community trust. Our smart contracts, scoring algorithms, and core protocol logic are open-sourced on GitHub under an MIT license. Community contributors are welcome to audit, fork, or build upon IRIS modules.",
  },
];

export default function FAQPage() {
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
                <HelpCircle className="h-10 w-10 text-iris-purple" />
              </div>
            </div>
          </div>

          <motion.h1
            className="text-4xl font-orbitron font-bold text-white text-center mb-6 glow-border"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Frequently Asked Questions
          </motion.h1>

          <motion.p
            className="text-muted-foreground text-lg text-center mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Got questions about IRIS Protocol? Find answers to the most common
            questions below.
          </motion.p>

          <Card className="glass-card border-none shadow-lg">
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                  >
                    <AccordionItem
                      value={`item-${index}`}
                      className="border-b border-iris-purple/10"
                    >
                      <AccordionTrigger className="text-white font-semibold hover:text-iris-purple-light">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <motion.div
            className="mt-10 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-muted-foreground">
              Don&apos;t see your question here? Reach out to our community on
              Discord or send us an email.
            </p>
          </motion.div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
