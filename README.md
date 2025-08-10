# sBTC Treasury Manager

**Winner of the Stacks Hackathon 2025** 🏆

The first automated treasury management system for businesses accepting sBTC payments. Combines Stripe-like payment processing with intelligent yield optimization powered by Stacks smart contracts.

## 🎯 Project Overview

sBTC Treasury Manager revolutionizes how businesses handle Bitcoin payments by:

1. **Seamless Payment Processing**: Accept sBTC payments with a Stripe-like checkout widget
2. **Automated Yield Optimization**: Smart contracts automatically deploy idle funds to DeFi protocols
3. **Intelligent Liquidity Management**: Maintain configurable liquidity thresholds while maximizing yield
4. **Real-time Dashboard**: Monitor payments, yield earnings, and treasury operations

## 🏗️ Architecture

```
├── frontend/                   # Next.js 15 + React 19 App
├── backend/                    # Node.js + Express API  
├── contracts/                  # Clarity Smart Contracts
│   ├── payment-processor.clar  # Payment handling
│   ├── treasury-manager.clar   # Liquidity optimization
│   └── yield-strategy.clar     # DeFi integrations
└── docs/                      # Documentation
```

## 🚀 Key Features

### Core MVP Features
- ✅ **sBTC Payment Processing** - Checkout widget for businesses
- ✅ **Automated Treasury Management** - Smart contract-based optimization  
- ✅ **Business Dashboard** - Real-time analytics and controls
- ✅ **Smart Contract Integration** - Three production-ready contracts

### Enhanced Features
- 📈 **Yield Strategy Management** - Multiple DeFi protocol integrations
- 🎛️ **Configurable Thresholds** - Customizable liquidity settings
- 📊 **Advanced Analytics** - Payment trends and yield projections
- 🔒 **Security First** - Enterprise-grade security measures

## 🛠️ Technical Stack

### Frontend
- **Next.js 15** with React 19 and Turbopack
- **TypeScript 5.6+** for type safety
- **Tailwind CSS v4** for styling
- **Shadcn/ui** for components
- **Stacks.js SDK** for blockchain integration

### Backend
- **Node.js 22 LTS** with Express.js
- **Prisma ORM** with PostgreSQL/SQLite
- **TypeScript** for server-side development
- **Stacks SDK** for smart contract interaction

### Blockchain
- **Clarity Language** for smart contracts
- **Stacks Blockchain** with Bitcoin finality
- **sBTC Protocol** for Bitcoin backing
- **Clarinet** for development and testing

## 📋 Quick Start

### Prerequisites
- Node.js 22 LTS
- npm or yarn
- Clarinet CLI
- Stacks wallet (for testing)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd sbtc-treasury-manager
```

2. **Install dependencies**
```bash
# Frontend
cd frontend
npm install

# Backend  
cd ../backend
npm install

# Smart Contracts
cd ../contracts
npm install
```

3. **Setup environment**
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Frontend
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local with your configuration
```

4. **Initialize database**
```bash
cd backend
npx prisma generate
npx prisma db push
```

5. **Deploy smart contracts (optional for local testing)**
```bash
cd contracts
clarinet integrate
```

### Running the Application

1. **Start backend server**
```bash
cd backend
npm run dev
# Server runs on http://localhost:3001
```

2. **Start frontend application**
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

3. **Test smart contracts**
```bash
cd contracts
clarinet check
npm test
```

## 🎮 Demo Usage

### 1. Connect Wallet
- Visit http://localhost:3000
- Click "Connect Stacks Wallet"
- Approve connection in your wallet

### 2. Access Dashboard
- Navigate to http://localhost:3000/dashboard
- View your treasury overview
- Monitor payment history

### 3. Test Payment Widget
- Visit http://localhost:3000/checkout-demo
- Enter payment amount (e.g., 0.001 sBTC)
- Complete payment through wallet

### 4. Treasury Optimization
- View automatic rebalancing in dashboard
- Configure liquidity thresholds
- Monitor yield earnings

## 📊 Smart Contract Functions

### Payment Processor (`payment-processor.clar`)
```clarity
;; Create new payment
(create-payment (business principal) (amount uint) (customer (optional principal)))

;; Confirm payment completion
(confirm-payment (payment-id uint))

;; Get payment details
(get-payment (payment-id uint))
```

### Treasury Manager (`treasury-manager.clar`)
```clarity
;; Set liquidity threshold (0-100%)
(set-liquidity-threshold (threshold uint))

;; Deposit funds to treasury
(deposit-to-treasury (amount uint))

;; Withdraw liquid funds
(withdraw-liquidity (amount uint))

;; Get treasury information
(get-treasury-info (business principal))
```

### Yield Strategy (`yield-strategy.clar`)
```clarity
;; Create new yield strategy
(create-strategy (protocol (string-ascii 50)) (allocation-percentage uint) (apy uint))

;; Deposit to yield protocol
(deposit-to-strategy (strategy-id uint) (amount uint))

;; Harvest earned yield
(harvest-yield (strategy-id uint))
```

## 🔧 API Endpoints

### Business Management
- `POST /api/businesses` - Create new business
- `GET /api/businesses/wallet/:address` - Get business by wallet
- `GET /api/businesses/:id/dashboard` - Get dashboard data
- `POST /api/businesses/:id/rebalance` - Trigger rebalancing

### Payment Processing
- `POST /api/payments/create` - Create new payment
- `GET /api/payments/business/:id` - Get business payments
- `POST /api/payments/:id/confirm` - Confirm payment
- `GET /api/payments/business/:id/analytics` - Payment analytics

## 🎯 Business Impact

### For Businesses
- **Increased Revenue**: Earn yield on idle Bitcoin holdings
- **Simplified Operations**: Automated treasury management
- **Better Cash Flow**: Maintain liquidity while earning returns
- **Easy Integration**: Stripe-like developer experience

### For the Stacks Ecosystem
- **TVL Growth**: Drives capital into Stacks DeFi protocols
- **Institutional Adoption**: Attracts business users to Stacks
- **sBTC Utility**: Real-world use case for sBTC beyond trading
- **Developer Activity**: Encourages more business applications

### Market Opportunity
- **Total Addressable Market**: $2.1T global business payments
- **Bitcoin Treasury Market**: $150B+ corporate Bitcoin holdings
- **DeFi Yield Market**: $50B+ in yield-generating protocols
- **SMB Payment Processing**: $4.7T annually

## 🔒 Security Features

### Smart Contract Security
- **Reentrancy Protection**: Checks-effects-interactions pattern
- **Access Control**: Role-based permissions
- **Input Validation**: Comprehensive parameter checking
- **Emergency Controls**: Pausable functionality

### Application Security
- **API Rate Limiting**: Prevents abuse
- **Input Sanitization**: SQL injection prevention
- **CORS Configuration**: Restricted origins
- **Environment Variables**: Secure configuration

## 🚀 Deployment

### Production Deployment

1. **Smart Contracts**
```bash
cd contracts
clarinet deployments generate --mainnet
clarinet deployments apply -p mainnet
```

2. **Backend**
```bash
cd backend
npm run build
npm start
```

3. **Frontend**
```bash
cd frontend
npm run build
npm start
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 📈 Roadmap

### Phase 1: MVP Enhancement (Current)
- [x] Core payment processing
- [x] Basic treasury management
- [x] Simple yield strategies
- [x] MVP dashboard

### Phase 2: Advanced Features (Q2 2025)
- [ ] Multi-protocol yield strategies
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] API marketplace

### Phase 3: Enterprise (Q3 2025)
- [ ] Multi-user business accounts
- [ ] Compliance tools
- [ ] White-label solutions
- [ ] Institutional custody

### Phase 4: Ecosystem (Q4 2025)
- [ ] Third-party integrations
- [ ] Plugin marketplace
- [ ] Advanced DeFi strategies
- [ ] Cross-chain support

## 📝 Documentation

- [Technical Architecture](./docs/architecture.md)
- [API Documentation](./docs/api.md)
- [Smart Contract Guide](./docs/contracts.md)
- [Deployment Guide](./docs/deployment.md)
- [Security Audit](./docs/security.md)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

## 🏆 Hackathon Submission

**Stacks Builders Challenge 2025**

- **Category**: sBTC Payment Gateway
- **Prize**: $3,000 (Winner)
- **Demo**: [Live Demo](https://sbtc-treasury.vercel.app)
- **Video**: [Demo Video](./demo-video.mp4)

### Submission Requirements
- ✅ Working MVP processing sBTC testnet transactions
- ✅ Live deployed demo
- ✅ Open-source GitHub repository
- ✅ Clear documentation
- ✅ 5-minute demo video

### What Makes This Special
1. **Beyond Basic Payments**: Goes beyond simple payment processing to provide intelligent treasury management
2. **Real Business Value**: Solves the problem of idle Bitcoin generating no returns
3. **Production Ready**: Built with enterprise-grade security and scalability
4. **Stacks Ecosystem Growth**: Directly contributes to TVL and institutional adoption

## 📞 Contact

- **Team**: Treasury Labs
- **Email**: hello@treasurylabs.dev
- **Twitter**: [@TreasuryLabs](https://twitter.com/TreasuryLabs)
- **Discord**: [Join our community](https://discord.gg/treasurylabs)

---

**Built with ❤️ for the Bitcoin and Stacks ecosystem**