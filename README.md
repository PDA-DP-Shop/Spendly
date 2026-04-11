# <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Money%20with%20Wings.png" alt="Money with Wings" width="45" height="45" /> Spendly Ecosystem

<p align="center">
  <img src="https://socialify.git.ci/PDA-DP-Shop/Spendly/image?description=1&descriptionEditable=The%20World%27s%20First%20Fully%20Encrypted%20Private%20Billing%20%26%20Expense%20Ecosystem&font=Inter&forks=1&issues=1&language=1&logo=https%3A%2F%2Fraw.githubusercontent.com%2FTarikul-Islam-Anik%2FAnimated-Fluent-Emojis%2Fmaster%2FEmojis%2FTravel%2520and%2520Places%2FStore.png&name=1&owner=1&pattern=Formal%20Invitation&pulls=1&stargazers=1&theme=Light" alt="Spendly Banner" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Security-AES--256--GCM-00C853?style=for-the-badge&logoLink=https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Shield.png" />
  <img src="https://img.shields.io/badge/Built%20With-React%20%26%20Vite-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Deployment-Cloudflare%20Pages-F38020?style=for-the-badge&logo=cloudflare" />
</p>

---

## ✨ Overview

Spendly is a dual-app ecosystem reimagining how businesses and customers interact. Built with **Privacy-First** architecture, it allows merchants to create secure bills and customers to receive them instantly via **NFC**, **QR**, or **Deep Links**—all while keeping data 100% private and encrypted at rest.

### 🏪 Spendly Shop (Merchant App)
*A high-speed billing and CRM powerhouse for the modern business owner.*
- ⚡ **30-Second Billing**: Create complex invoices with GST and discounts in seconds.
- 📡 **Multi-Channel Sending**: Beam bills via **Web NFC**, dynamic QR codes, or WhatsApp.
- 💳 **Credit Recovery**: Track customer dues with automated payment reminders.
- 📊 **Business Intelligence**: Real-time sales reports, top items, and customer analytics.

### 👤 Spendly User (Customer App)
*The ultimate private expense manager that receives bills automatically.*
- 🛡️ **Zero-Knowledge Sync**: Add expenses instantly by tapping your phone at the shop.
- 💼 **Digital Wallet**: Securely store all your receipts in one encrypted vault.
- 📈 **Smart Analytics**: Deep insights into your spending patterns with a "White Premium" UI.

---

## 🛠️ The Tech Stack

| Core | Database | Styling | Animation |
| :--- | :--- | :--- | :--- |
| **React 18** | **Dexie.js (IndexedDB)** | **Tailwind CSS** | **Framer Motion** |
| **Vite 5** | **AES-256-GCM Crypto** | **Lucide Icons** | **Lottie Flow** |

---

## 🚀 How it Works (The "Beam" Protocol)

```mermaid
sequenceDiagram
    participant Shop as 🏪 Spendly Shop
    participant User as 👤 Spendly User
    
    Shop->>Shop: Create Bill (Encrypted)
    Note over Shop,User: Sending via NFC / QR / Link
    Shop-->>User: Beam Bill Package (Base64)
    User->>User: Decode & Verify (AES-256)
    User->>User: "Bill Received" Popup
    User->>User: One-Tap Sync to Expenses
```

---

## 📦 Project Structure

```bash
Spendly/
├── apps/
│   ├── spendly-shop/      # The Merchant/Shop App (Green Theme)
│   └── spendly-user/      # The Consumer/Personal App (Indigo Theme)
├── packages/
│   └── shared/            # Shared design tokens and utilities
└── .github/workflows/     # Automated Cloudflare Deployment
```

---

## 🔧 Installation & Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/PDA-DP-Shop/Spendly.git
   cd Spendly
   ```

2. **Setup Shop App**
   ```bash
   cd apps/spendly-shop
   npm install
   npm run dev
   ```

3. **Setup User App**
   ```bash
   cd apps/spendly-user
   npm install
   npm run dev
   ```

---

## 🌐 Deployment

Both apps are configured for automatic deployment via **GitHub Actions** to **Cloudflare Pages**. 

- **Shop App:** [spendly-shop.pages.dev](https://spendly-shop.pages.dev)
- **User App:** [spendly-24hrs.pages.dev](https://spendly-24hrs.pages.dev)

> [!IMPORTANT]
> To enable CI/CD, ensure `CF_API_TOKEN` and `CF_ACCOUNT` are added to your GitHub Secrets.

---

<p align="center">
  Built with ❤️ by <b>Team Codinity</b> <br/>
  <i>"Privacy is not an option, it's a fundamental right."</i>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hand%20gestures/Writing%20Hand.png" alt="Writing Hand" width="50" height="50" />
</p>
