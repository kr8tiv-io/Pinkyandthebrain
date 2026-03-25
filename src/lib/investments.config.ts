import { BRAIN_TOKEN_MINT, SOL_MINT } from './constants'

export interface TreasuryHolding {
  mint: string
  symbol: string
  name: string
  purpose: string
  targetAllocation?: number
  category: 'liquidity' | 'investment' | 'reserve' | 'team'
  // Optional UI display fields
  xAccount?: string      // Twitter/X handle for the project
  bagsLink?: string      // Bags.fm URL
  description?: string   // Brief description of the holding
  soldDate?: number      // Unix timestamp if sold (for sold tokens tracking)
  soldAmount?: number    // Amount sold
}

export const TREASURY_HOLDINGS: TreasuryHolding[] = [
  {
    mint: SOL_MINT,
    symbol: 'SOL',
    name: 'Solana',
    purpose: 'Primary reserve asset for operations and liquidity',
    category: 'reserve',
    description: 'Native blockchain token — reserve asset powering all on-chain operations.',
  },
  {
    mint: BRAIN_TOKEN_MINT,
    symbol: 'BRAIN',
    name: 'Brain Token',
    purpose: 'Native project token — deflationary with SOL reflections',
    category: 'liquidity',
    description: 'Deflationary SPL token with SOL reflections distributed to LP holders.',
    xAccount: 'BrainFundSol',
  },
]

export const HOLDINGS_BY_MINT = Object.fromEntries(
  TREASURY_HOLDINGS.map(h => [h.mint, h])
) as Record<string, TreasuryHolding>
