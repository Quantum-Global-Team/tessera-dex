# PrismaFi — Institutional Forex DEX

> Trade tokenized fiat assets with institutional precision. PrismaFi brings TradFi-grade forex to the Polkadot EVM.

## Overview

PrismaFi is a tokenized Forex DEX built on the Polkadot EVM (Moonbase Alpha). It allows users to trade synthetic fiat tokens — `tEUR`, `tGBP`, `tJPY` — against stablecoins using real-time oracle pricing.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4, shadcn/ui |
| Web3 | wagmi v2, viem, RainbowKit |
| Charts | lightweight-charts v5 |
| Oracle | Pyth Network (Hermes + Benchmarks) |
| Chain | Moonbase Alpha (Polkadot EVM) |

## Local Setup

```bash
# Install dependencies
npm install

# Copy env file and fill in values
cp .env.example .env.local

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Required Environment Variables

See `.env.example` for all required values:

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — from [cloud.walletconnect.com](https://cloud.walletconnect.com)
- `NEXT_PUBLIC_RPC_URL` — Moonbase Alpha RPC endpoint
- `NEXT_PUBLIC_PYTH_HERMES_URL` — Pyth Hermes streaming URL (default provided)
- `NEXT_PUBLIC_PYTH_BENCHMARKS_URL` — Pyth Benchmarks history URL (default provided)

## Scripts

```bash
npm run dev        # Development server (turbopack)
npm run build      # Production build
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run format     # Prettier
```
