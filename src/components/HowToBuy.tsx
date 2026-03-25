"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const steps = [
  { step: 1, action: "Acquire SOL", brain: "First, you must obtain Solana. The speed is necessary for our high-frequency accumulation framework.", pinky: "Narf! I like the fast coins! Do they come in cheese flavor?" },
  { step: 2, action: "Connect Phantom", brain: "Establish a secure cryptographic handshake with our decentralized treasury. Do not use your primary ledger.", pinky: "I'm shaking hands with the internet! Hello, internet!" },
  { step: 3, action: "Swap to $BRAIN", brain: "Execute the transaction. Your capital is now mathematically bound to our success.", pinky: "Poit! We traded shiny rocks for invisible brain bucks!" },
  { step: 4, action: "Wait for Tomorrow", brain: "Patience. The master plan requires precise orbital alignment before phase two begins.", pinky: "What are we going to do tomorrow night, Brain?" }
];

export default function HowToBuy() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      stepsRef.current.forEach((el, index) => {
        if (!el) return;

        gsap.fromTo(el,
          { x: index % 2 === 0 ? -100 : 100, opacity: 0 },
          {
            x: 0, opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 80%",
            }
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-32 bg-[#0d0d0d] text-[#ffffff] relative border-b border-[#1a1a1a]/50">
      <div className="absolute inset-0 opacity-10 bg-[url('/noise.gif')] mix-blend-overlay pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <h2 className="text-[4rem] md:text-[6.5rem] leading-[0.85] font-black tracking-tighter uppercase font-sans text-center mb-20 text-white">
          How to <span className="text-[#ffadad] drop-shadow-[4px_4px_0px_#1a1a1a]">Fund It</span>
        </h2>

        <div className="space-y-12">
          {steps.map((s, i) => (
            <div
              key={s.step}
              ref={el => { stepsRef.current[i] = el; }}
              className="group relative bg-white border-4 border-[#1a1a1a] p-8 shadow-[8px_8px_0px_#1a1a1a] hover:shadow-[12px_12px_0px_#1a1a1a] hover:-translate-y-1 transition-all duration-300"
            >
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-[#e4ff57] border-4 border-[#1a1a1a] flex items-center justify-center font-black text-2xl rotate-[-10deg] group-hover:rotate-0 transition-transform text-[#1a1a1a]">
                {s.step}
              </div>

              <h3 className="text-3xl font-black uppercase tracking-tight mb-8 border-b-4 border-[#1a1a1a] pb-4 block w-max text-[#1a1a1a]">{s.action}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Brain's Voice */}
                <div className="bg-[#0d0d0d] text-[#d4f000] p-8 border-2 border-[#d4f000] relative shadow-[4px_4px_0px_#000000] transform transition-all duration-300 group-hover:-rotate-1 group-hover:scale-[1.02] group-hover:shadow-[8px_8px_0px_#d4f000]">
                  <div className="absolute top-0 left-6 -mt-3 bg-[#0d0d0d] px-3 font-mono text-xs text-[#d4f000] font-black tracking-widest uppercase border border-[#d4f000]">
                    System: Brain.exe
                  </div>
                  <div className="flex items-center gap-2 mb-4 opacity-50">
                    <div className="w-3 h-3 rounded-full bg-[#ff3333] animate-pulse"></div>
                    <span className="font-mono text-xs uppercase">recording</span>
                  </div>
                  <p className="font-mono text-lg leading-relaxed lowercase">&gt; {s.brain}_</p>
                </div>

                {/* Pinky's Voice */}
                <div className="bg-[#fffae6] text-[#0d0d0d] p-8 border-4 border-[#0d0d0d] rounded-3xl relative shadow-[6px_6px_0px_#ff9e9e] transform transition-all duration-300 group-hover:rotate-2 group-hover:scale-[1.02] group-hover:shadow-[12px_12px_0px_#ff9e9e]">
                  <div className="absolute top-0 right-6 -mt-4 bg-[#ff9e9e] border-2 border-[#0d0d0d] px-4 py-1 font-sans text-sm font-black tracking-widest uppercase origin-bottom-left -rotate-6">
                    Pinky!
                  </div>
                  <p className="font-sans font-black text-xl leading-relaxed tracking-tight underline decoration-[#ff9e9e] decoration-4 underline-offset-4">&quot;{s.pinky}&quot;</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
