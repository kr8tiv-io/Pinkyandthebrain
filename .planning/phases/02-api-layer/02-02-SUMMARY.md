---
phase: 02-api-layer
plan: "02"
subsystem: api
tags: [solana, helius, birdeye, solscan, typescript, treasury, burns, reflections, composites]

# Dependency graph
requires:
  - phase: 02-01
    provides: Foundational API wrappers (helius.ts, birdeye.ts, solscan.ts) with all typed exports

provides:
  - getTreasuryValuations() — composite SOL + SPL holdings with prices, gain/loss, metadata
  - getBurnSummary() — paginated all-time burn aggregation with burnedPct
  - getReflectionDistributions() — LP wallet outbound SOL distributions history
  - getLpFeeInflows() — LP wallet inbound SOL fee income history
  - getFeeDistribution() — pure 10/20/30/10/5/5/20 fee split computation
  - Extended TreasuryHolding interface with optional UI metadata fields

affects: [02-03-route-handlers, 03-ui-components, all Route Handlers in Phase 3]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Composite module pattern: orchestrate multiple foundational wrappers, compute derived values"
    - "Parallel enrichment: Promise.all for per-holding historical lookups"
    - "Graceful degradation: per-item try/catch so one failure doesn't fail the whole batch"
    - "Paginated aggregation: getAllTokenTransfers / getAllAccountTransfers for complete history"
    - "Decimal handling: read token_decimals from API response, never hardcoded"

key-files:
  created:
    - src/lib/api/treasury.ts
    - src/lib/api/burns.ts
    - src/lib/api/reflections.ts
  modified:
    - src/lib/investments.config.ts

key-decisions:
  - "getTreasuryValuations uses two Promise.all levels: one for initial fetches, one for per-holding enrichment"
  - "Historical price lookup failures caught per-holding — returns current valuation without crashing"
  - "Burns uses getAllTokenTransfers (paginated up to 10 pages) not single-page getTokenTransfers"
  - "burnedPct = totalBurned / (totalBurned + currentSupply) * 100 — represents % of original supply"
  - "getFeeDistribution is a pure function (no API calls) — takes totalFeeSol, returns category breakdown"
  - "Decimal conversion reads token_decimals per transfer rather than hardcoding BRAIN decimals"

patterns-established:
  - "Composite modules are what Route Handlers import — they never call foundational wrappers directly"
  - "All parallel-safe fetches use Promise.all — no sequential loops where async is safe"
  - "Missing/illiquid token prices default to 0, not errors"

requirements-completed: [R2, R3, R4, R8, R11]

# Metrics
duration: 25min
completed: 2026-03-25
---

# Phase 02 Plan 02: Composite API Functions Summary

**Three domain-specific composite modules (treasury, burns, reflections) orchestrating helius/birdeye/solscan wrappers with parallel fetching, gain/loss computation, and paginated burn/distribution aggregation**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-03-25T00:00:00Z
- **Completed:** 2026-03-25T00:25:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- `getTreasuryValuations()` fetches SOL balance + all SPL holdings with batch-priced valuations in parallel, enriches each holding with purchase date and gain/loss via parallel historical lookups
- `getBurnSummary()` aggregates ALL burn transactions via paginated fetching (up to 10 pages), reads decimals from API response, computes burnedPct from original supply
- `getReflectionDistributions()`, `getLpFeeInflows()`, and `getFeeDistribution()` provide complete LP wallet analytics and fee split breakdown for R4/R8 requirements
- Extended `TreasuryHolding` interface with optional `xAccount`, `bagsLink`, `description`, `soldDate`, `soldAmount` fields for Treasury Intel UI display

## Task Commits

Each task was committed atomically:

1. **Task 1: Enrich investments.config.ts and create treasury.ts composite** - `e7a267f` (feat)
2. **Task 2: Create burns.ts and reflections.ts composites** - `30133d5` (feat)

**Plan metadata:** _(to be added with final docs commit)_

## Files Created/Modified

- `src/lib/api/treasury.ts` - Composite treasury valuation: SOL + SPL holdings, batch prices, parallel gain/loss enrichment
- `src/lib/api/burns.ts` - Burn aggregation: paginated BRAIN burns from BURN_SOURCE → BURN_DESTINATION, burnedPct computation
- `src/lib/api/reflections.ts` - LP wallet analytics: outbound distributions, inbound fee income, pure fee split computation
- `src/lib/investments.config.ts` - Extended TreasuryHolding interface with optional UI metadata fields

## Decisions Made

- Two-level `Promise.all` in `getTreasuryValuations`: first level for SOL balance/token accounts/SOL price, second level for all per-holding historical enrichments — maximizes parallelism without sequential loops
- Per-holding `try/catch` around historical enrichment means illiquid tokens or missing Birdeye data never crash the full treasury response — returns current values with `undefined` gain/loss fields
- `burnedPct` formula uses `totalBurned / (totalBurned + currentSupply) * 100` per plan spec — represents percentage of the original total supply that has been burned
- `getFeeDistribution` kept as a pure function (no API calls) so it can be used for UI display without network overhead
- Token decimals read from `transfer.token_decimals` field in every transfer object, not hardcoded anywhere

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

- The plan's verify command (`npx tsc --noEmit src/lib/api/treasury.ts ...` targeting individual files) fails for the same pre-existing reason as in Plan 01: individual-file tsc invocation bypasses tsconfig.json path aliases (`@/`) and Next.js `fetch` extension types. The full project compile (`tsc --noEmit` with tsconfig) passes with zero errors, confirming code correctness. This is a known limitation of the verify command format, not a bug in the new code.

## User Setup Required

None — no external service configuration required beyond what was set up in Phase 1/Plan 1.

## Next Phase Readiness

- All three composite modules ready for import by Next.js Route Handlers in Phase 2 Plan 03
- Route Handlers should import from `@/lib/api/treasury`, `@/lib/api/burns`, `@/lib/api/reflections` directly
- No blockers — all composite functions compile cleanly and return fully-typed response objects

---
*Phase: 02-api-layer*
*Completed: 2026-03-25*
