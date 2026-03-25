# Requirements: $BRAIN War Room Dashboard

## R1: Command Header
Live $BRAIN price (USD + SOL), 24h change %, market cap, total volume, LIVE pulsing indicator.

## R2: Treasury Intel
SOL balance, all SPL tokens with: name, contract, amount, current value (SOL/USD), purchase date, purchase price (SOL), USD value at purchase, gain/loss %, Bags.fm link, X account, description. "CLASSIFIED" cards for unknowns. Treasury value over time chart. Sold tokens tracking.

## R3: Burn Operations
Total $BRAIN burned from G4vH7...→1nc1nerator. % of supply burned. % burned + LP locked. Burn transactions table (date, amount, tx hash + Solscan link). "INCINERATED" visual treatment.

## R4: Fee Distribution Ledger
Visual breakdown: 10% Burned, 20% Top 100 Holders, 30% Investments, 10% Compounding Liquidity, 5% Marketing, 5% DEX Boosts, 20% Dev. Total SOL + USD per category from LP fee wallet tx history.

## R5: Reflections Terminal
Total SOL distributed as reflections. Current reflection rate. Top 100 holders table (rank, wallet, balance). Match existing Hall of Fame aesthetic.

## R6: Marketing Ops
Marketing wallet (3KjchV...) in/out/balance. Transaction log (date, amount, direction, tx hash).

## R7: Dev Discretionary
Dev wallet (7BLHKs...) labeled "DISCRETIONARY — NOT TREASURY". Simple in/out/balance + transaction log.

## R8: LP Fees
LP wallet (GcNK26...) total fees earned. Fee inflows over time chart. Feeds Fee Distribution Ledger.

## R9: API Security
All API calls via Next.js API routes. Zero keys exposed client-side. .env.local for all secrets.

## R10: Visual Consistency
Match existing site aesthetic exactly: dark bg, monospace/terminal fonts, classified doc style. Redaction loading states. Pulsing REC indicators. Copy-to-clipboard wallets. Solscan links in new tab. Mobile responsive.

## R11: Performance
Page loads with live prices within 3 seconds. 60s price refresh, 5min tx history refresh. React Query stale-while-revalidate.
