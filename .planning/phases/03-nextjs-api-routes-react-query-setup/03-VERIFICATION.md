---
phase: 03-nextjs-api-routes-react-query-setup
verified: 2026-03-25T12:00:00Z
status: passed
score: 15/15 must-haves verified
re_verification: false
---

# Phase 3: Next.js API Routes & React Query Setup — Verification Report

**Phase Goal:** All API routes serving typed data and all React Query hooks wired for client consumption
**Verified:** 2026-03-25T12:00:00Z
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths — Plan 03-01 (API Routes)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | GET /api/price returns BRAIN price in USD and SOL with 24h change | VERIFIED | `src/app/api/price/route.ts` calls `getMultiTokenPrices`, constructs `PriceResponse` with `priceUsd`, `priceSol`, `priceChange24h` |
| 2 | GET /api/burns returns total burned, burn %, and transaction list | VERIFIED | `src/app/api/burns/route.ts` calls `getBurnSummary()`, returns `BurnSummaryResponse` with `totalBurned`, `burnedPct`, `transactions[]` |
| 3 | GET /api/holders returns top 100 token holders by rank | VERIFIED | `src/app/api/holders/route.ts` calls `getTop100Holders(BRAIN_TOKEN_MINT)`, returns `HolderResponse[]` |
| 4 | GET /api/wallet/{address} returns in/out/balance with transaction history | VERIFIED | `src/app/api/wallet/[address]/route.ts` uses `await params`, fetches in+out in parallel, constructs `WalletActivityResponse` |
| 5 | GET /api/lp-fees returns total fees, inflow history, and fee distribution | VERIFIED | `src/app/api/lp-fees/route.ts` calls `getLpFeeInflows()` + `getFeeDistribution()`, returns `LpFeeResponse` |
| 6 | All routes use server-side API keys only — zero NEXT_PUBLIC_ exposure | VERIFIED | grep for `process.env` and `NEXT_PUBLIC_` in `src/app/api/` returns zero matches |
| 7 | All routes return typed JSON matching types.ts interfaces | VERIFIED | Every route declares explicit type annotation (e.g., `const data: PriceResponse = {...}`) before `NextResponse.json(data)` |

### Observable Truths — Plan 03-02 (React Query Hooks)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 8 | usePrice() returns BRAIN price data with 60s auto-refresh | VERIFIED | `src/hooks/usePrice.ts` — `staleTime: 30_000`, `refetchInterval: 60_000`, queryKey `['price']`, fetches `/api/price` |
| 9 | useTreasury() returns full treasury valuations with 60s auto-refresh | VERIFIED | `src/hooks/useTreasury.ts` — `staleTime: 60_000`, `refetchInterval: 60_000`, fetches `/api/treasury` |
| 10 | useBurns() returns burn summary with 5min auto-refresh | VERIFIED | `src/hooks/useBurns.ts` — `staleTime: 300_000`, `refetchInterval: 300_000`, fetches `/api/burns` |
| 11 | useHolders() returns top 100 holders with 5min auto-refresh | VERIFIED | `src/hooks/useHolders.ts` — `staleTime: 300_000`, `refetchInterval: 300_000`, fetches `/api/holders` |
| 12 | useWallet(address) returns wallet activity for any address with 5min auto-refresh | VERIFIED | `src/hooks/useWallet.ts` — parameterized `address: string`, queryKey `['wallet', address]`, `enabled: !!address`, fetches `/api/wallet/${address}` |
| 13 | useLpFees() returns LP fee data with 5min auto-refresh | VERIFIED | `src/hooks/useLpFees.ts` — `staleTime: 300_000`, `refetchInterval: 300_000`, fetches `/api/lp-fees` |
| 14 | All hooks use React Query v5 single-object API (not deprecated 3-arg form) | VERIFIED | Every hook uses `useQuery<ResponseType, Error>({ queryKey, queryFn, staleTime, refetchInterval })` — single options object |
| 15 | No hook imports lib/api/ modules directly — all data flows through /api/ fetch calls | VERIFIED | grep for `import.*from.*@/lib/api/(birdeye|burns|solscan|reflections|treasury|helius)` in `src/hooks/` returns zero matches |

**Score:** 15/15 truths verified

---

## Required Artifacts

### Plan 03-01 Artifacts

| Artifact | Expected | Exists | Substantive | Wired | Status |
|----------|----------|--------|-------------|-------|--------|
| `src/app/api/price/route.ts` | BRAIN + SOL price endpoint | Yes | Yes (30 lines, full implementation) | Yes — exports `GET` + `revalidate` | VERIFIED |
| `src/app/api/burns/route.ts` | Burn summary endpoint | Yes | Yes (17 lines, thin proxy) | Yes — exports `GET` + `revalidate` | VERIFIED |
| `src/app/api/holders/route.ts` | Top 100 holders endpoint | Yes | Yes (18 lines, thin proxy) | Yes — exports `GET` + `revalidate` | VERIFIED |
| `src/app/api/wallet/[address]/route.ts` | Generic wallet activity endpoint | Yes | Yes (54 lines, parallel fetch + aggregation) | Yes — exports `GET` + `revalidate`, uses `await params` | VERIFIED |
| `src/app/api/lp-fees/route.ts` | LP fee inflows and distribution endpoint | Yes | Yes (32 lines, dual-function proxy) | Yes — exports `GET` + `revalidate` | VERIFIED |

### Plan 03-02 Artifacts

| Artifact | Expected | Exists | Substantive | Wired | Status |
|----------|----------|--------|-------------|-------|--------|
| `src/hooks/usePrice.ts` | Price data hook for R1 | Yes | Yes (17 lines, full useQuery implementation) | Yes — fetches `/api/price` | VERIFIED |
| `src/hooks/useTreasury.ts` | Treasury data hook for R2 | Yes | Yes (17 lines, full useQuery implementation) | Yes — fetches `/api/treasury` | VERIFIED |
| `src/hooks/useBurns.ts` | Burn data hook for R3 | Yes | Yes (17 lines, full useQuery implementation) | Yes — fetches `/api/burns` | VERIFIED |
| `src/hooks/useHolders.ts` | Holders data hook for R5 | Yes | Yes (17 lines, full useQuery implementation) | Yes — fetches `/api/holders` | VERIFIED |
| `src/hooks/useWallet.ts` | Generic wallet hook for R6, R7, R8 | Yes | Yes (18 lines, parameterized with `enabled` guard) | Yes — fetches `/api/wallet/${address}` | VERIFIED |
| `src/hooks/useLpFees.ts` | LP fees hook for R4, R8 | Yes | Yes (17 lines, full useQuery implementation) | Yes — fetches `/api/lp-fees` | VERIFIED |

---

## Key Link Verification

### Plan 03-01 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/app/api/price/route.ts` | `src/lib/api/birdeye.ts` | `getMultiTokenPrices` import | WIRED | `import { getMultiTokenPrices } from '@/lib/api/birdeye'` — function confirmed exported from birdeye.ts |
| `src/app/api/burns/route.ts` | `src/lib/api/burns.ts` | `getBurnSummary` import | WIRED | `import { getBurnSummary } from '@/lib/api/burns'` — function confirmed exported from burns.ts |
| `src/app/api/holders/route.ts` | `src/lib/api/solscan.ts` | `getTop100Holders` import | WIRED | `import { getTop100Holders } from '@/lib/api/solscan'` — function confirmed exported from solscan.ts |
| `src/app/api/wallet/[address]/route.ts` | `src/lib/api/solscan.ts` | `getAllAccountTransfers` import | WIRED | `import { getAllAccountTransfers } from '@/lib/api/solscan'` — function confirmed exported from solscan.ts |
| `src/app/api/lp-fees/route.ts` | `src/lib/api/reflections.ts` | `getLpFeeInflows` + `getFeeDistribution` imports | WIRED | `import { getLpFeeInflows, getFeeDistribution } from '@/lib/api/reflections'` — both functions confirmed exported |

### Plan 03-02 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/hooks/usePrice.ts` | `/api/price` | `fetch('/api/price')` in queryFn | WIRED | Line 10: `const res = await fetch('/api/price')` |
| `src/hooks/useTreasury.ts` | `/api/treasury` | `fetch('/api/treasury')` in queryFn | WIRED | Line 10: `const res = await fetch('/api/treasury')` |
| `src/hooks/useBurns.ts` | `/api/burns` | `fetch('/api/burns')` in queryFn | WIRED | Line 10: `const res = await fetch('/api/burns')` |
| `src/hooks/useHolders.ts` | `/api/holders` | `fetch('/api/holders')` in queryFn | WIRED | Line 10: `const res = await fetch('/api/holders')` |
| `src/hooks/useWallet.ts` | `/api/wallet/${address}` | dynamic fetch in queryFn | WIRED | Line 10: `const res = await fetch(\`/api/wallet/${address}\`)` |
| `src/hooks/useLpFees.ts` | `/api/lp-fees` | `fetch('/api/lp-fees')` in queryFn | WIRED | Line 10: `const res = await fetch('/api/lp-fees')` |

---

## Requirements Coverage

| Requirement | Plans | Description | Status | Evidence |
|-------------|-------|-------------|--------|----------|
| R1 | 03-01, 03-02 | Command Header — live BRAIN price USD + SOL, 24h change | SATISFIED | `/api/price` returns `PriceResponse`; `usePrice()` hook with 60s refresh |
| R2 | 03-01, 03-02 | Treasury Intel — SOL balance, SPL token holdings, gain/loss | SATISFIED | `/api/treasury` (pre-existing Phase 2 route); `useTreasury()` hook with 60s refresh |
| R3 | 03-01, 03-02 | Burn Operations — total burned, %, burn transactions | SATISFIED | `/api/burns` returns `BurnSummaryResponse`; `useBurns()` hook with 5min refresh |
| R4 | 03-01, 03-02 | Fee Distribution Ledger — LP fee breakdown by category | SATISFIED | `/api/lp-fees` returns `LpFeeResponse.distribution`; `useLpFees()` hook |
| R5 | 03-01, 03-02 | Reflections Terminal — top 100 holders table | SATISFIED | `/api/holders` returns `HolderResponse[]`; `useHolders()` hook with 5min refresh |
| R6 | 03-01, 03-02 | Marketing Ops — marketing wallet in/out/balance + tx log | SATISFIED | `/api/wallet/[address]` serves marketing wallet; `useWallet(MARKETING_WALLET)` |
| R7 | 03-01, 03-02 | Dev Discretionary — dev wallet in/out/balance + tx log | SATISFIED | `/api/wallet/[address]` serves dev wallet; `useWallet(DEV_WALLET)` |
| R8 | 03-01, 03-02 | LP Fees — total fees earned, fee inflows chart | SATISFIED | `/api/lp-fees` + `/api/wallet/[address]`; `useLpFees()` + `useWallet(LP_WALLET)` |
| R9 | 03-01, 03-02 | API Security — zero keys client-side, .env.local for secrets | SATISFIED | No `process.env` or `NEXT_PUBLIC_` in any route file; no lib/api imports in hooks |
| R10 | 03-01, 03-02 | Visual Consistency — Phase 3 scope is data layer only, not UI | NEEDS HUMAN | Phase 3 is data layer only; visual requirements verified in Phases 4-10. Data contract (types) in place. |
| R11 | 03-01, 03-02 | Performance — 60s price refresh, 5min tx history refresh | SATISFIED | `usePrice`/`useTreasury` have `refetchInterval: 60_000`; all tx hooks have `refetchInterval: 300_000` |

**Notes:**
- R10 (Visual Consistency) is flagged as NEEDS HUMAN because Phase 3 only builds the data layer. R10 is a UI/UX requirement fulfilled in Phases 4-13. The data contracts (types.ts) required by Phase 3 are fully in place.

---

## Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| — | — | — | None found |

No TODO/FIXME/placeholder comments, no stub implementations, no `return null`/`return {}`, no console-log-only handlers found across all 11 files (5 routes + 6 hooks).

---

## Human Verification Required

### 1. R10 Visual Consistency (Data Layer Contract)

**Test:** Confirm types.ts interfaces match what Phase 4+ UI components will need to render
**Expected:** `PriceResponse`, `BurnSummaryResponse`, `HolderResponse`, `WalletActivityResponse`, `LpFeeResponse`, `TreasuryResponse` all contain fields needed by the dashboard sections
**Why human:** UI rendering requirements (formatted numbers, visual layout) cannot be verified by examining the data layer alone. This is deferred to Phase 4-10 visual verification.

### 2. TypeScript Zero-Error Compile

**Test:** Run `npx tsc --noEmit` in the project root
**Expected:** Zero TypeScript errors across all 11 new files
**Why human:** Cannot run npm/node commands in this environment. Summary claims zero errors on first compile attempt; all type imports are confirmed present in types.ts.

---

## Summary

Phase 3 goal is fully achieved. All 5 API route handlers and all 6 React Query hooks exist, are substantive, and are correctly wired.

**API Routes (Plan 03-01):** All 5 new routes are thin proxies to Phase 2 lib/api functions. Each exports `GET` and `revalidate` as a literal number. The wallet route correctly uses the `await params` pattern required by Next.js 16. The lp-fees route calls both `getLpFeeInflows` and `getFeeDistribution` and maps inflows to drop `fromAddress` to match the `LpFeeResponse` type. No route file contains `process.env` or `NEXT_PUBLIC_` references.

**React Query Hooks (Plan 03-02):** All 6 hooks start with `'use client'`, import types exclusively from `@/lib/api/types`, use the React Query v5 single-object API, and fetch from their respective `/api/` routes. `usePrice` refreshes every 60s; `useTreasury` refreshes every 60s; all transaction hooks refresh every 5min — satisfying R11. `useWallet` is correctly parameterized with `address` in both the function signature and queryKey, with an `enabled: !!address` guard.

All 4 documented commits (68ab38f, 6128e2f, dfe6160, 5b78a29) are confirmed present in git history with the expected file additions.

---

_Verified: 2026-03-25T12:00:00Z_
_Verifier: Claude (gsd-verifier)_
