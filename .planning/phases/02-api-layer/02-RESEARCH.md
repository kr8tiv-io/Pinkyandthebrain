# Phase 2: API Layer (/lib/api/) - Research

**Researched:** 2026-03-25
**Domain:** Solana RPC / Helius / Birdeye / Solscan Pro v2 / Next.js 16 server-side API proxy
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| R1 | Command Header — live $BRAIN price (USD + SOL), 24h change %, market cap, total volume | Birdeye `/defi/price` and `/defi/multi_price` endpoints documented; Birdeye returns `priceChange24h`, `value` (USD), `priceInNative` (SOL) |
| R2 | Treasury Intel — SOL balance, all SPL tokens with current value, purchase date/price, gain/loss | Helius `getBalance` + `getTokenAccounts` for balances; Birdeye OHLCV v3 for historical price lookup at purchase date; Solscan `/account/transfer` for first inbound tx date |
| R3 | Burn Operations — total $BRAIN burned, % of supply, burn tx table | Solscan `/token/transfer` filtered `from=BURN_SOURCE,to=BURN_DESTINATION`; Helius `getTokenSupply` for total supply; Enhanced Transactions for human-readable descriptions |
| R4 | Fee Distribution Ledger — 10/20/30/10/5/5/20 split SOL totals from LP fee wallet | Solscan `/account/transfer` for LP wallet inbound SOL txs; compute per-category splits client-side in treasury.ts |
| R5 | Reflections Terminal — total SOL distributed, top 100 holders | Solscan `/token/holders` with pagination for top 100; Solscan `/account/transfer` filtered by `flow=out` for LP wallet distributions |
| R6 | Marketing Ops — marketing wallet in/out/balance and tx log | Solscan `/account/transfer` for `MARKETING_WALLET`; supports `flow=in` and `flow=out` queries |
| R7 | Dev Discretionary — dev wallet in/out/balance and tx log | Solscan `/account/transfer` for `DEV_WALLET`; same pattern as R6 |
| R8 | LP Fees — total fees earned, fee inflows over time chart | Solscan `/account/transfer` for `LP_WALLET`; fee inflow data for Recharts AreaChart |
| R9 | API Security — zero keys exposed client-side, all calls via Next.js API routes | Confirmed: next.config.ts is EMPTY (no static export), full server mode; API keys in .env.local without NEXT_PUBLIC_ prefix are accessible only in Route Handlers |
| R10 | Visual Consistency — match existing aesthetic | Not a Phase 2 concern; Phase 2 builds data layer only |
| R11 | Performance — page loads with live prices within 3 seconds; 60s price refresh, 5min tx history refresh | React Query stale-while-revalidate documented; Next.js Route Handler `export const revalidate` pattern documented; Promise.allSettled for parallel fetching |
</phase_requirements>

---

## CRITICAL ARCHITECTURE CORRECTION

**Phase 1 research concluded the project uses `output: 'export'` (static). This is WRONG.**

Verified by reading `C:\Users\lucid\Desktop\Brain Website Build\next.config.ts` — it is entirely empty. No `output: 'export'`. The project runs in full Next.js server mode.

**This changes everything about Phase 2:**

| Phase 1 Research (WRONG) | Phase 2 Reality (CORRECT) |
|--------------------------|---------------------------|
| API keys must be NEXT_PUBLIC_ | API keys stay plain in .env.local — server-side only |
| All fetching must be client-side | Route Handlers proxy external APIs server-side |
| Route Handlers are build-time only | Route Handlers run live on every request |
| Can't proxy API keys | Must proxy API keys through Route Handlers |

The Phase 2 lib/api/ wrappers are **server-side only modules** called exclusively from Route Handlers in `src/app/api/*`. Client components call `/api/*` with React Query — they never touch Helius, Birdeye, or Solscan URLs directly.

---

## Summary

Phase 2 builds the server-side API abstraction layer for the $BRAIN War Room dashboard. The project runs in full Next.js 16 server mode (next.config.ts is empty — no static export), which means API keys (HELIUS_API_KEY, BIRDEYE_API_KEY, SOLSCAN_API_KEY) remain securely server-side in .env.local without NEXT_PUBLIC_ prefix. The lib/api/ files are pure TypeScript helper modules called only from Next.js Route Handlers in src/app/api/*; they never execute in the browser.

The three external APIs are already configured in .env.local and constants.ts: Helius RPC for SOL/token balances and supply data, Birdeye for current and historical token prices (OHLCV), and Solscan Pro v2 for transaction history, token transfers, and token holders. The existing treasury route.ts already demonstrates the correct pattern — plain fetch() calls inside Next.js Route Handlers with `export const revalidate`. The lib/api/ layer formalizes this with typed, reusable functions organized per data domain.

The most complex single function in Phase 2 is `getHoldingValuation()` in treasury.ts, which must: (1) fetch all SPL token accounts from the treasury wallet, (2) look up current prices for each mint via Birdeye multi_price, (3) find the first inbound transfer for each token via Solscan to determine purchase date, and (4) look up the historical SOL price at that date via Birdeye OHLCV to compute gain/loss. This requires sequential fetching (purchase date first, then historical price) and careful error handling.

**Primary recommendation:** Build each lib/api/ file as pure async TypeScript functions (no classes), import them in Route Handlers, return typed JSON. Use Promise.allSettled for parallel calls that can degrade gracefully. Do not expose API URL strings or headers outside the lib/api/ layer.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @solana/web3.js | ^1.98.4 (v1) | getBalance, getTokenSupply via RPC JSON-RPC | Already installed; v1 stable for read-only; no polyfills needed server-side |
| @solana/spl-token | ^0.4.14 | SPL token account parsing helpers | Already installed; getMint(), getAccount() for token metadata |
| next (Route Handlers) | 16.2.1 | Server-side API proxy to external APIs | Built-in; the correct pattern for this full-server project |
| date-fns | ^4.1.0 | Parse/format timestamps in API responses | Already installed; tree-shakable |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/react-query | ^5.95.2 | Client-side cache + polling of /api/* routes | Phase 3 — Route Handlers are consumed by React Query hooks |

### No Additional Libraries Needed
Phase 2 requires no new npm installs. All packages are already installed. lib/api/ wrappers use plain `fetch()` with typed response interfaces.

**Installation:** None required — all dependencies installed in Phase 1.

---

## Architecture Patterns

### Recommended File Structure for lib/api/

```
src/lib/api/
├── helius.ts         # RPC wrapper: getBalance, getTokenAccounts, getTokenSupply
├── birdeye.ts        # Price fetch: current price, multi-price, OHLCV historical
├── solscan.ts        # Transaction history, token holders, token transfers
├── treasury.ts       # Composite: combine above to compute gain/loss per holding
├── burns.ts          # Aggregate all burn transactions BURN_SOURCE → BURN_DESTINATION
└── reflections.ts    # SOL distribution transactions from LP wallet
```

**Rules for this layer:**
- All functions are `async` and server-side only
- No `'use client'` directive — these files are never imported in browser components
- Import from `@/lib/constants` for wallet addresses and base URLs
- Import `process.env.HELIUS_API_KEY` etc. directly (never NEXT_PUBLIC_ variants)
- Each file exports named async functions only (no classes, no singletons)
- All functions return typed objects or typed arrays
- All functions throw on unrecoverable errors; callers use try/catch

### Pattern 1: Helius RPC Wrapper

**What:** Thin fetch() wrapper around the Helius JSON-RPC endpoint with typed responses.

**When to use:** Any time we need SOL balance, token accounts, or token supply.

```typescript
// src/lib/api/helius.ts
// Source: Helius docs https://www.helius.dev/docs/api-reference/rpc/http/getbalance

const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`

async function rpc<T>(method: string, params: unknown[]): Promise<T> {
  const res = await fetch(HELIUS_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    next: { revalidate: 60 }, // Next.js fetch cache — 60s
  })
  if (!res.ok) throw new Error(`Helius RPC ${method} failed: ${res.status}`)
  const json = await res.json()
  if (json.error) throw new Error(`Helius RPC error: ${json.error.message}`)
  return json.result as T
}

export async function getSolBalance(wallet: string): Promise<number> {
  const result = await rpc<{ value: number }>('getBalance', [wallet])
  return result.value / 1_000_000_000 // lamports to SOL
}

export async function getTokenSupply(mint: string): Promise<bigint> {
  const result = await rpc<{ value: { amount: string; decimals: number } }>(
    'getTokenSupply',
    [mint]
  )
  return BigInt(result.value.amount)
}

export async function getTokenAccountsByOwner(owner: string): Promise<TokenAccount[]> {
  const result = await rpc<{ value: RawTokenAccount[] }>(
    'getTokenAccountsByOwner',
    [
      owner,
      { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
      { encoding: 'jsonParsed' },
    ]
  )
  return result.value.map(acct => ({
    mint: acct.account.data.parsed.info.mint,
    uiAmount: acct.account.data.parsed.info.tokenAmount.uiAmount ?? 0,
    amount: BigInt(acct.account.data.parsed.info.tokenAmount.amount),
    decimals: acct.account.data.parsed.info.tokenAmount.decimals,
  }))
}
```

### Pattern 2: Birdeye Price Wrapper

**What:** Typed fetch() wrapper for Birdeye's price and OHLCV endpoints.

**When to use:** Current prices for Command Header; historical OHLCV for purchase price lookback in Treasury Intel.

```typescript
// src/lib/api/birdeye.ts
// Source: Birdeye docs https://docs.birdeye.so/reference/get-defi-price

const BIRDEYE_BASE = 'https://public-api.birdeye.so'

function birdeyeHeaders() {
  return {
    'X-API-KEY': process.env.BIRDEYE_API_KEY!,
    'x-chain': 'solana',
  }
}

export interface TokenPrice {
  value: number          // USD price
  priceInNative: number  // SOL price
  priceChange24h: number // 24h change %
  updateUnixTime: number
}

export async function getTokenPrice(mint: string): Promise<TokenPrice> {
  const res = await fetch(
    `${BIRDEYE_BASE}/defi/price?address=${mint}`,
    { headers: birdeyeHeaders(), next: { revalidate: 60 } }
  )
  if (!res.ok) throw new Error(`Birdeye price fetch failed: ${res.status}`)
  const json = await res.json()
  if (!json.success) throw new Error('Birdeye price: success=false')
  return json.data as TokenPrice
}

export async function getMultiTokenPrices(
  mints: string[]
): Promise<Record<string, TokenPrice>> {
  const list = mints.join(',')
  const res = await fetch(
    `${BIRDEYE_BASE}/defi/multi_price?list_address=${list}`,
    { headers: birdeyeHeaders(), next: { revalidate: 60 } }
  )
  if (!res.ok) throw new Error(`Birdeye multi_price failed: ${res.status}`)
  const json = await res.json()
  return json.data as Record<string, TokenPrice>
}

export interface OHLCVCandle {
  o: number; h: number; l: number; c: number; v: number
  unixTime: number
  address: string
  type: string
}

export async function getOHLCV(
  mint: string,
  timeFrom: number,  // unix seconds
  timeTo: number,    // unix seconds
  type: '1D' | '1H' | '4H' | '1W' = '1D'
): Promise<OHLCVCandle[]> {
  const url = new URL(`${BIRDEYE_BASE}/defi/v3/ohlcv`)
  url.searchParams.set('address', mint)
  url.searchParams.set('type', type)
  url.searchParams.set('time_from', String(timeFrom))
  url.searchParams.set('time_to', String(timeTo))
  const res = await fetch(url.toString(), {
    headers: birdeyeHeaders(),
    next: { revalidate: 300 }, // 5 min cache for historical
  })
  if (!res.ok) throw new Error(`Birdeye OHLCV failed: ${res.status}`)
  const json = await res.json()
  return json.data?.items ?? []
}

// Find the closest price to a specific unix timestamp
// Used for purchase-price lookback in Treasury Intel
export async function getPriceAtTimestamp(
  mint: string,
  timestampSeconds: number
): Promise<number | null> {
  const dayBefore = timestampSeconds - 86400
  const dayAfter = timestampSeconds + 86400
  const candles = await getOHLCV(mint, dayBefore, dayAfter, '1H')
  if (candles.length === 0) return null
  const closest = candles.reduce((best, c) =>
    Math.abs(c.unixTime - timestampSeconds) < Math.abs(best.unixTime - timestampSeconds)
      ? c : best
  )
  return closest.c // close price
}
```

### Pattern 3: Solscan Pro v2 Wrapper

**What:** Typed fetch() wrapper for Solscan Pro v2 REST endpoints.

**When to use:** Transaction history, token transfers (for burn detection), token holders.

```typescript
// src/lib/api/solscan.ts
// Source: Solscan Pro API docs https://pro-api.solscan.io/pro-api-docs/v2.0

const SOLSCAN_BASE = 'https://pro-api.solscan.io/v2.0'

function solscanHeaders() {
  return { token: process.env.SOLSCAN_API_KEY! }
}

export interface Transfer {
  trans_id: string
  block_time: number    // unix timestamp
  time: string          // human-readable
  activity_type: string
  from_address: string
  to_address: string
  token_address: string
  token_decimals: number
  amount: number
  flow: 'in' | 'out'
}

export async function getAccountTransfers(
  address: string,
  options: {
    flow?: 'in' | 'out'
    token?: string
    from?: string
    to?: string
    page?: number
    page_size?: number
    from_time?: number
    to_time?: number
  } = {}
): Promise<Transfer[]> {
  const params = new URLSearchParams({ address, page_size: '50', ...Object.entries(options).reduce((acc, [k, v]) => v !== undefined ? { ...acc, [k]: String(v) } : acc, {}) })
  const res = await fetch(
    `${SOLSCAN_BASE}/account/transfer?${params}`,
    { headers: solscanHeaders(), next: { revalidate: 300 } }
  )
  if (!res.ok) throw new Error(`Solscan transfer failed: ${res.status}`)
  const json = await res.json()
  return json.data ?? []
}

export interface TokenTransfer {
  trans_id: string
  block_time: number
  from_address: string
  to_address: string
  token_address: string
  token_decimals: number
  amount: number
}

export async function getTokenTransfers(
  tokenMint: string,
  options: {
    from?: string
    to?: string
    page?: number
    page_size?: number
    from_time?: number
    to_time?: number
  } = {}
): Promise<TokenTransfer[]> {
  const params = new URLSearchParams({ address: tokenMint, page_size: '50', ...Object.entries(options).reduce((acc, [k, v]) => v !== undefined ? { ...acc, [k]: String(v) } : acc, {}) })
  const res = await fetch(
    `${SOLSCAN_BASE}/token/transfer?${params}`,
    { headers: solscanHeaders(), next: { revalidate: 300 } }
  )
  if (!res.ok) throw new Error(`Solscan token/transfer failed: ${res.status}`)
  const json = await res.json()
  return json.data ?? []
}

export interface Holder {
  address: string
  amount: number
  decimals: number
  owner: string
  rank: number
  value: number    // USD value
  percentage: number
}

export async function getTokenHolders(
  tokenMint: string,
  page = 1,
  page_size: 10 | 20 | 30 | 40 = 40
): Promise<{ total: number; items: Holder[] }> {
  const params = new URLSearchParams({
    address: tokenMint,
    page: String(page),
    page_size: String(page_size),
  })
  const res = await fetch(
    `${SOLSCAN_BASE}/token/holders?${params}`,
    { headers: solscanHeaders(), next: { revalidate: 300 } }
  )
  if (!res.ok) throw new Error(`Solscan token/holders failed: ${res.status}`)
  const json = await res.json()
  return { total: json.data?.total ?? 0, items: json.data?.items ?? [] }
}
```

### Pattern 4: Composite treasury.ts

**What:** Aggregates Helius + Birdeye + Solscan data to build per-holding valuation records.

**When to use:** /app/api/treasury/route.ts calls this to return full SPL holdings with gain/loss.

```typescript
// src/lib/api/treasury.ts

import { getSolBalance, getTokenAccountsByOwner } from './helius'
import { getMultiTokenPrices, getPriceAtTimestamp } from './birdeye'
import { getAccountTransfers } from './solscan'
import { TREASURY_WALLET, BRAIN_TOKEN_MINT } from '@/lib/constants'

export interface HoldingValuation {
  mint: string
  symbol?: string
  uiAmount: number
  currentPriceUsd: number
  currentPriceSol: number
  currentValueUsd: number
  purchaseDate?: number       // unix timestamp
  purchasePriceSol?: number   // SOL paid per token at purchase
  purchasePriceUsd?: number   // USD value at purchase per token
  costBasisUsd?: number       // total USD at purchase
  gainLossUsd?: number
  gainLossPct?: number
}

export async function getTreasuryValuations(): Promise<{
  solBalance: number
  holdings: HoldingValuation[]
  totalValueUsd: number
}> {
  const [solBalance, tokenAccounts] = await Promise.all([
    getSolBalance(TREASURY_WALLET),
    getTokenAccountsByOwner(TREASURY_WALLET),
  ])

  const nonZero = tokenAccounts.filter(t => t.uiAmount > 0)
  const mints = nonZero.map(t => t.mint)

  // Get current prices for all mints in one Birdeye call
  const prices = await getMultiTokenPrices(mints)

  const holdings: HoldingValuation[] = await Promise.all(
    nonZero.map(async (token) => {
      const price = prices[token.mint]
      const currentPriceUsd = price?.value ?? 0
      const currentPriceSol = price?.priceInNative ?? 0
      const currentValueUsd = currentPriceUsd * token.uiAmount

      // Find first inbound transfer to determine purchase date
      let purchaseDate: number | undefined
      let purchasePriceUsd: number | undefined
      let purchasePriceSol: number | undefined
      let costBasisUsd: number | undefined
      let gainLossUsd: number | undefined
      let gainLossPct: number | undefined

      try {
        const transfers = await getAccountTransfers(TREASURY_WALLET, {
          token: token.mint,
          flow: 'in',
          page_size: 50,
        })
        if (transfers.length > 0) {
          // Solscan returns desc order; last item = oldest
          const firstTx = transfers[transfers.length - 1]
          purchaseDate = firstTx.block_time

          // Look up price at purchase timestamp
          const historicalPrice = await getPriceAtTimestamp(token.mint, purchaseDate)
          if (historicalPrice !== null) {
            purchasePriceUsd = historicalPrice
            // Estimate SOL price to get SOL cost basis (need SOL price at that time too)
            costBasisUsd = historicalPrice * token.uiAmount
            gainLossUsd = currentValueUsd - costBasisUsd
            gainLossPct = costBasisUsd > 0 ? ((gainLossUsd / costBasisUsd) * 100) : undefined
          }
        }
      } catch {
        // Historical data unavailable — surface as "HISTORICAL DATA PENDING"
      }

      return {
        mint: token.mint,
        uiAmount: token.uiAmount,
        currentPriceUsd,
        currentPriceSol,
        currentValueUsd,
        purchaseDate,
        purchasePriceUsd,
        purchasePriceSol,
        costBasisUsd,
        gainLossUsd,
        gainLossPct,
      }
    })
  )

  const totalValueUsd = holdings.reduce((sum, h) => sum + h.currentValueUsd, 0)
  return { solBalance, holdings, totalValueUsd }
}
```

### Pattern 5: burns.ts — Aggregate Burn Transactions

**What:** Fetches all token transfers from BURN_SOURCE → BURN_DESTINATION and aggregates totals.

**When to use:** /app/api/burns/route.ts.

```typescript
// src/lib/api/burns.ts

import { getTokenTransfers } from './solscan'
import { getTokenSupply } from './helius'
import { BRAIN_TOKEN_MINT, BURN_SOURCE, BURN_DESTINATION } from '@/lib/constants'

export interface BurnTransaction {
  txHash: string
  timestamp: number
  amount: number   // human-readable (divided by decimals)
}

export interface BurnSummary {
  totalBurned: number      // total $BRAIN burned, human-readable
  totalSupply: number      // current total supply, human-readable
  burnedPct: number        // % of supply burned
  transactions: BurnTransaction[]
}

export async function getBurnSummary(): Promise<BurnSummary> {
  const [transfers, supplyRaw] = await Promise.all([
    getTokenTransfers(BRAIN_TOKEN_MINT, {
      from: BURN_SOURCE,
      to: BURN_DESTINATION,
      page_size: 50,
    }),
    getTokenSupply(BRAIN_TOKEN_MINT),
  ])

  const DECIMALS = 6 // $BRAIN token decimals — verify from mint metadata

  const transactions: BurnTransaction[] = transfers.map(t => ({
    txHash: t.trans_id,
    timestamp: t.block_time,
    amount: t.amount / Math.pow(10, t.token_decimals),
  }))

  const totalBurned = transactions.reduce((sum, t) => sum + t.amount, 0)
  const totalSupply = Number(supplyRaw) / Math.pow(10, DECIMALS)
  const burnedPct = totalSupply > 0 ? (totalBurned / (totalBurned + totalSupply)) * 100 : 0

  return { totalBurned, totalSupply, burnedPct, transactions }
}
```

### Pattern 6: reflections.ts — SOL Distribution Transactions

**What:** Fetches outbound SOL transfers from LP wallet to identify reflection distributions.

**When to use:** /app/api/reflections/route.ts.

```typescript
// src/lib/api/reflections.ts

import { getAccountTransfers } from './solscan'
import { LP_WALLET } from '@/lib/constants'

export interface ReflectionDistribution {
  txHash: string
  timestamp: number
  amountSol: number
}

export async function getReflectionDistributions(): Promise<{
  totalDistributedSol: number
  distributions: ReflectionDistribution[]
}> {
  const transfers = await getAccountTransfers(LP_WALLET, {
    flow: 'out',
    page_size: 50,
  })

  const distributions: ReflectionDistribution[] = transfers.map(t => ({
    txHash: t.trans_id,
    timestamp: t.block_time,
    amountSol: t.amount / 1_000_000_000, // lamports to SOL
  }))

  const totalDistributedSol = distributions.reduce((sum, d) => sum + d.amountSol, 0)
  return { totalDistributedSol, distributions }
}
```

### Pattern 7: Next.js Route Handler — How lib/api/ is consumed

**What:** Route Handlers in src/app/api/* import from lib/api/ and return JSON. This is the security layer — API keys never reach the client.

**When to use:** All War Room data is served through Route Handlers.

```typescript
// src/app/api/burns/route.ts (example — Phase 3 will build all routes)
import { NextResponse } from 'next/server'
import { getBurnSummary } from '@/lib/api/burns'

export const revalidate = 300 // 5-minute ISR cache for burn data

export async function GET() {
  try {
    const data = await getBurnSummary()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[burns API]', err)
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 })
  }
}
```

**IMPORTANT:** The existing `src/app/api/treasury/route.ts` needs to be **replaced** in Phase 3 (or upgraded here) — it currently calls public endpoints without using the lib/api/ layer, and it hardcodes the wallet address instead of importing from constants.ts.

### Anti-Patterns to Avoid

- **Importing lib/api/ files in client components:** These files use `process.env.HELIUS_API_KEY` (no NEXT_PUBLIC_) which is only available server-side. Importing in a client component will result in `undefined` keys and 401 errors.

- **Hardcoding API keys in lib/api/ files:** Keys must come from `process.env.*`. Never inline them.

- **Using await in series when parallel is safe:** `const sol = await getSolBalance(); const tokens = await getTokenAccounts()` blocks unnecessarily. Use `Promise.all([getSolBalance(), getTokenAccounts()])`.

- **Not paginating Solscan requests:** Solscan returns max 100 items per page. For wallets with many transactions, a single call will miss older data. Build pagination loops in burns.ts and reflections.ts.

- **Assuming Birdeye multi_price has data for all tokens:** New/illiquid tokens may return no entry. Always check `prices[mint] ?? null` and handle missing prices gracefully.

- **Using @solana/web3.js in lib/api/ files:** The existing constants.ts already exports HELIUS_RPC_URL. Use plain `fetch()` to the JSON-RPC endpoint. No SDK import needed for read-only data, and it avoids any potential server-side polyfill issues.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Pagination loop for Solscan | Custom recursive fetcher | Parameterized helper with page/page_size | Solscan has consistent pagination; a generic paginator serves all endpoints |
| Historical price interpolation | Custom candle LERP | Birdeye OHLCV v3 with `1H` type + closest-candle lookup | OHLCV has up to 5000 records, covers any lookback within minutes |
| Token supply calculation | Counting non-burned accounts | Helius `getTokenSupply` JSON-RPC method | Returns exact mint authority supply; burned tokens auto-reduce it |
| SOL balance lamport conversion | Custom BigInt math | Divide by `1_000_000_000` | Standard; already done correctly in existing treasury route.ts |
| Birdeye rate-limit handling | Custom throttle queue | `next: { revalidate: N }` on fetch calls | Next.js server-side fetch cache deduplicates identical requests within revalidate window |

**Key insight:** The lib/api/ layer is a thin, typed adapter between external HTTP APIs and typed TypeScript interfaces. It is NOT business logic. Keep it minimal — data transformation belongs in Route Handlers or the composite functions (treasury.ts, burns.ts).

---

## Common Pitfalls

### Pitfall 1: Solscan Token Transfer vs Account Transfer Confusion

**What goes wrong:** Burn detection fails to find transactions, or returns wrong results.

**Why it happens:** There are two separate Solscan endpoints:
- `/account/transfer` — SOL and SPL transfers for a **wallet** address, filterable by `flow`, `token`
- `/token/transfer` — SPL transfers for a **token mint** address, filterable by `from`, `to`

For burns (BURN_SOURCE → BURN_DESTINATION), use `/token/transfer?address=BRAIN_TOKEN_MINT&from=BURN_SOURCE&to=BURN_DESTINATION`.
For wallet in/out history (marketing, dev, LP), use `/account/transfer?address=WALLET_ADDRESS`.

**How to avoid:** Choose endpoint based on primary lookup key: token mint → `/token/transfer`, wallet → `/account/transfer`.

**Warning signs:** Empty results when burns are known to exist; returns transactions for wrong wallet.

### Pitfall 2: Birdeye OHLCV Requires `time_from` and `time_to`

**What goes wrong:** OHLCV call returns 400 error or empty result.

**Why it happens:** Both `time_from` and `time_to` are required for the OHLCV endpoint. Omitting either causes the request to fail.

**How to avoid:** Always compute both bounds. For purchase price lookback, use `purchaseDate - 86400` and `purchaseDate + 86400`.

**Warning signs:** HTTP 400 from Birdeye OHLCV; `data.items` is empty array.

### Pitfall 3: Solscan page_size Only Allows Specific Values

**What goes wrong:** Request fails with 400 or returns unexpected number of results.

**Why it happens:** Solscan `/token/holders` only accepts `page_size` values of 10, 20, 30, or 40. The `/account/transfer` endpoint accepts 10-100. Passing arbitrary values (e.g., 100 for holders) causes errors.

**How to avoid:** Use `page_size: 40` for holders (max allowed), `page_size: 50` for transfers (within 10-100 range).

**Warning signs:** HTTP 400 from Solscan when page_size doesn't match allowed values.

### Pitfall 4: Next.js fetch Cache Stales During Development

**What goes wrong:** Changes to external API data are not reflected in development; stale data persists.

**Why it happens:** `next: { revalidate: N }` caches fetch responses server-side. In development, the cache behaves differently but can still cache between requests.

**How to avoid:** Use `next: { revalidate: 0 }` or `cache: 'no-store'` during development if you need fresh data. Switch to proper revalidate values before production.

**Warning signs:** Price data appears frozen; burn counts don't update.

### Pitfall 5: Birdeye X-API-KEY (not BIRDEYE_API_KEY) Header Name

**What goes wrong:** Birdeye returns 401 despite key being set.

**Why it happens:** The Birdeye documentation and the existing constants.ts use different naming. The actual HTTP header name required by Birdeye is `X-API-KEY` (uppercase). The .env.local variable is named `BIRDEYE_API_KEY`. These are different things.

**How to avoid:** Always use `'X-API-KEY': process.env.BIRDEYE_API_KEY` in fetch headers. The env var name and the HTTP header name are different.

**Warning signs:** 401 responses from Birdeye despite key existing in .env.local.

### Pitfall 6: Token Decimals Must Be Fetched Dynamically

**What goes wrong:** Token amounts display wildly wrong values (e.g., showing 1,000,000x too large or too small).

**Why it happens:** Different SPL tokens have different decimal places. $BRAIN may have 6 decimals, SOL has 9, others have 0, 6, 8, or 9. Hard-coding decimals for non-SOL tokens is fragile.

**How to avoid:** Always read `token_decimals` from the Solscan transfer response or `tokenAmount.decimals` from the Helius parsed token account response. Do not hard-code decimals for non-native tokens.

**Warning signs:** Token balances appear as extremely large or small numbers; percentage calculations produce impossible values.

### Pitfall 7: Sequential vs Parallel Fetching in treasury.ts

**What goes wrong:** Treasury page takes 15+ seconds to load because holdings are fetched serially.

**Why it happens:** Treasury valuation requires per-token API calls (purchase date + historical price). If done in a loop with `await` inside, 5 holdings × 2 API calls = 10 sequential round trips.

**How to avoid:** Wrap all independent per-holding fetches in `Promise.all()`. The multi_price call fetches all current prices in one Birdeye request. Historical prices can be fetched in parallel per holding.

**Warning signs:** Treasury API route takes >10 seconds to respond; waterfall visible in browser network tab.

---

## Code Examples

Verified patterns from official API documentation and existing project code:

### Helius getBalance (JSON-RPC)
```typescript
// Source: https://helius.mintlify.app/api-reference/rpc/http/getbalance
// POST https://mainnet.helius-rpc.com/?api-key={KEY}
// Body:
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getBalance",
  "params": ["CzTn2G4uskfAC66QL1GoeSYEb3M3sUK4zxAoKDRGE4XV"]
}
// Response: { result: { context: { slot: N }, value: 1000000000 } }
// value is in lamports; divide by 1e9 for SOL
```

### Helius getTokenSupply (JSON-RPC)
```typescript
// Source: https://www.helius.dev/docs/api-reference/rpc/http/gettokensupply
// POST https://mainnet.helius-rpc.com/?api-key={KEY}
// Body:
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getTokenSupply",
  "params": ["7r9RJw6gWbj6s1N9pGKrdzzd5H7oK1sauuwkUDVKBAGS"]
}
// Response: { result: { value: { amount: "1000000000000", decimals: 6, uiAmount: 1000000 } } }
```

### Helius Enhanced Transactions by Address
```typescript
// Source: https://www.helius.dev/docs/api-reference/enhanced-transactions/gettransactionsbyaddress
// GET https://api-mainnet.helius-rpc.com/v0/addresses/{address}/transactions?api-key={KEY}
// Optional: &type=TRANSFER&limit=100&sort-order=desc
// Returns array of enhanced transaction objects with:
//   signature, timestamp, description, type, nativeTransfers[], tokenTransfers[]
```

### Birdeye Current Price
```typescript
// Source: https://docs.birdeye.so/reference/get-defi-price
// GET https://public-api.birdeye.so/defi/price?address={MINT}
// Headers: X-API-KEY: {KEY}, x-chain: solana
// Response: { success: true, data: { value: 0.0001, priceInNative: 0.0000006, priceChange24h: 5.2 } }
```

### Birdeye OHLCV v3 (Historical Price)
```typescript
// Source: https://docs.birdeye.so/reference/get-defi-v3-ohlcv
// GET https://public-api.birdeye.so/defi/v3/ohlcv
//   ?address={MINT}&type=1H&time_from={UNIX}&time_to={UNIX}
// Headers: X-API-KEY: {KEY}, x-chain: solana
// Response: { data: { items: [{ o, h, l, c, v, unixTime, address, type }] } }
// Max 5000 records per request; type 1H = 1-hour candles
```

### Solscan Token Transfers (for burn detection)
```typescript
// Source: https://pro-api.solscan.io/pro-api-docs/v2.0/reference/v2-token-transfer
// GET https://pro-api.solscan.io/v2.0/token/transfer
//   ?address={TOKEN_MINT}&from={BURN_SOURCE}&to={BURN_DESTINATION}&page_size=50
// Headers: token: {JWT_KEY}
// Response: { success: true, data: [{ trans_id, block_time, from_address, to_address, amount, token_decimals }] }
```

### Solscan Account Transfers (for wallet in/out)
```typescript
// Source: https://pro-api.solscan.io/pro-api-docs/v2.0/reference/v2-account-transfer
// GET https://pro-api.solscan.io/v2.0/account/transfer
//   ?address={WALLET}&flow=in&page_size=50
// Headers: token: {JWT_KEY}
// Response: { success: true, data: [{ trans_id, block_time, from_address, to_address, amount, flow }] }
```

### Solscan Token Holders (Top 100)
```typescript
// Source: https://pro-api.solscan.io/pro-api-docs/v2.0/reference/v2-token-holders
// GET https://pro-api.solscan.io/v2.0/token/holders
//   ?address={TOKEN_MINT}&page=1&page_size=40
// Headers: token: {JWT_KEY}
// Response: { success: true, data: { total: 12345, items: [{ address, owner, amount, decimals, rank, percentage }] } }
// NOTE: page_size only accepts 10, 20, 30, or 40
```

### Next.js Route Handler with lib/api/ (server-side proxy pattern)
```typescript
// src/app/api/burns/route.ts
import { NextResponse } from 'next/server'
import { getBurnSummary } from '@/lib/api/burns'

export const revalidate = 300 // cache 5 minutes

export async function GET() {
  try {
    const data = await getBurnSummary()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[burns API]', err)
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 })
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `export const revalidate` for ISR | Still works; also new `use cache` directive | Next.js 16 | Both patterns work; `export const revalidate = N` in Route Handler is simplest |
| `next: { revalidate: N }` on fetch | Still works | Next.js 15-16 | `next: { revalidate: 0 }` = no cache; `N` = N-second TTL |
| Route Handlers cached by default | Route Handlers NOT cached by default in Next.js 15+ | Next.js 15 | Must opt in with `export const dynamic = 'force-static'` or `export const revalidate = N` |
| Birdeye OHLCV v1 (max 1000 records) | Birdeye OHLCV v3 (max 5000 records, more intervals) | 2024 | Use `/defi/v3/ohlcv` for purchase price lookback |

**Deprecated/outdated:**
- `output: 'export'` assumption from Phase 1 Research: The next.config.ts is empty. Full server mode. All Route Handlers run live. API keys are server-side.
- Phase 1 RESEARCH.md pattern for `NEXT_PUBLIC_HELIUS_API_KEY`: This is WRONG for this project. Use plain `HELIUS_API_KEY` — accessible server-side only.
- Using Birdeye OHLCV v1 (`/defi/ohlcv`): Prefer v3 (`/defi/v3/ohlcv`) for 5x more records and sub-minute intervals.

---

## Open Questions

1. **$BRAIN Token Decimals**
   - What we know: $BRAIN mint address is `7r9RJw6gWbj6s1N9pGKrdzzd5H7oK1sauuwkUDVKBAGS`
   - What's unclear: The exact number of decimals. The `getTokenSupply` response will include it, but it should be verified before hardcoding in burns.ts
   - Recommendation: Always read decimals from the API response. In burns.ts, call `getTokenSupply` first to get `result.value.decimals` and store it as a const.

2. **Solscan Pagination for Complete Transaction History**
   - What we know: Solscan returns max 50-100 items per page; burn history could span many pages
   - What's unclear: Whether the BURN_SOURCE wallet has more than 50 burn transactions (if yes, current single-page fetch is incomplete)
   - Recommendation: Implement a paginator loop in burns.ts and reflections.ts. Fetch page 1, check if `data.length === page_size`, if so fetch next page, continue until shorter page or empty.

3. **Birdeye Free Tier Coverage for Treasury Holdings**
   - What we know: Birdeye free tier (60 rpm) covers `/defi/price`, `/defi/multi_price`, `/defi/ohlcv`, `/defi/v3/ohlcv`
   - What's unclear: Whether the existing `BIRDEYE_API_KEY` in .env.local is on the free tier or a paid tier. Some endpoints (historical_price_unix) may require a higher tier.
   - Recommendation: Start with OHLCV v3 for historical price lookback (documented as accessible). If that fails with 403, fall back to "HISTORICAL DATA PENDING".

4. **LP Wallet Fee Distribution Identification**
   - What we know: LP wallet is `GcNK263XZXW3omuVQpg2wc9Rs79TsGunknz8R378w3d8`
   - What's unclear: Whether LP fees arrive as SOL or WSOL, and whether fee distribution transactions have a distinguishable pattern vs other transfers
   - Recommendation: Fetch all inbound transfers for LP wallet and display them. Computing the 10/20/30/10/5/5/20 split is a client-side multiplication once we have the total SOL received.

5. **Enhanced Transactions API vs Solscan for Burn Verification**
   - What we know: Helius Enhanced Transactions API parses transaction types and returns `description` fields
   - What's unclear: Whether Helius correctly classifies $BRAIN → incinerator transfers as `BURN` type or `TRANSFER` type
   - Recommendation: Use Solscan `/token/transfer` with explicit `from=BURN_SOURCE&to=BURN_DESTINATION` filter as primary source. This is more reliable than transaction type parsing since incinerator burns may appear as transfers.

---

## Sources

### Primary (HIGH confidence)
- `C:\Users\lucid\Desktop\Brain Website Build\next.config.ts` — Confirmed empty; no `output: 'export'`; full server mode
- `C:\Users\lucid\Desktop\Brain Website Build\src\app\api\treasury\route.ts` — Existing pattern for Route Handler structure and Solscan auth header (`token: key`)
- `C:\Users\lucid\Desktop\Brain Website Build\src\lib\constants.ts` — Confirmed HELIUS_RPC_URL, BIRDEYE_BASE_URL, SOLSCAN_API_BASE values
- `C:\Users\lucid\Desktop\Brain Website Build\.env.local` — Confirmed all three keys: HELIUS_API_KEY, BIRDEYE_API_KEY, SOLSCAN_API_KEY (all server-side, no NEXT_PUBLIC_)
- `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` — Route Handlers not cached by default; `export const dynamic = 'force-static'` or `revalidate` to opt in
- `node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md` — `next: { revalidate: N }` on fetch, Promise.all pattern for parallel fetching
- Helius docs (https://www.helius.dev/docs/api-reference/enhanced-transactions/gettransactionsbyaddress) — GET endpoint, path param, api-key query param, optional `type` and `sort-order` filters
- Birdeye docs (https://docs.birdeye.so/reference/get-defi-price) — `X-API-KEY` header confirmed; response structure with `value`, `priceInNative`, `priceChange24h`
- Birdeye docs (https://docs.birdeye.so/reference/get-defi-v3-ohlcv) — OHLCV v3 endpoint, required `address`, `type`, `time_from`, `time_to`; max 5000 records
- Solscan Pro API docs (https://pro-api.solscan.io/pro-api-docs/v2.0/reference/v2-account-transfer) — `address`, `flow`, `token`, `from`, `to` filters; `token` auth header
- Solscan Pro API docs (https://pro-api.solscan.io/pro-api-docs/v2.0/reference/v2-token-transfer) — `address` (token mint), `from`, `to` filters
- Solscan Pro API docs (https://pro-api.solscan.io/pro-api-docs/v2.0/reference/v2-token-holders) — `page_size` restricted to 10/20/30/40

### Secondary (MEDIUM confidence)
- Helius docs (https://www.helius.dev/docs/api-reference/rpc/http/gettokensupply) — getTokenSupply returns `amount` (string) + `decimals` in result.value
- Birdeye multi_price docs (https://docs.birdeye.so/reference/get-defi-multi_price) — max 100 tokens; comma-separated `list_address` parameter
- Helius getTokenAccounts DAS API — owner parameter, token_accounts array in response with `amount`, `mint`, `owner` fields

### Tertiary (LOW confidence)
- Solscan rate limits not published publicly; existing key may be on a specific plan. Observed JWT format in .env.local suggests an existing paid plan.
- Birdeye free tier (60 rpm stated in STATE.md) — OHLCV v3 accessibility not explicitly confirmed for free tier but OHLCV endpoints are documented as publicly listed

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages already installed; verified in package.json
- Architecture: HIGH — next.config.ts confirmed empty; Route Handler pattern from existing treasury route; API endpoints verified from official docs
- Pitfalls: HIGH — Solscan endpoint distinction and page_size restrictions verified from official docs; Birdeye header name verified from docs source

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (Helius/Birdeye/Solscan API endpoints are stable; Next.js 16 Route Handler behavior verified from bundled docs)
