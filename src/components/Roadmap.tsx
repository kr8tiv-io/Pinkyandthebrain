"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const phases = [
  { title: "Phase 1: Accumulation", desc: "Launch $BRAIN. Assert dominance. Accumulate Solana.", completed: true },
  { title: "Phase 2: Orbital Laser Calibration", desc: "Use the Treasury to fund 'research'. Totally legal research.", completed: false },
  { title: "Phase 3: The Cheese Monopoly", desc: "Strategic acquisition of all global cheese reserves.", completed: false },
  { title: "Phase 4: World Domination", desc: "We take over. You get a commemorative hat. Hat is not financial advice.", completed: false, topSecret: true },
];

export default function Roadmap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const stampsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Animate the vertical line drawing down
      gsap.to(lineRef.current, {
        height: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top center",
          end: "bottom center",
          scrub: true,
        }
      });

      // Animate each phase item and its respective stamp
      itemsRef.current.forEach((el, index) => {
        if (!el) return;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        });

        // Slide in the card
        tl.fromTo(el,
          { x: index % 2 === 0 ? -100 : 100, opacity: 0, rotationZ: index % 2 === 0 ? -5 : 5 },
          { x: 0, opacity: 1, rotationZ: 0, duration: 0.8, ease: "power3.out" }
        );

        // Slam down the stamp if it exists
        const stampEl = stampsRef.current[index];
        if (stampEl) {
          tl.fromTo(stampEl,
            { scale: 4, opacity: 0, rotationZ: -30 },
            { scale: 1, opacity: 0.8, rotationZ: -10, duration: 0.5, ease: "back.out(3)" },
            "-=0.2"
          );
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-32 bg-[#0d0d0d] text-[#ffffff] relative overflow-hidden border-t border-[#333]/50">
      <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.gif')] mix-blend-overlay pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <h2 className="text-[4rem] md:text-[6.5rem] leading-[0.85] font-black uppercase tracking-tighter text-center mb-32 text-white">
          The <span className="text-[#d4f000] drop-shadow-[4px_4px_0px_#1a1a1a]">Master Plan</span>
        </h2>

        <div className="relative">
          {/* Vertical Tracking Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-[#1a1a1a] -translate-x-1/2" />
          <div ref={lineRef} className="absolute left-1/2 top-0 h-0 w-2 bg-[#d4f000] -translate-x-1/2 shadow-[0_0_20px_#d4f000]" />

          <div className="space-y-24">
            {phases.map((phase, i) => (
              <div
                key={i}
                className={`relative flex items-center justify-between w-full ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}
              >
                {/* Empty space for alternating layout */}
                <div className="w-5/12 hidden md:block" />

                {/* Dot */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-none bg-[#0d0d0d] border-4 border-[#d4f000] z-10 hidden md:block transform rotate-45" />

                {/* Content Box (Classified Dossier Style) */}
                <div
                  ref={el => { itemsRef.current[i] = el; }}
                  className="w-full md:w-5/12 bg-[#e5e5e5] border-8 border-white p-8 md:p-10 text-left group hover:-translate-y-2 transition-transform duration-300 relative shadow-2xl overflow-hidden before:absolute before:inset-0 before:bg-[url('/paper-texture.png')] before:opacity-30 before:mix-blend-multiply before:pointer-events-none"
                >

                  {/* Decorative Header Lines */}
                  <div className="w-full flex flex-wrap justify-between items-center border-b-4 border-[#1a1a1a] pb-3 mb-6 gap-2">
                    <span className="font-mono text-xs md:text-sm font-bold text-[#1a1a1a]/80 uppercase tracking-widest bg-[#1a1a1a]/10 px-2 py-1">Dept. of Domination</span>
                    <span className="font-mono text-xs md:text-sm font-bold text-[#1a1a1a] uppercase bg-[#ff9e9e]/30 px-2 py-1">Op Ref: BRN-PHS-{i + 1}</span>
                  </div>

                  {/* Stamp Container animated by GSAP */}
                  <div ref={el => { stampsRef.current[i] = el; }} className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 overflow-visible">
                    {phase.completed && (
                      <div className="border-[8px] border-green-600 text-green-600 font-black text-5xl md:text-7xl uppercase tracking-widest px-6 py-2 mix-blend-multiply whitespace-nowrap shadow-[0_0_20px_rgba(22,163,74,0.3)]">
                        COMPLETE
                      </div>
                    )}
                    {(!phase.completed || phase.topSecret) && (
                      <div className="border-[8px] border-red-600 text-red-600 font-black text-5xl md:text-7xl uppercase tracking-widest px-6 py-2 mix-blend-multiply whitespace-nowrap mt-32 md:mt-16 ml-16 md:ml-32 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                        TOP SECRET
                      </div>
                    )}
                  </div>

                  <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-[#1a1a1a] mb-6 inline-block bg-[#d4f000] px-3 py-1 shadow-[4px_4px_0px_#1a1a1a]">
                    {phase.title}
                  </h3>

                  <div className="font-mono text-lg md:text-xl font-bold text-[#1a1a1a] opacity-100 relative z-10 space-y-4">
                    <p className="leading-relaxed">
                      <span className="bg-[#1a1a1a] text-[#1a1a1a] leading-none select-all mr-3">█████</span>
                      {phase.desc}
                    </p>
                    <p>
                      <span className="bg-[#1a1a1a] text-[#1a1a1a] leading-none select-all">████████████████</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
