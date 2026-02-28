"use client";

import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export default function QuoteForm() {
    const { publicKey } = useWallet();
    const [product, setProduct] = useState("flight");
    const [coverage, setCoverage] = useState(1000);
    const [quote, setQuote] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleGetQuote = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call to backend (/api/v1/quote)
        setTimeout(() => {
            setQuote({
                premium: (coverage * 0.05).toFixed(2),
                quoteId: `qt_${Math.floor(Math.random() * 100000)}`
            });
            setLoading(false);
        }, 1000);
    };

    const handlePurchase = async () => {
        if (!publicKey) return alert("Please connect wallet first");
        // This would invoke the Anchor program `purchase_policy` instruction
        alert(`Purchasing policy with ${quote.premium} USDC. Escrowing on Solana...`);
    };

    return (
        <div className="bg-black border border-white/20 p-8 relative group">
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-primary" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-primary" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary" />

            <h2 className="text-xl font-mono font-bold text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4">
                [ Request_Quote ]
            </h2>

            <form onSubmit={handleGetQuote} className="space-y-6">
                <div className="space-y-2">
                    <label className="block text-xs font-mono text-primary uppercase tracking-widest">Select Product</label>
                    <select
                        value={product}
                        onChange={(e) => setProduct(e.target.value)}
                        className="w-full bg-black border-2 border-white/20 p-4 text-white font-mono focus:border-primary focus:ring-0 outline-none appearance-none rounded-none cursor-pointer hover:border-white/50 transition-colors"
                        style={{ backgroundImage: 'linear-gradient(45deg, transparent 50%, #00FFA3 50%), linear-gradient(135deg, #00FFA3 50%, transparent 50%)', backgroundPosition: 'calc(100% - 20px) calc(1em + 2px), calc(100% - 15px) calc(1em + 2px)', backgroundSize: '5px 5px, 5px 5px', backgroundRepeat: 'no-repeat' }}
                    >
                        <option value="flight">Flight Delay/Cancellation</option>
                        <option value="gadget">Electronic Gadget Protection</option>
                        <option value="health">Travel Health Coverage</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="block text-xs font-mono text-primary uppercase tracking-widest">Desired Coverage (USDC)</label>
                    <input
                        type="number"
                        value={coverage}
                        onChange={(e) => setCoverage(Number(e.target.value))}
                        className="w-full bg-black border-2 border-white/20 p-4 text-white font-mono focus:border-primary focus:ring-0 outline-none rounded-none hover:border-white/50 transition-colors"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-black font-mono font-bold py-4 rounded-none transition-colors uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "CALCULATING..." : "GENERATE QUOTE"}
                </button>
            </form>

            {quote && (
                <div className="mt-8 p-6 bg-primary/10 border-l-4 border-primary">
                    <h3 className="text-sm font-mono font-bold text-primary mb-4 uppercase tracking-widest">Quote Generated</h3>
                    <div className="flex justify-between items-center mb-6 font-mono">
                        <span className="text-white/70 text-sm uppercase">Premium Required:</span>
                        <span className="text-2xl font-black text-white">{quote.premium} USDC</span>
                    </div>
                    <button
                        onClick={handlePurchase}
                        className="w-full bg-primary hover:bg-white text-black font-mono font-bold py-4 transition-colors uppercase tracking-widest"
                    >
                        Sign & Escrow Premium
                    </button>
                </div>
            )}
        </div>
    );
}
