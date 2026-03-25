'use client'

import { useQuery } from '@tanstack/react-query'
import type { PriceResponse } from '@/lib/api/types'

export function usePrice() {
  return useQuery<PriceResponse, Error>({
    queryKey: ['price'],
    queryFn: async () => {
      const res = await fetch('/api/price')
      if (!res.ok) throw new Error('Price fetch failed')
      return res.json() as Promise<PriceResponse>
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}
