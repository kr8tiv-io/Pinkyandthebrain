// src/lib/api/birdeye.ts
// Server-side only — do NOT import in client components
// Birdeye price and OHLCV wrapper for current prices and historical candle data
// Source: https://docs.birdeye.so/reference/get-defi-price

import { BIRDEYE_BASE_URL } from '@/lib/constants'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TokenPrice {
  value: number          // USD price
  priceInNative: number  // Price in SOL (native token)
  priceChange24h: number // 24-hour change percentage
  updateUnixTime: number // Last update unix timestamp
}

export interface OHLCVCandle {
  o: number       // Open price
  h: number       // High price
  l: number       // Low price
  c: number       // Close price
  v: number       // Volume
  unixTime: number
  address: string
  type: string
}

// ─── Private helpers ──────────────────────────────────────────────────────────

/**
 * Returns required Birdeye API headers.
 * CRITICAL: The header name is X-API-KEY (uppercase) per Birdeye API docs.
 * The env var BIRDEYE_API_KEY and the HTTP header X-API-KEY are different names.
 */
function birdeyeHeaders(): Record<string, string> {
  return {
    'X-API-KEY': process.env.BIRDEYE_API_KEY!,
    'x-chain': 'solana',
  }
}

// ─── Exports ──────────────────────────────────────────────────────────────────

/**
 * Returns the current price data for a single token by mint address.
 * Cache: 60 seconds (price data).
 */
export async function getTokenPrice(mint: string): Promise<TokenPrice> {
  const res = await fetch(`${BIRDEYE_BASE_URL}/defi/price?address=${mint}`, {
    headers: birdeyeHeaders(),
    next: { revalidate: 60 },
  })
  if (!res.ok) {
    throw new Error(`Birdeye getTokenPrice failed: ${res.status} ${res.statusText}`)
  }
  const json = (await res.json()) as { success: boolean; data: TokenPrice }
  if (!json.success) {
    throw new Error(`Birdeye getTokenPrice: success=false for mint ${mint}`)
  }
  return json.data
}

/**
 * Returns current price data for multiple tokens in a single request.
 * Handles the case where some mints may be absent from the response (illiquid tokens).
 * Cache: 60 seconds.
 */
export async function getMultiTokenPrices(
  mints: string[]
): Promise<Record<string, TokenPrice>> {
  const listAddress = mints.join(',')
  const res = await fetch(
    `${BIRDEYE_BASE_URL}/defi/multi_price?list_address=${listAddress}`,
    {
      headers: birdeyeHeaders(),
      next: { revalidate: 60 },
    }
  )
  if (!res.ok) {
    throw new Error(`Birdeye getMultiTokenPrices failed: ${res.status} ${res.statusText}`)
  }
  const json = (await res.json()) as { success: boolean; data: Record<string, TokenPrice> }
  // Some mints may be missing from data (illiquid tokens) — callers should check `prices[mint] ?? null`
  return json.data ?? {}
}

/**
 * Returns OHLCV candle data for a token over a time range.
 * BOTH time_from and time_to are required — omitting either causes a 400 error.
 * Cache: 300 seconds (historical data changes less frequently).
 */
export async function getOHLCV(
  mint: string,
  timeFrom: number,
  timeTo: number,
  type: '1m' | '3m' | '5m' | '15m' | '30m' | '1H' | '2H' | '4H' | '6H' | '8H' | '12H' | '1D' | '3D' | '1W' | '1M' = '1D'
): Promise<OHLCVCandle[]> {
  const url = new URL(`${BIRDEYE_BASE_URL}/defi/v3/ohlcv`)
  url.searchParams.set('address', mint)
  url.searchParams.set('type', type)
  url.searchParams.set('time_from', String(timeFrom))
  url.searchParams.set('time_to', String(timeTo))

  const res = await fetch(url.toString(), {
    headers: birdeyeHeaders(),
    next: { revalidate: 300 },
  })
  if (!res.ok) {
    throw new Error(`Birdeye getOHLCV failed: ${res.status} ${res.statusText}`)
  }
  const json = (await res.json()) as {
    success: boolean
    data?: { items?: OHLCVCandle[] }
  }
  return json.data?.items ?? []
}

/**
 * Finds the closest historical price (close price) for a token at a given unix timestamp.
 * Fetches 1-hour candles in a 48-hour window centered on the target timestamp.
 * Returns null if no candle data is found.
 */
export async function getPriceAtTimestamp(
  mint: string,
  timestampSeconds: number
): Promise<number | null> {
  const timeFrom = timestampSeconds - 86400  // 24 hours before
  const timeTo = timestampSeconds + 86400    // 24 hours after

  const candles = await getOHLCV(mint, timeFrom, timeTo, '1H')
  if (candles.length === 0) return null

  // Find the candle whose unixTime is closest to our target timestamp
  const closest = candles.reduce((best, candle) =>
    Math.abs(candle.unixTime - timestampSeconds) <
    Math.abs(best.unixTime - timestampSeconds)
      ? candle
      : best
  )

  return closest.c // close price
}
