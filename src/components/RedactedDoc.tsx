"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function RedactedDoc() {
  const containerRef = useRef<HTMLDivElement>(null);
  const redactionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Animate redactions away on scroll
      redactionRefs.current.forEach((el, index) => {
        if (!el) return;
        gsap.to(el, {
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 60%",
            end: "bottom 40%",
            scrub: 1,
          },
          clipPath: "inset(0 100% 0 0)",
          ease: "none",
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center py-24 bg-[#0d0d0d] text-[#cccccc] overflow-hidden border-b border-[#1a1a1a]/50">

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 px-6 lg:px-12 items-center relative z-10">

        {/* Left: Text Context */}
        <div className="space-y-8">
          <h2 className="text-[4rem] md:text-[6.5rem] leading-[0.85] font-black tracking-tighter uppercase font-sans text-white">
            Legally-Not-<br/>
            <span className="text-[#ffadad] drop-shadow-[2px_2px_0px_#1a1a1a]">A-Ponzi</span>
          </h2>
          <p className="text-xl font-mono leading-relaxed font-bold max-w-lg">
            The SEC said we couldn't call it a guaranteed 1000x. So we didn't. We called it a highly volatile, completely rational accumulation of value based on cartoon mouse mathematics.
          </p>
          <div className="p-6 border-4 border-[#1a1a1a] shadow-[8px_8px_0px_#1a1a1a] bg-[#e4ff57] text-[#1a1a1a] max-w-lg transform -rotate-1">
            <p className="font-black tracking-tight text-xl mb-3 uppercase">“Are you pondering what I’m pondering?”</p>
            <p className="font-mono text-sm opacity-80 font-bold">“I think so, Brain, but if we give them all the SOL, how will we afford the laser satellite?”</p>
          </div>
        </div>

        {/* Right: The Redacted Document Image */}
        <div ref={containerRef} className="relative aspect-[3/4] w-full max-w-md mx-auto transform rotate-3 hover:rotate-1 transition-transform duration-500 shadow-2xl border-8 border-white bg-white">
          <Image
            src="/art/redacted_ponzi_doc.png"
            alt="Top Secret Dossier"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          {/* Faux Redaction Bars that scrub away */}
          <div className="absolute inset-x-8 top-24 h-6 bg-[#1a1a1a]" ref={el => { redactionRefs.current[0] = el; }} />
          <div className="absolute inset-x-8 top-36 h-6 bg-[#1a1a1a] w-3/4" ref={el => { redactionRefs.current[1] = el; }} />
          <div className="absolute inset-x-8 top-48 h-6 bg-[#1a1a1a] w-5/6" ref={el => { redactionRefs.current[2] = el; }} />
          <div className="absolute inset-x-8 top-60 h-6 bg-[#1a1a1a] w-4/5" ref={el => { redactionRefs.current[3] = el; }} />
          <div className="absolute inset-x-8 bottom-24 h-24 bg-[#1a1a1a]" ref={el => { redactionRefs.current[4] = el; }} />

          <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-[#ffadad] rounded-full mix-blend-multiply blur-xl opacity-60 pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
