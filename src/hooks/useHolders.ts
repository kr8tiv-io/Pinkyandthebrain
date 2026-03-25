'use client'

import { useQuery } from '@tanstack/react-query'
import type { HolderResponse } from '@/lib/api/types'

export function useHolders() {
  return useQuery<HolderResponse[], Error>({
    queryKey: ['holders'],
    queryFn: async () => {
      const res = await fetch('/api/holders')
      if (!res.ok) throw new Error('Holders fetch failed')
      return res.json() as Promise<HolderResponse[]>
    },
    staleTime: 300_000,
    refetchInterval: 300_000,
  })
}
