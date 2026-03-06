"use client";

import { useState } from "react";

const CATEGORIES = [
  "Technical Issue",
  "Claim Dispute",
  "Policy Question",
  "Billing / Refund",
  "Feature Request",
  "Other",
];

export default function SupportPage() {
  const [category, setCategory] = useState("Technical Issue");
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  function handle(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  const inputCls =
    "w-full bg-white/5 border border-white/10 text-white text-sm px-4 py-3 placeholder-white/20 focus:outline-none focus:border-[#00FFA3] transition-colors font-mono";

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="border-b border-white/10 px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs text-[#00FFA3] uppercase tracking-widest mb-3">
            [ SUPPORT ]
          </p>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
            Contact <span className="text-[#00FFA3]">Support</span>
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {submitted ? (
          <div className="border border-[#00FFA3]/30 bg-[#00FFA3]/5 p-10 text-center">
            <p className="text-xs text-[#00FFA3] uppercase tracking-widest mb-3">
              [ TICKET RECEIVED ]
            </p>
            <p className="text-xl font-black uppercase tracking-tighter mb-2">
              We Got Your Message
            </p>
            <p className="text-sm text-white/50 mb-6">
              Our team will respond within 24 hours on business days. Check your
              email for a confirmation.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setForm({ name: "", email: "", subject: "", message: "" });
              }}
              className="border border-white/20 text-xs px-6 py-3 uppercase tracking-widest text-white/60 hover:border-white/40 hover:text-white transition-colors"
            >
              Submit Another
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-6">
            {/* Category select */}
            <div>
              <p className="text-xs text-white/30 uppercase tracking-widest mb-3">
                Category
              </p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`text-xs px-4 py-2 uppercase tracking-wide border transition-colors ${
                      category === c
                        ? "bg-[#00FFA3] text-black border-[#00FFA3]"
                        : "border-white/10 text-white/50 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-white/30 uppercase tracking-widest mb-2">
                  Name
                </p>
                <input
                  name="name"
                  required
                  value={form.name}
                  onChange={handle}
                  placeholder="Your name"
                  className={inputCls}
                />
              </div>
              <div>
                <p className="text-xs text-white/30 uppercase tracking-widest mb-2">
                  Email
                </p>
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handle}
                  placeholder="you@example.com"
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <p className="text-xs text-white/30 uppercase tracking-widest mb-2">
                Subject
              </p>
              <input
                name="subject"
                required
                value={form.subject}
                onChange={handle}
                placeholder="Brief description of your issue"
                className={inputCls}
              />
            </div>

            <div>
              <p className="text-xs text-white/30 uppercase tracking-widest mb-2">
                Message
              </p>
              <textarea
                name="message"
                required
                rows={6}
                value={form.message}
                onChange={handle}
                placeholder="Describe your issue in detail. Include your wallet address and any relevant transaction IDs."
                className={inputCls + " resize-none"}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-white/30">
                Response time: &lt; 24 hrs on business days
              </p>
              <button
                type="submit"
                className="bg-[#00FFA3] text-black text-xs px-8 py-3 uppercase tracking-widest font-bold hover:bg-white transition-colors"
              >
                Submit Ticket
              </button>
            </div>
          </form>
        )}

        {/* Info cards */}
        <div className="grid md:grid-cols-3 gap-px border border-white/10 mt-12">
          {[
            {
              label: "Response Time",
              value: "< 24 Hours",
              sub: "On business days",
            },
            {
              label: "Support Hours",
              value: "Mon – Fri",
              sub: "09:00 – 18:00 UTC",
            },
            {
              label: "Beta Priority",
              value: "All Tickets",
              sub: "Reviewed by core team",
            },
          ].map((card, i) => (
            <div key={i} className="p-6 bg-white/[0.02]">
              <p className="text-xs text-white/30 uppercase tracking-widest mb-1">
                {card.label}
              </p>
              <p className="text-sm font-bold text-[#00FFA3]">{card.value}</p>
              <p className="text-xs text-white/30 mt-1">{card.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
