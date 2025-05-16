# 🛡️ IRIS Protocol Frontend

**IRIS** is a decentralized risk intelligence protocol that provides real-time risk scoring, wallet protection automation, and on-chain insurance for DeFi users. This is the frontend interface of the IRIS ecosystem, built to seamlessly interact with Solana-based wallets and the IRIS backend risk engine.

---

## 🚀 Project Overview

The IRIS frontend is a responsive, secure, and scalable dApp interface enabling users to:

* Connect their Solana wallet via **Civic Auth-Web3**
* View dynamic risk scores of tokens in their portfolio
* Configure automated protections like token swaps and claims
* Purchase and manage on-chain Insurance NFTs
* Track wallet analytics and coverage history in real time

---

## 🧰 Tech Stack

* **Framework**: Next.js 14 (App Router)
* **Styling**: TailwindCSS + ShadCN/UI
* **Wallet Integration**: Civic Auth-Web3 (Solana)
* **State Management**: Zustand + Context API
* **Data Storage**: Supabase (for off-chain metadata, UI settings)
* **API Layer**: REST API to interact with the Risk Engine backend
* **Charts**: Recharts for real-time token analytics
* **Deployment**: Vercel (Preview & Production)

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

## 👨‍💻 Core Team

| Name                  | Role               | Responsibility                                                      |
| --------------------- | ------------------ | ------------------------------------------------------------------- |
| **Enoch Philip**      | Founder & Lead Dev | Fullstack, Smart Contract Logic, Frontend & Risk Engine Integration |
| **Dalha Lawan Dalha** | UI/UX Designer     | Design system, branding, user flows                                 |
| **Dauda Habila**      | Content Manager    | Documentation, FAQs, blog, and legal text                           |

---

## 🔒 Key Features

* 🔐 **Non-Custodial Architecture** – Users retain control of private keys; IRIS never stores funds.
* 🧠 **Risk-Aware AI UX** – Wallet scoring and token risk analysis in an intuitive dashboard.
* 📜 **Insurance NFT Management** – Tiered, auto-verifiable on-chain insurance tokens.
* 📈 **Live DeFi Risk Tracking** – Real-time monitoring using Oracles and custom logic.
* 🌐 **Solana Ecosystem Compatibility** – Optimized for Phantom, Backpack, and other SPL-native wallets.

---

## 📦 Folder Structure

```
/app            - App Router structure (Next.js)
/components     - Reusable UI components
/hooks          - Custom React hooks
/lib            - Utility functions and API clients
/store          - Zustand state management
/styles         - Tailwind and global styles
/public         - Static assets and logos
```

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

## 📄 Environment Variables

Ensure the following variables are set in your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
RESEND_API_KEY=
```

---

## 🧪 Running Locally

```bash
git clone https://github.com/arhyel24/iris-protocol.git
cd frontend
npm install
npm run dev
```

Then visit: `http://localhost:3000`

---

## 📦 Build & Deploy

```bash
npm run build
npm run start
```

Deployment is handled through [Vercel](https://vercel.com).
