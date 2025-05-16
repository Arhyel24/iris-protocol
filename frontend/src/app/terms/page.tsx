"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsClient() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const termsItems = [
  {
    title: "Non-Custodial Use",
    content:
      "IRIS operates in a fully non-custodial manner. At no point does IRIS have access to, nor can it control, your private keys or digital assets. All transactions and risk responses are executed directly from your connected wallet with your explicit approval.",
  },
  {
    title: "No Financial Advice",
    content:
      "The services, data models, and insights provided by IRIS are for informational and educational purposes only. Nothing on this platform constitutes financial, investment, or legal advice. Users should consult a licensed financial advisor before making investment decisions.",
  },
  {
    title: "Protocol Risk",
    content:
      "You acknowledge and accept the inherent risks involved in using blockchain technology, including but not limited to smart contract vulnerabilities, oracle failures, front-running attacks, and unexpected protocol behavior. These risks may lead to partial or total loss of funds.",
  },
  {
    title: "AI Actions",
    content:
      "The AI-driven actions and recommendations made by IRIS are based on historical data, statistical models, and real-time signals. These are best-effort predictions and do not guarantee future outcomes. Users assume full responsibility for enabling, disabling, or customizing risk thresholds and automated actions.",
  },
  {
    title: "No Guarantee",
    content:
      "While IRIS is designed to reduce exposure to adverse events such as rug pulls, sudden volatility, and whale movements, it does not guarantee complete protection or indemnification. Risk mitigation is probabilistic and cannot ensure full compensation or loss recovery.",
  },
  {
    title: "Usage Data",
    content:
      "IRIS may use on-chain wallet metadata, token behavior, and risk outcomes to improve its machine learning models and platform analytics. All data used for training purposes is anonymized, aggregated, and never sold to third parties.",
  },
  {
    title: "Changes to Terms",
    content:
      "These terms and conditions may be updated periodically to reflect changes in functionality, legal compliance, or risk posture. Continued access or usage of the IRIS platform after changes implies acceptance of the updated terms. Users are encouraged to review this section regularly.",
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
                <FileText className="h-10 w-10 text-iris-purple" />
              </div>
            </div>
          </div>

          <motion.h1
            className="text-4xl font-orbitron font-bold text-white text-center mb-6 glow-border"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Terms of Service
          </motion.h1>

          <motion.p
            className="text-muted-foreground text-lg text-center mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            By using the IRIS Protocol, you agree to the following terms:
          </motion.p>

          <Card className="glass-card border-none shadow-lg">
            <CardContent className="pt-6">
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-6"
              >
                {termsItems.map((term, index) => (
                  <motion.div
                    key={index}
                    variants={item}
                    className="border-b border-iris-purple/10 pb-6 last:border-0 last:pb-0"
                  >
                    <h3 className="text-xl font-medium text-white mb-2">
                      {term.title}
                    </h3>
                    <p className="text-muted-foreground">{term.content}</p>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 p-4 bg-iris-purple/5 border border-iris-purple/10 rounded-lg"
              >
                <p className="text-muted-foreground text-sm">
                  Last updated: April 20, 2025. The IRIS Protocol reserves the
                  right to modify these terms at any time. By continuing to use
                  the platform after changes are made, you accept the revised
                  terms.
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
