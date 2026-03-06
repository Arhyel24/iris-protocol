"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "What is IRIS Protocol?",
    a: "IRIS is a settlement layer that bridges real-world insurance APIs to Solana. You pay premiums on-chain in USDC; when a claim is approved by the insurance provider, the escrow PDA releases the payout directly to your wallet.",
  },
  {
    q: "Which wallets are supported?",
    a: "IRIS currently supports Phantom and Solflare. Any Solana wallet compatible with the wallet-adapter standard will work.",
  },
  {
    q: "What insurance products are available?",
    a: "Currently in beta: Flight Insurance, Gadget Insurance, and Travel Insurance. More product types will be added as additional providers are integrated.",
  },
  {
    q: "How are premiums held?",
    a: "Premiums are locked in a non-custodial Solana PDA (Program Derived Address). IRIS never holds your funds — only the on-chain program can release them on verified claim approval.",
  },
  {
    q: "How long does a claim payout take?",
    a: "Once the insurance provider validates your claim, the escrow releases funds automatically. Typical payout time is under 2 minutes after approval.",
  },
  {
    q: "Is IRIS on mainnet?",
    a: "IRIS is currently on Solana Devnet in beta. Mainnet launch is planned for Q3 2026. Join the waitlist to be notified when it goes live.",
  },
  {
    q: "What currency is used for premiums and payouts?",
    a: "Premiums are paid in USDC (SPL token). Payouts are also in USDC. SOL is only used to cover network gas fees (~0.000005 SOL per transaction).",
  },
  {
    q: "Can I cancel my policy?",
    a: "Yes. Active policies can be cancelled directly from your dashboard. A pro-rata refund is automatically calculated and returned from the escrow PDA to your wallet.",
  },
  {
    q: "How is my claim verified?",
    a: "Claims are validated by the insurance provider's API using real-world event data (e.g. flight status databases, manufacturer records). IRIS relays the provider decision on-chain and executes the payout automatically.",
  },
  {
    q: "Who are the insurance providers?",
    a: "IRIS integrates with licensed insurance carriers via APIs. All coverage is backed by regulated carriers. Specific provider information is disclosed during the quoting step before you purchase.",
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="border-b border-white/10 px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs text-[#00FFA3] uppercase tracking-widest mb-3">
            [ FAQ ]
          </p>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
            Frequently Asked <span className="text-[#00FFA3]">Questions</span>
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="divide-y divide-white/10">
          {FAQS.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-start justify-between gap-4 py-6 text-left group"
              >
                <span className="text-sm font-bold uppercase tracking-wide group-hover:text-[#00FFA3] transition-colors">
                  {faq.q}
                </span>
                <ChevronDown
                  size={14}
                  className={`flex-shrink-0 mt-0.5 text-white/40 transition-transform ${open === i ? "rotate-180 text-[#00FFA3]" : ""}`}
                />
              </button>
              {open === i && (
                <div className="pb-6 -mt-2">
                  <p className="text-sm text-white/60 leading-relaxed border-l-2 border-[#00FFA3] pl-4">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 border border-white/10 p-8 text-center">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-3">
            Still have questions?
          </p>
          <p className="text-sm font-bold mb-4">
            Our support team is here to help
          </p>
          <a
            href="/support"
            className="inline-block border border-[#00FFA3] text-[#00FFA3] hover:bg-[#00FFA3] hover:text-black text-xs px-6 py-3 uppercase tracking-widest transition-colors"
          >
            Open Support Ticket
          </a>
        </div>
      </div>
    </div>
  );
}
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
