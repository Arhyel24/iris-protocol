import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import LiveStats from "@/components/landing/LiveStats";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-iris-dark">
      <Navbar />
      <main className="mt-16">
        <Hero />
        <Features />
        <LiveStats />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
