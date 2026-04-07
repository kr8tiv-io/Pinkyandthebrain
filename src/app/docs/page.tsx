import type { Metadata } from 'next'
import DocsPage from '@/components/docs/DocsPage'

export const metadata: Metadata = {
  title: '$BRAIN Docs — Pinky and the Brain',
  description:
    'The complete guide to the $BRAIN ecosystem. Staking, reflections, governance, burns, treasury, and world domination plans.',
  openGraph: {
    title: '$BRAIN Documentation',
    description: 'Everything you need to know about the $BRAIN deflationary SPL token on Solana.',
  },
}

export default function Docs() {
  return <DocsPage />
}
