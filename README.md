# Pinky and The Brain | $BRAIN Fund

**Same thing we do every night, Pinky — try to take over the world.**

$BRAIN is a highly deflationary Solana SPL token with SOL reflections distributed to the top 100 holders. Built with full on-chain transparency and community governance, the $BRAIN Fund operates as an investment vehicle on the Solana blockchain.

**Live Site:** [pinkyandthebrain.fun](https://pinkyandthebrain.fun)

---

## What is $BRAIN?

$BRAIN is a community-driven investment fund token on Solana with three core mechanics:

- **Deflationary Supply** — Tokens are periodically burned, permanently reducing circulating supply
- **SOL Reflections** — Top 100 holders receive proportional SOL distributions from treasury gains
- **Active Treasury Management** — The fund actively invests in Solana ecosystem tokens, with all positions tracked transparently on-chain

### Token Details

| | |
|---|---|
| **Mint** | `7r9RJw6gWbj6s1N9pGKrdzzd5H7oK1sauuwkUDVKBAGS` |
| **Network** | Solana Mainnet |
| **Initial Supply** | 1,000,000,000 |
| **LP** | 100% Locked |

---

## The Website

A brutalist, intelligence-ops-themed web experience built with Next.js 15 and GSAP animations. Designed to evoke a classified military command center aesthetic with real-time on-chain data.

### Landing Page

- Cinematic hero with video background and particle effects
- Animated tokenomics breakdown with conic-gradient spinning card borders
- Live treasury stats with count-up animations (real Helius RPC data)
- Hall of Fame — top 100 holders pulled live from Solana
- Hall of Shame — pixel art tribute to panic sellers

### War Room (Intelligence Dashboard)

A full analytics dashboard at `/war-room` featuring:

- **Live Price Feed** — Real-time $BRAIN price in USD and SOL via DexScreener
- **Treasury Intel** — Complete portfolio breakdown with per-token P&L tracking
- **Portfolio Allocation Ring** — SVG donut chart showing fund distribution
- **Burn Operations** — Supply incineration tracker with animated fire ring
- **Active Positions** — Individual holding cards with cost basis, gain/loss, and links to BAGS.FM

All data is fetched from on-chain sources:
- **Helius RPC** — Transaction history, token accounts, parsed transfers
- **DexScreener API** — Live prices, market cap, volume
- **CoinGecko API** — Historical SOL/USD prices for cost basis calculations

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | GSAP + ScrollTrigger |
| Charts | Recharts |
| Smooth Scroll | Lenis |
| Data Fetching | TanStack React Query |
| Blockchain | Solana Web3.js, SPL Token |
| APIs | Helius, DexScreener, CoinGecko, Solscan |

---

## Design Philosophy

The visual identity draws from three aesthetics:

1. **Classified Documents** — Redacted text, registration marks, section numbers, diagonal hatching
2. **Military Command Center** — Scanlines, grid backgrounds, radar sweeps, status indicators
3. **Retro Terminal** — Monospace type (JetBrains Mono), neon accents (#d4f000 lime, #ff9e9e coral), noise textures

Every element breathes — subtle pulse animations, mouse-tracking spotlight effects, and GSAP-powered entrance reveals give the interface a living, operational feel.

---

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

```
HELIUS_API_KEY=your_helius_key
SOLSCAN_API_KEY=your_solscan_key (optional — Helius fallback active)
```

---

## Project Structure

```
src/
  app/
    page.tsx            # Landing page
    war-room/page.tsx   # Intelligence dashboard
    api/                # Data endpoints (treasury, holders, burns, price)
  components/
    Hero.tsx            # Landing hero section
    WarRoom.tsx         # Main page war room preview
    HallOfFame.tsx      # Top 100 holders + Hall of Shame
    Tokenomics.tsx      # Token distribution breakdown
    dashboard/          # War Room dashboard components
      CommandHeader.tsx   # Price bar + navigation
      TreasuryIntel.tsx   # Portfolio P&L + allocation ring
      BurnOperations.tsx  # Supply burn tracker
  lib/
    api/                # Helius, Solscan, DexScreener clients
    constants.ts        # Token addresses, wallet addresses
    investments.config.ts # Treasury holding metadata
```

---

## Links

- [DexScreener](https://dexscreener.com/solana/7r9RJw6gWbj6s1N9pGKrdzzd5H7oK1sauuwkUDVKBAGS)
- [Solscan](https://solscan.io/token/7r9RJw6gWbj6s1N9pGKrdzzd5H7oK1sauuwkUDVKBAGS)
- [BAGS.FM](https://bags.fm/b/7r9RJw6gWbj6s1N9pGKrdzzd5H7oK1sauuwkUDVKBAGS)

---

Designed and built by [KR8TIV](https://kr8tiv.io)
