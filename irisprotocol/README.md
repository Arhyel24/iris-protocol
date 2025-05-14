# 🧠 IRIS Protocol

**AI-Powered Risk Engine for Solana DeFi**  
Detect wallet risk in real time. Protect assets autonomously. Build with confidence.

---

## 🚀 Overview

**IRIS** is a decentralized, non-custodial AI protocol designed to assess portfolio risk, score tokens and wallets, and automatically protect digital assets using real-time on-chain signals. Built on the Solana blockchain, IRIS gives DeFi users peace of mind through:

- Dynamic **risk scoring**
- **Auto-swap** actions to reduce exposure
- **Insurance NFTs** for on-chain coverage
- Open **SDK & API** for integrations
- Full **wallet ownership and privacy**

---

## 🔐 Why IRIS?

DeFi is volatile. Rugpulls, flash crashes, whale dumps, and liquidity drains happen every day.

**IRIS gives you:**

- 🧠 Smart AI models that assess risk across your wallet and assets
- 🔄 Auto-protective actions (like swaps or alerts) based on thresholds *you* control
- 🛡️ Claimable Insurance NFTs to cover losses for approved events
- ⚙️ Developer tools to embed risk-scoring into dApps and wallets

---

## 📊 Features

- **Real-Time Risk Engine**: Uses live token data, volatility, slippage, volume, whale behavior, and oracles.
- **Threshold-Based Actions**: Auto-swaps or alerts based on user-configured limits.
- **Insurance NFTs**: Tiered coverage with on-chain, transparent claims.
- **Non-Custodial**: You retain full wallet control. No key access or off-chain tracking.
- **Open Protocol**: Available SDK and REST API for dApps and wallet providers.

---

## 📦 Tech Stack

| Layer        | Tool / Tech         |
| ------------ | ------------------- |
| **Blockchain** | Solana, SPL Tokens   |
| **Smart Contracts** | Anchor, Rust         |
| **AI & Risk Models** | Custom ML models (Python + JS), real-time feeds |
| **Front-end** | Next.js, TailwindCSS |
| **Wallets** | Phantom, Backpack, Ledger, Solflare |
| **Storage** | IPFS, Supabase       |

---

## 🔐 Civic Auth + Supabase Integration

This project uses [Civic Web3 Auth](https://www.civic.com/) for decentralized authentication and [Supabase](https://supabase.com/) for backend services like storage and database. Here's how the integration works:

### 🧩 Overview

* **Civic Auth** handles user authentication via a Web3 wallet.
* **Supabase** is used to store user profiles and wallets.
* Civic-issued JWTs are used to authenticate Supabase client requests.
* Users are identified in Supabase by a `civic_id` (UUID from Civic), which is linked across related tables (`profiles`, `wallets`, etc.).

### ⚙️ How It Works

1. **User Signs In via Civic:**

   * The user authenticates using Civic (wallet-based login).
   * Upon success, a `user` object and JWT (`user.jwt`) are available.

2. **Supabase Client Auth:**

   * The JWT from Civic is set as the bearer token on the Supabase client.
   * This allows the app to securely read/write to Supabase as the authenticated user.

3. **User Sync with Supabase:**

   * After authentication, the app checks if the Civic user exists in the `profiles` table.
   * If not, a new profile is created using the `civic_id` as the primary identifier.
   * Wallets and other related data are also linked using `civic_id`.

4. **Database Schema:**

   * All tables that store user-specific data include a `civic_id` column.
   * This acts as a foreign key or identifier linking records to the authenticated Civic user.


### 📦 Example Tables with `civic_id`

```sql
ALTER TABLE profiles ADD COLUMN civic_id UUID;
ALTER TABLE wallets ADD COLUMN civic_id UUID;
-- Add to other user-related tables as needed
```

### 🔐 Authentication Context

The app uses a custom React Context (`AuthContext`) to:

* Manage Civic authentication state.
* Sync user profile and wallets with Supabase.
* Expose the configured Supabase client with the Civic JWT.

### ✅ Benefits

* **Web3-native login**: No email/password, just wallet-based identity.
* **Secure database access**: JWT ensures user isolation in Supabase.
* **Decentralized identity**: You don’t store sensitive user credentials.
* **Extendable**: Add logic for user roles, permissions, and more using `civic_id`.

---

## 🧪 Current Status

> **Closed Testing Phase**  
We’re currently testing the AIRX engine and UI. Smart contract deployment on Solana begins next.

✅ UI built  
✅ Quality integration complete  
✅ Waitlist launched  
🧪 Risk engine testing in progress  
🔜 Solana contracts coming soon

---

## 🧬 Team

- **Lead Developer / CEO** – Full-stack blockchain engineer and AI researcher.
- **Blockchain Developer** – Smart contracts, Solana-native, protocol architecture.
- **Graphic Designer** – Branding, UI/UX, NFTs, and marketing visuals.
- **Content Manager** – Writes documentation, campaigns, and community content.

> Backed by technical experience in DeFi, AI, and real-time analytics.

---

## 💰 Use of Funds

Funds will be allocated across:

- **Engineering** – Smart contract audits, infrastructure, AI model hosting
- **Product** – UI polish, insurance NFT contract deployment
- **Marketing** – DeFi community partnerships, bounty campaigns, influencer outreach
- **Sales & Growth** – Developer relations, API partners, support team onboarding

---

## 📄 License

MIT License.  
Feel free to audit, fork, and contribute to the IRIS Protocol.

---

## 🌐 Links

- 📘 [Whitepaper](https://yourdomain.com/whitepaper)
- 🧠 [Docs](https://yourdomain.com/docs)
- ⛓️ [Smart Contracts](https://github.com/iris-protocol/contracts)
- 📣 [Twitter](https://twitter.com/irisprotocol)
- 💬 [Discord](https://discord.gg/your-invite-code)

---

> IRIS is designed to help you stay safe in DeFi—without giving up control.
