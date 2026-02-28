"use client";

import React, { useState } from "react";

export default function ActivePolicies() {
    const [policies] = useState([
        {
            id: "pol_938472",
            product: "Flight Delay/Cancellation",
            coverage: "$1,000",
            validUntil: "2026-12-31",
            status: "Active"
        }
    ]);

    const [claiming, setClaiming] = useState<string | null>(null);

    const handleClaim = (policyId: string) => {
        setClaiming(policyId);
        setTimeout(() => {
            alert("Claim submitted to Web2 Partner. If approved, USDC will be disbursed to your wallet via the Solana Oracle.");
            setClaiming(null);
        }, 1500);
    };

    if (policies.length === 0) {
        return (
            <div className="bg-black border border-white/20 p-8 text-center font-mono text-white/50 uppercase tracking-widest border-dashed">
                <p>No active policies found in escrow.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-mono font-bold text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4">
                [ Active_Escrows ]
            </h2>

            {policies.map(policy => (
                <div key={policy.id} className="bg-black border border-white/20 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-primary transition-colors">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 mb-2 font-mono text-xs uppercase tracking-widest">
                            <span className="px-2 py-0.5 border border-primary text-primary">
                                {policy.status}
                            </span>
                            <span className="text-white/40">ID: {policy.id}</span>
                        </div>
                        <h3 className="text-xl font-black font-mono text-white uppercase tracking-tight">{policy.product}</h3>
                        <p className="text-sm font-mono text-white/60">
                            <span className="text-primary mr-1">COVERAGE:</span>{policy.coverage} <span className="mx-2 opacity-50">|</span>
                            <span className="text-primary mr-1">EXPIRES:</span>{policy.validUntil}
                        </p>
                    </div>

                    <button
                        onClick={() => handleClaim(policy.id)}
                        disabled={claiming === policy.id}
                        className="w-full md:w-auto px-8 py-4 bg-transparent border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-black font-mono font-bold uppercase tracking-widest rounded-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {claiming === policy.id ? "PROCESSING..." : "FILE CLAIM"}
                    </button>
                </div>
            ))}
        </div>
    );
}
