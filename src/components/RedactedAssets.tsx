"use client";

import { useRef, useEffect } from "react";
import BlueprintScene from "./BlueprintScene";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function RedactedAssets() {
  const containerRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Animate redaction bars sliding off to reveal the blueprint
      barsRef.current.forEach((bar, i) => {
        if (!bar) return;
        gsap.to(bar, {
          xPercent: i % 2 === 0 ? 110 : -110,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
            end: "bottom 60%",
            scrub: 1,
          }
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Create 8 horizontal redaction bars
  const numBars = 8;
  const bars = Array.from({ length: numBars });

  return (
    <section ref={containerRef} className="relative w-full h-[80vh] min-h-[600px] bg-[#0d0d0d] overflow-hidden border-t border-b border-[#333]/50 flex flex-col items-center justify-center">

      {/* Background 3D Scene */}
      <div className="absolute inset-0 z-0">
        <BlueprintScene />
      </div>

      {/* Redaction Bars Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col pointer-events-none overflow-hidden">
        {bars.map((_, i) => (
          <div
            key={i}
            ref={el => { barsRef.current[i] = el; }}
            className={`flex-1 w-[120%] -ml-[10%] bg-[#0d0d0d] border-y-2 border-[#1a1a1a] shadow-[0_0_20px_rgba(0,0,0,0.9)] flex items-center px-12 z-10`}
          >
             <span className="text-[#333] font-black text-2xl md:text-5xl uppercase tracking-[1em] opacity-30 select-none whitespace-nowrap hidden md:block">
                {i % 2 === 0 ? 'REDACTED // TOP SECRET // CLASSIFIED' : 'CLASSIFIED // DO NOT DISTRIBUTE // REDACTED'}
             </span>
          </div>
        ))}
      </div>

      {/* Overlay Text */}
      <div className="relative z-20 p-8 text-center pointer-events-none bg-black/60 backdrop-blur-xl border-4 border-[#333] rounded-none shadow-2xl mix-blend-screen">
        <h2 className="text-[3rem] md:text-[5rem] leading-[0.85] font-black uppercase tracking-tighter text-white mb-4">
          PHASE 1.5: <span className="text-[#ff9e9e] inline-block bg-[#1a1a1a] px-4 py-2 transform -skew-x-6 border-2 border-[#ff9e9e]">REDACTED ASSETS</span>
        </h2>
        <p className="font-mono text-xl text-[#d4f000] uppercase tracking-widest font-bold">
          "Brain said don't look. We're looking."
        </p>
      </div>

    </section>
  );
}
