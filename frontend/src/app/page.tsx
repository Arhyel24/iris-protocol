import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import LiveStats from "@/components/landing/LiveStats";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-black selection:bg-primary/30 selection:text-white">
      <Navbar />
      <main className="pt-[72px]"> {/* Match navbar height */}
        <Hero />
        <Features />
        {/* Keeping LiveStats for now, but wrapper styling is handled inside */}
        <div className="border-b border-white/10">
          <LiveStats />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
