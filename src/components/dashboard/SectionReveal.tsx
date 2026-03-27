'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'

export default function SectionReveal({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      // Animate on mount (fires on every tab switch due to key={activeTab} remount)
      gsap.fromTo(
        sectionRef.current,
        {
          y: 40,
          opacity: 0,
          scale: 0.98,
          filter: 'blur(3px)',
          clipPath: 'inset(4% 2% 4% 2%)',
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 0.8,
          ease: 'power3.out',
          delay: 0.1,
        }
      )

      // Decorative top line sweep
      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.6,
            ease: 'power2.inOut',
            delay: 0.2,
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={sectionRef} className={`relative ${className}`}>
      {/* Animated reveal line at top */}
      <div
        ref={lineRef}
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4f000]/20 to-transparent origin-left"
        style={{ transformOrigin: 'left center' }}
      />
      {children}
    </div>
  )
}
