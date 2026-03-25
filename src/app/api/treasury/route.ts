import { NextResponse } from "next/server";

const WALLET = "CzTn2G4uskfAC66QL1GoeSYEb3M3sUK4zxAoKDRGE4XV";
const TOKEN  = "7r9RJw6gWbj6s1N9pGKrdzzd5H7oK1sauuwkUDVKBAGS";

// Free public endpoints — no API key required
const SOL_RPC      = "https://api.mainnet-beta.solana.com";
const JUPITER_PRICE = "https://api.jup.ag/price/v2";

export const revalidate = 60;

async function rpc(method: string, params: unknown[]) {
  const res = await fetch(SOL_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`RPC ${method} failed: ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

export async function GET() {
  try {
    // 1. Native SOL balance + all token accounts + price in parallel
    const [balResult, tokenResult, priceResult] = await Promise.allSettled([
      // Native lamports
      rpc("getBalance", [WALLET]),
      // All SPL token accounts
      rpc("getTokenAccountsByOwner", [
        WALLET,
        { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
        { encoding: "jsonParsed" },
      ]),
      // SOL + $BRAIN price from Jupiter (both in one call)
      fetch(
        `${JUPITER_PRICE}?ids=So11111111111111111111111111111111111111112,${TOKEN}`,
        { next: { revalidate: 60 } }
      ).then(r => r.json()),
    ]);

    // ── 2. Native SOL ──────────────────────────────────────────────────────
    let nativeSol = 0;
    if (balResult.status === "fulfilled") {
      const lamports: number = balResult.value?.value ?? 0;
      nativeSol = lamports / 1_000_000_000;
    }

    // ── 3. SOL price (USD) ─────────────────────────────────────────────────
    let solPriceUsd = 0;
    let brainPriceUsd = 0;
    if (priceResult.status === "fulfilled") {
      const pd = priceResult.value?.data ?? {};
      solPriceUsd   = parseFloat(pd["So11111111111111111111111111111111111111112"]?.price ?? "0");
      brainPriceUsd = parseFloat(pd[TOKEN]?.price ?? "0");
    }

    // ── 4. SPL token value (sum → SOL) ─────────────────────────────────────
    let tokenValueInSol = 0;
    if (tokenResult.status === "fulfilled" && solPriceUsd > 0) {
      const accounts: any[] = tokenResult.value?.value ?? [];
      for (const acct of accounts) {
        const info = acct?.account?.data?.parsed?.info;
        if (!info) continue;
        const mint: string  = info.mint ?? "";
        const uiAmount: number = info.tokenAmount?.uiAmount ?? 0;
        if (uiAmount <= 0) continue;

        // Use Jupiter price for $BRAIN specifically; others ignored for now
        let tokenUsdPrice = 0;
        if (mint === TOKEN) tokenUsdPrice = brainPriceUsd;

        if (tokenUsdPrice > 0) {
          tokenValueInSol += (uiAmount * tokenUsdPrice) / solPriceUsd;
        }
      }
    }

    // ── 5. Grand total ─────────────────────────────────────────────────────
    const total = nativeSol + tokenValueInSol;
    const treasury = total > 0 ? total : null;

    // ── 6. Holder count via Solscan (optional, best-effort) ─────────────────
    let holders: number | null = null;
    try {
      const key = process.env.SOLSCAN_API_KEY;
      if (key) {
        const hRes = await fetch(
          `https://pro-api.solscan.io/v2.0/token/holders?address=${TOKEN}&page_size=1`,
          { headers: { token: key }, next: { revalidate: 60 } }
        );
        if (hRes.ok) {
          const hd = await hRes.json();
          holders = hd?.data?.total ?? hd?.total ?? null;
        }
      }
    } catch { /* holders stays null */ }

    return NextResponse.json({ treasury, holders, solPriceUsd });
  } catch (err) {
    console.error("[treasury API]", err);
    return NextResponse.json(
      { treasury: null, holders: null, error: "Fetch failed" },
      { status: 500 }
    );
  }
}
