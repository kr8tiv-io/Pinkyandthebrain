"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import HeroMenu from "./HeroMenu";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const title1Ref = useRef<HTMLHeadingElement>(null);
  const title2Ref = useRef<HTMLHeadingElement>(null);
  const btn1Ref = useRef<HTMLButtonElement>(null);
  const btn2Ref = useRef<HTMLButtonElement>(null);
  const nightRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let requestRef: number;
    let counter = 1;

    const animateNight = () => {
      counter += 17; // Adjust speed
      if (counter > 4444) {
        counter = 1;
      }
      if (nightRef.current) {
        nightRef.current.innerText = Math.floor(counter).toLocaleString();
      }
      requestRef = requestAnimationFrame(animateNight);
    };
    requestRef = requestAnimationFrame(animateNight);

    return () => cancelAnimationFrame(requestRef);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Decrypted transmission feel: glitchy start with y-scale stretches and blur
      tl.fromTo(
        title1Ref.current,
        { y: 50, opacity: 0, filter: "blur(10px)", scaleY: 2, skewX: 30 },
        { y: 0, opacity: 1, filter: "blur(0px)", scaleY: 1, skewX: 0, duration: 1.5, ease: "expo.out" }
      )
      .fromTo(
        title2Ref.current,
        { y: 50, opacity: 0, filter: "blur(10px)", scaleY: 2, skewX: -30 },
        { y: 0, opacity: 1, filter: "blur(0px)", scaleY: 1, skewX: 0, duration: 1.5, ease: "expo.out" },
        "-=1.2"
      );

      // Magnetic Hover logic
      const addMagnetic = (element: HTMLElement | null) => {
        if (!element) return;
        const move = (e: MouseEvent) => {
          const rect = element.getBoundingClientRect();
          const x = (e.clientX - rect.left - rect.width / 2) * 0.4;
          const y = (e.clientY - rect.top - rect.height / 2) * 0.4;
          gsap.to(element, { x, y, duration: 0.3, ease: 'power2.out' });
        };
        const leave = () => {
          gsap.to(element, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
        };
        element.addEventListener('mousemove', move as EventListener);
        element.addEventListener('mouseleave', leave);
        return () => {
          element.removeEventListener('mousemove', move as EventListener);
          element.removeEventListener('mouseleave', leave);
        };
      };

      const cleanupBtn1 = addMagnetic(btn1Ref.current);
      const cleanupBtn2 = addMagnetic(btn2Ref.current);

      return () => {
        if (cleanupBtn1) cleanupBtn1();
        if (cleanupBtn2) cleanupBtn2();
      };
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0d0d0d]">
      {/* Top Logo */}
      <div className="absolute top-4 sm:top-6 md:top-8 left-4 sm:left-6 md:left-12 z-50 mix-blend-screen group cursor-pointer">
        <img
          src="/art/logo.png"
          alt="Pinky and The Brain Logo"
          className="w-28 sm:w-36 md:w-56 h-auto drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-transform duration-500 ease-out group-hover:scale-110 group-hover:rotate-6 origin-bottom-left"
        />
      </div>

      {/* Immersive Menu */}
      <HeroMenu />

      {/* WebGL/3D Render Background layer */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-black">
        <video
          src="/videos/hero-bg.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="absolute top-1/2 left-1/2 w-auto h-auto min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover mix-blend-screen opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/60 to-[#0d0d0d]/20" />
        <img src="/noise.gif" alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.03] mix-blend-screen pointer-events-none" />
      </div>

      {/* Foreground Content — pushed below logo+menu with generous top padding on mobile */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-12 flex flex-col justify-end pb-10 sm:pb-16 md:pb-20 h-full pt-36 sm:pt-40 md:pt-28">
        <div className="mb-4 sm:mb-8 font-mono text-[#d4f000] text-xs sm:text-sm tracking-widest uppercase font-bold flicker">
          PROJECT CLASSIFIED // NIGHT: <span ref={nightRef}>1</span> <span className="inline-block w-2 h-4 bg-[#d4f000] ml-1 align-middle"></span>
        </div>

        <h1 className="text-[2.4rem] xs:text-[3rem] sm:text-[4rem] md:text-[6.5rem] leading-[0.88] sm:leading-[0.85] font-black tracking-tighter uppercase font-sans group cursor-default">
          <div className="overflow-hidden p-1 sm:p-2 -m-1 sm:-m-2">
            <span ref={title1Ref} className="block text-[#ffffff] transition-colors duration-700 hover:text-[#d4f000] hover:scale-[1.02] hover:translate-x-4 hover:drop-shadow-[0_0_40px_rgba(212,240,0,0.5)] transform-gpu origin-left inline-block">
              Same Thing We Do
            </span>
          </div>
          <div className="overflow-hidden p-1 sm:p-2 -m-1 sm:-m-2 mt-1 sm:mt-2">
            <span ref={title2Ref} className="block text-[#ff9e9e] transition-colors duration-700 hover:text-[#ffffff] hover:scale-[1.02] hover:translate-x-4 hover:drop-shadow-[0_0_40px_rgba(255,158,158,0.5)] transform-gpu origin-left inline-block">
              Every Night, Pinky.
            </span>
          </div>
        </h1>

        <div className="mt-6 sm:mt-10 md:mt-12 max-w-xl text-sm sm:text-base md:text-xl text-[#e5e5e5] leading-relaxed font-sans font-bold border-l-4 border-[#d4f000] pl-4 sm:pl-6 py-2 bg-[#1a1a1a]/40 backdrop-blur-sm uppercase">
          a highly deflationary solana reflecting mouse ponzi investment token
        </div>

        <div className="mt-6 sm:mt-10 md:mt-12 flex flex-wrap items-center gap-4 sm:gap-6">
          <button ref={btn1Ref} className="bg-[#d4f000] text-[#0d0d0d] uppercase tracking-tighter font-black text-base sm:text-xl px-6 sm:px-10 py-4 sm:py-5 hover:bg-white transition-colors duration-300 shadow-[4px_4px_0px_#ff9e9e] sm:shadow-[6px_6px_0px_#ff9e9e] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] sm:active:translate-x-[6px] sm:active:translate-y-[6px]">
            View The Blueprint
          </button>
          <div className="flex flex-col items-center">
            <button ref={btn2Ref} className="text-xs sm:text-sm font-mono tracking-widest uppercase text-[#ff9e9e] hover:text-white transition-colors duration-200 border border-[#ff9e9e]/50 hover:border-white px-5 sm:px-6 py-4 sm:py-5 bg-[#1a1a1a]/50 backdrop-blur-sm">
              Read Docs -&gt;
            </button>
            <span className="text-[10px] text-[#ff9e9e] font-mono mt-2 tracking-widest uppercase opacity-70">Coming Soon</span>
          </div>
        </div>
      </div>
    </section>
  );
}
