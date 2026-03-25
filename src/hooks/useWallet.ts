'use client'

import { useQuery } from '@tanstack/react-query'
import type { WalletActivityResponse } from '@/lib/api/types'

export function useWallet(address: string) {
  return useQuery<WalletActivityResponse, Error>({
    queryKey: ['wallet', address],
    queryFn: async () => {
      const res = await fetch(`/api/wallet/${address}`)
      if (!res.ok) throw new Error('Wallet fetch failed')
      return res.json() as Promise<WalletActivityResponse>
    },
    staleTime: 300_000,
    refetchInterval: 300_000,
    enabled: !!address,
  })
}
