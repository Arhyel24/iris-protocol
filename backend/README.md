# 🧠 IRIS Risk Engine

> An AI-powered, real-time risk evaluation and mitigation engine designed to protect DeFi users from wallet vulnerabilities, volatile tokens, and market threats. Built on Solana, integrated into the IRIS Protocol.

---

## 📌 Overview

The **IRIS Risk Engine** is the core intelligence layer of the IRIS Protocol. It actively monitors wallet activity, asset health, and market signals to generate real-time risk scores and trigger protective actions (alerts, swaps, insurance claims). It is fully non-custodial and optimized for speed, scalability, and composability within the Solana ecosystem.

---

## 🚀 Key Features

* **Real-Time Wallet Risk Scoring**
  Continuously evaluates wallet-level and asset-level risk using historical volatility, liquidity trends, exposure concentration, and token metadata.

* **On-Chain & Off-Chain Data Pipelines**
  Combines live blockchain data with off-chain market feeds, protocol metrics, and ML predictions for holistic risk analysis.

* **Modular Protection Triggers**
  Customizable thresholds set by users or protocols that automatically trigger alerts, swaps, or insurance execution based on risk changes.

* **AI/ML-Driven Predictions**
  Integrates machine learning models trained on DeFi liquidation events, scam histories, and flash crash scenarios.

* **Event Logging & Transparency**
  All scoring actions, risk changes, and protection triggers are immutably logged for transparency and community auditing.

---

## 🔍 How It Works

```mermaid
graph TD
    A[Wallet Scan Triggered] --> B[Fetch Asset Holdings]
    B --> C[Query Historical Data (Oracles)]
    C --> D[Run ML Model for Token Risk]
    D --> E[Calculate Portfolio Exposure & Health Score]
    E --> F{Threshold Breached?}
    F -- Yes --> G[Trigger Protection Action]
    F -- No --> H[Log Risk Score, Idle]
    G --> I[Auto Swap or Insurance Claim]
```

---

## ⚙️ Architecture

### Components

| Component            | Description                                                                         |
| -------------------- | ----------------------------------------------------------------------------------- |
| **Data Ingestor**    | Gathers wallet balances, token metadata, oracle prices, protocol interactions       |
| **Risk Engine Core** | Core service that computes token risk scores and wallet health ratios               |
| **ML Model Server**  | Deployed models (e.g. LightGBM, XGBoost, custom neural nets) for anomaly prediction |
| **Trigger Engine**   | Evaluates rules and user-defined triggers to initiate actions                       |
| **Event Logger**     | On-chain record of every decision made, fully auditable                             |

---

## 📈 Risk Scoring Model

| Factor              | Description                                                       |
| ------------------- | ----------------------------------------------------------------- |
| **Volatility**      | Token price deviation over time using exponential moving variance |
| **Liquidity Depth** | Evaluation of AMM pools (Raydium, Orca) and slippage metrics      |
| **Protocol Risk**   | Oracle trust score, TVL metrics, contract age                     |
| **Token Metadata**  | Scans for honeypot flags, rug history, source code verifiability  |
| **Wallet Exposure** | Asset concentration ratio, diversification index                  |

Final wallet score is a weighted aggregation of token scores + exposure risk, mapped to tiers (Low, Medium, High, Critical).

---

## 🔐 Security Considerations

* Audited smart contracts
* Rate-limiting to prevent flash-loops or spam attacks
* AI failsafe with manual override capability
* No private keys or off-chain user data stored

---

## 📦 Integration

IRIS Risk Engine can be integrated by:

* Wallets: To offer real-time safety prompts
* Protocols: As a backend oracle to protect LPs, vaults, or trading bots
* dApps: With REST API or SDK (coming soon)

---

## 🧪 Testing

```bash
# Run full suite of unit tests
npm run test

# Test ML scoring manually
node scripts/mockRiskEval.js --wallet demoWalletAddress
```

---

## 📅 Roadmap

| Milestone                          | ETA            |
| ---------------------------------- | -------------- |
| MVP Release                        | ✅ Q2 2025      |
| Solana Oracle Integration          | 🔄 In progress |
| Insurance NFT Execution Layer      | Q3 2025        |
| SDK + REST API                     | Q4 2025        |
| Risk-as-a-Service for Institutions | Q1 2026        |

---

## 📖 Glossary

* **Critical Risk**: A wallet state that likely precedes fund loss.
* **Protection Trigger**: A user-defined rule that automatically executes protection actions.
* **Insurance NFT**: Token that defines claim coverage upon risk-based events.

---

## 👨‍💻 Maintainers

* **Enoch Philip** — Lead Developer & Architect
* [GitHub](https://github.com/arhyel24) · [Twitter](https://twitter.com/arhyel24)

---

## 📬 Contributions & Support

This repo is currently in closed alpha. For early integration requests, model tuning help, or risk dataset collaboration, contact:
📧 `iris@projectiris.xyz`
