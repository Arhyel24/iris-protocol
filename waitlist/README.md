# 🌐 IRIS Protocol — Waitlist App

Welcome to the **IRIS Protocol Waitlist** — the gateway to early access and private testing of IRIS, the decentralized protection layer for your on-chain assets.

---

## 🚀 What Is This?

The **Waitlist App** is a lightweight, secure frontend that allows users to sign up for early access to the IRIS Protocol. Users can join with their Solana wallets, verify identity (optional), and reserve their place in line for exclusive testing, rewards, and updates.

---

## 🔒 Key Features

- ✅ **Wallet-based Signup** (Phantom, Backpack, etc.)
- 📨 **Supabase** used for secure, off-chain waitlist data storage
- 📫 **Email collection** for product updates & launch alerts

---

## 📁 Folder Structure

```bash
waitlist/
├── components/      # Reusable UI components (forms, modals, cards)
├── pages/           # Next.js pages (Home, Thank You, etc.)
├── lib/             # Wallet, Supabase, and Civic config
├── styles/          # TailwindCSS and global styles
└── public/          # Static assets (logos, favicons)
````

---

## 🛠️ Tech Stack

* **Next.js 15**
* **TailwindCSS** for design
* **Solana Wallet Adapter** for Phantom & others
* **Supabase** for waitlist storage
* **Civic Web3 Auth** for optional KYC
* **Framer Motion** for smooth animations

---

## 🧑‍💼 The Team

* **Enoch Philip** – Founder, Lead Developer, Blockchain Engineer
* **Dalha Lawan Dalha** – Product Designer
* **Dauda Habila** – Content Manager

---

## 📦 Getting Started

```bash
# Clone the repository
git clone https://github.com/arhyel24/irisprotocol/waitlist.git
cd waitlist

# Install dependencies
npm install

# Start the local server
npm run dev
```

---

## 🔐 Privacy & Data

* All data is stored securely in **Supabase**.
* IRIS does **not** collect private keys or off-chain tracking data.
* Wallet connections are non-custodial and user-approved only.
