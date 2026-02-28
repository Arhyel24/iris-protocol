import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuoteForm from "@/components/insurance/QuoteForm";
import ActivePolicies from "@/components/insurance/ActivePolicies";

export default function InsuranceDashboard() {
  return (
    <div className="min-h-screen bg-iris-dark text-white">
      <Navbar />
      <main className="mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Real-World Insurance, On-Chain
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-400 mx-auto">
            Pay for global insurance policies with USDC. Get claims paid out instantly to your Solana wallet. Powered by Qover API & Solana Escrow.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold mb-6">Get a Quote</h2>
            <QuoteForm />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-6">Your Active Policies</h2>
            <ActivePolicies />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
