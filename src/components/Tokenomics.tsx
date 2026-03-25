"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const metrics = [
  { id: 1, title: "Burned", value: "10%", desc: "10 percent of all fees are burned." },
  { id: 2, title: "Top 100 Holders", value: "20%", desc: "20 percent of fees go to the top 100 holders." },
  { id: 3, title: "Investments", value: "30%", desc: "30 percent go towards investments." },
  { id: 4, title: "Marketing & Boosts", value: "10%", desc: "5% to marketing, 5% to Dexscreener boosts." },
  { id: 5, title: "Compounding Liquidity", value: "10%", desc: "10 percent goes towards compounding liquidity." },
  { id: 6, title: "Dev Discretion", value: "20%", desc: "20 percent to the dev as per his discretion." },
];

export default function Tokenomics() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, i) => {
        if (!card) return;

        gsap.fromTo(card,
          { y: 150, opacity: 0, rotationX: 45, scale: 0.9 },
          {
            y: 0,
            opacity: 1,
            rotationX: 0,
            scale: 1,
            duration: 1,
            ease: "back.out(1.2)",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none reverse"
            }
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full min-h-screen bg-[#1a1a1a] py-32 overflow-hidden border-t border-[#333]">
      {/* Video Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-black">
        <video
          src="/videos/blueprint-bg.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="absolute top-1/2 left-1/2 w-auto h-auto min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover mix-blend-screen opacity-30"
        />
        {/* Dark fades to blend into the section color */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/80 to-[#1a1a1a]/40" />
        <div className="absolute inset-0 opacity-10 bg-[url('/noise.gif')] mix-blend-overlay" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-24">
          <h2 className="text-[#e4ff57] font-mono tracking-widest text-sm uppercase mb-4">Phase 1: Accumulation</h2>
          <h3 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-[#cccccc]">
            The <span className="text-[#ffadad]">Blueprint</span>
          </h3>
          <p className="mt-6 text-xl text-[#cccccc]/60 max-w-2xl mx-auto font-mono">
            Every tokenomics model is a lie. Ours is just a more entertaining one. Here is exactly where the money goes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {metrics.map((m, i) => (
            <div
              key={m.id}
              ref={el => { cardsRef.current[i] = el; }}
              className="relative p-[2px] overflow-hidden group shadow-2xl rounded-sm"
            >
              {/* Spinning WebGL-style light tracer */}
              <div
                className="absolute inset-[-100%] animate-spin opacity-40 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 60%, #e4ff57 80%, #ffadad 100%)',
                  animationDuration: '6s'
                }}
              />

              {/* Inner card content */}
              <div className="relative h-full w-full bg-[#1a1a1a] p-10 flex flex-col justify-between overflow-hidden z-10 rounded-sm">
                 <div className="absolute -right-6 -top-6 text-[10rem] font-black text-white/[0.02] leading-none group-hover:text-white/[0.05] group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-700 pointer-events-none select-none">
                   0{m.id}
                 </div>

                 <div className="relative z-10">
                   <h4 className="text-2xl font-black uppercase tracking-tight text-[#cccccc] mb-2">{m.title}</h4>
                   <div className="text-6xl font-black text-[#e4ff57] mb-6 tracking-tighter drop-shadow-[0_0_10px_rgba(228,255,87,0.1)] group-hover:text-[#ffffff] group-hover:drop-shadow-[0_0_20px_rgba(255,173,173,0.4)] transition-all duration-500">{m.value}</div>
                   <p className="font-mono text-[#cccccc]/70 group-hover:text-[#cccccc] transition-colors">{m.desc}</p>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
