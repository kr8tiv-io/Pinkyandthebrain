
```
  ██████╗ ██████╗  █████╗ ██╗███╗   ██╗
  ██╔══██╗██╔══██╗██╔══██╗██║████╗  ██║
  ██████╔╝██████╔╝███████║██║██╔██╗ ██║
  ██╔══██╗██╔══██╗██╔══██║██║██║╚██╗██║
  ██████╔╝██║  ██║██║  ██║██║██║ ╚████║
  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
```

# $BRAIN — Pinky and the Brain

### *"Same thing we do every night, Pinky — try to take over the world."*

**`[ CLASSIFICATION: PUBLIC ]`** **`[ STATUS: OPERATIONAL ]`** **`[ NETWORK: SOLANA MAINNET ]`**

> A highly deflationary Solana SPL token with SOL reflections, on-chain treasury management, community governance, and a classified-ops War Room dashboard. $BRAIN is the investment fund that never sleeps.

**`Website`** [pinkyandthebrain.fun](https://pinkyandthebrain.fun) | **`Trade`** [BAGS.FM](https://bags.fm/b/7r9RJw6gWbj6s1N9pGKrdzzd5H7oK1sauuwkUDVKBAGS) | **`Chart`** [DexScreener](https://dexscreener.com/solana/7r9RJw6gWbj6s1N9pGKrdzzd5H7oK1sauuwkUDVKBAGS) | **`Explorer`** [Solscan](https://solscan.io/token/7r9RJw6gWbj6s1N9pGKrdzzd5H7oK1sauuwkUDVKBAGS)

---

## The Plan

Every great villain needs a plan. Ours has three pillars:

**Deflationary Supply** — Tokens are permanently incinerated on a regular cadence. Supply only goes one direction: down.

**SOL Reflections** — Top 100 holders receive proportional SOL distributions from treasury gains. Diamond hands get paid.

**Active Treasury** — The fund actively invests across the Solana ecosystem. Every position is tracked on-chain with full transparency. No black boxes.

---

## Token Intel

```
┌──────────────────────────────────────────────────────────────────┐
│  TOKEN              $BRAIN                                       │
│  NETWORK            Solana Mainnet                               │
│  INITIAL SUPPLY     1,000,000,000                                │
│  TYPE               Deflationary SPL Token                       │
│  LP STATUS          100% Locked                                  │
│  STAKING            Live — Tiered multiplier (1x / 2x / 3x)     │
│  GOVERNANCE         On-chain — Stake-weighted voting              │
└──────────────────────────────────────────────────────────────────┘
```

---

## Fee Distribution — The 7-Way Split

Every transaction fuels the machine. Fees are distributed on-chain via the Bags.fm Fee Share V2 program across seven categories:

| Allocation | Share | Purpose |
|:-----------|:-----:|:--------|
| Investments | 30% | Active treasury management across Solana ecosystem |
| Holders | 20% | SOL reflections to top 100 holders |
| Dev | 20% | Core development and infrastructure |
| Burn | 10% | Permanent supply reduction via incinerator |
| Liquidity | 10% | LP depth and pair stability |
| Marketing | 5% | Growth, partnerships, and outreach |
| DEX Boosts | 5% | Visibility on aggregators and DEXes |

> *"Brain, what are we going to do with all these fees?"*
> *"The same thing we do with everything, Pinky — allocate them optimally."*

---

## The War Room — Intelligence Dashboard

The War Room at `/war-room` is a full-spectrum analytics command center. Think military ops room meets DeFi terminal.

### Modules

| Module | Description |
|:-------|:------------|
| **Command Header** | Live $BRAIN price feed (USD + SOL), token info strip, navigation |
| **Treasury Intel** | Complete portfolio breakdown with per-token P&L, cost basis tracking, allocation donut ring |
| **Burn Operations** | Supply incineration tracker with animated flame timeline and fire ring visualization |
| **Reflections Intel** | SOL distribution history and reflections calculator for any wallet |
| **Holder Analytics** | Hall of Fame (top 100 holders live from chain), Hall of Shame (pixel art tribute to paper hands) |
| **Governance** | On-chain proposal creation, stake-weighted voting with radial vote wheel, results dashboard |
| **Wallet Checker** | Look up any wallet's $BRAIN position, reflection eligibility, and staking status |
| **Staking** | Stake $BRAIN for tiered multipliers (7d = 1x, 30d = 2x, 90d = 3x), claim SOL rewards, DLMM exit tracking |

### Visualizations

The War Room ships with custom data visualizations — no off-the-shelf dashboards here:

- **Donut Ring Chart** — SVG portfolio allocation ring
- **Candlestick Strip** — Compact price action display
- **Flame Timeline** — Burn event history with animated fire
- **Arc Gauge** — Radial metric displays
- **Radial Vote Wheel** — Governance voting visualization
- **Rolling Digits** — Animated number counters
- **Sparklines** — Inline trend indicators
- **Tier Pyramid** — Staking multiplier progression
- **Data Flow Particles** — Ambient data movement effects

---

## Pages

| Route | What's There |
|:------|:-------------|
| `/` | Landing page — cinematic hero with video background, particle effects, tokenomics breakdown with spinning card borders, live treasury stats, Hall of Fame, How to Buy, Roadmap |
| `/war-room` | Full intelligence dashboard (see above) |
| `/docs` | Interactive documentation — everything you need to know about $BRAIN mechanics |
| `/brand` | Brand guidelines and assets — logos, colors, usage rules |

---

## Design Philosophy

The visual identity draws from three aesthetics fused into one:

**1. Classified Documents** — Redacted text, registration marks, section numbers, diagonal hatching, `[REDACTED]` stamps

**2. Military Command Center** — Scanlines, grid backgrounds, radar sweeps, status indicators, operational readouts

**3. Retro Terminal** — JetBrains Mono, neon accents (`#d4f000` lime, `#ff9e9e` coral), noise textures, CRT glow

Every element breathes. Subtle pulse animations, mouse-tracking spotlight effects, and GSAP-powered entrance reveals give the interface a living, operational feel. This isn't a website. It's a command center.

---

## Tech Stack

```
┌─────────────────────────────────────────────────────┐
│  FRAMEWORK          Next.js 16 (App Router)         │
│  UI RUNTIME         React 19                        │
│  LANGUAGE           TypeScript 5                    │
│  STYLING            Tailwind CSS v4                 │
│  ANIMATIONS         GSAP + ScrollTrigger            │
│  CHARTS             Recharts + Custom SVG           │
│  SMOOTH SCROLL      Lenis                           │
│  DATA FETCHING      TanStack React Query v5         │
│  BLOCKCHAIN         Solana Web3.js + SPL Token      │
│  WALLET ADAPTERS    Phantom, Solflare               │
│  ANCHOR             Coral Anchor v0.31              │
│  CACHING            Upstash Redis                   │
│  TESTING            Vitest                          │
│  APIs               Helius, DexScreener, Birdeye,   │
│                     Jupiter, CoinGecko, Solscan     │
└─────────────────────────────────────────────────────┘
```

---

## On-Chain Addresses

```
TOKEN MINT          7r9RJw6gWbj6s1N9pGKrdzzd5H7oK1sauuwkUDVKBAGS
FEE SHARE PROGRAM   FEE2tBhCKAt7shrod19QttSVREUYPiyMzoku1mL1gqVK
STAKING PROGRAM     5o2uBwvKUy4oF78ziR4tEiqz59k7XBXuZBwiZFqCfca2
TREASURY            CzTn2G4uskfAC66QL1GoeSYEb3M3sUK4zxAoKDRGE4XV
LP WALLET           GcNK263XZXW3omuVQpg2wc9Rs79TsGunknz8R378w3d8
DEV WALLET          7BLHKsHRGjsTKQdZYaC3tRDeUChJ9E2XsMPpg2Tv23cf
MARKETING           3KjchVv3grS5S8YP4NfJ8XbU5gCNm9Qq86FrnnVUEB6r
INCINERATOR         1nc1nerator11111111111111111111111111111111
```

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── war-room/page.tsx           # Intelligence dashboard
│   ├── docs/page.tsx               # Interactive documentation
│   ├── brand/page.tsx              # Brand guidelines
│   └── api/
│       ├── burns/route.ts          # Burn event data
│       ├── governance/             # Proposals, voting, admin, results
│       ├── hall-of-fame/route.ts   # Top 100 holders
│       ├── holders/route.ts        # Holder analytics
│       ├── lp-fees/route.ts        # LP fee tracking
│       ├── price/route.ts          # Live price feed
│       ├── reflections/route.ts    # SOL distribution data
│       ├── staking/                # Pool state, exits
│       ├── treasury/route.ts       # Portfolio positions + P&L
│       └── wallet-check/route.ts   # Wallet lookup
├── components/
│   ├── Hero.tsx                    # Cinematic landing hero
│   ├── Tokenomics.tsx              # Fee distribution breakdown
│   ├── HallOfFame.tsx              # Top holders + Hall of Shame
│   ├── WarRoom.tsx                 # Landing page War Room preview
│   ├── Roadmap.tsx                 # Project roadmap
│   ├── HowToBuy.tsx                # Purchase guide
│   ├── Footer.tsx                  # Site footer
│   ├── docs/DocsPage.tsx           # Documentation content
│   └── dashboard/
│       ├── WarRoomShell.tsx         # Dashboard layout shell
│       ├── CommandHeader.tsx        # Price bar + nav
│       ├── TreasuryIntel.tsx        # Portfolio P&L + allocation ring
│       ├── BurnOperations.tsx       # Supply burn tracker
│       ├── ReflectionsIntel.tsx     # SOL distribution tracker
│       ├── HolderAnalytics.tsx      # Holder data + rankings
│       ├── Governance.tsx           # Proposal + voting UI
│       ├── WalletChecker.tsx        # Wallet lookup tool
│       ├── StakingSection.tsx       # Staking interface
│       ├── staking/                 # Stake forms, rewards, multipliers
│       ├── governance/              # Proposal creation, voting, results
│       └── visualizations/          # Custom chart components
└── lib/
    ├── constants.ts                # Addresses, API config, colors
    ├── investments.config.ts       # Treasury holding metadata
    ├── governance.config.ts        # Governance parameters
    ├── idl/brain_staking.json      # Anchor IDL for staking program
    ├── staking/                    # PDA derivation, formatting, constants
    └── api/                        # Helius, Birdeye, Jupiter, Solscan clients
```

---

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npx vitest
```

### Environment Variables

```env
HELIUS_API_KEY=your_helius_key
SOLSCAN_API_KEY=your_solscan_key    # optional — Helius fallback active
```

---

## Narf.

> *"Gee, Brain, what do you want to do tonight?"*
> *"The same thing we do every night, Pinky — build the most transparent DeFi fund on Solana."*

**$BRAIN** is not a meme. It's a plan. And every night, the plan gets smarter.

---

<p align="center">
  <strong>Designed and built by <a href="https://kr8tiv.io">KR8TIV</a></strong>
  <br />
  <sub><code>[ DOCUMENT END — CLASSIFICATION: PUBLIC — AUTHORIZED FOR DISTRIBUTION ]</code></sub>
</p>
