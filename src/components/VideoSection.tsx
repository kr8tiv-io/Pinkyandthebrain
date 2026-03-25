"use client";

import { useRef, useState, useEffect } from "react";

export default function VideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hovered, setHovered] = useState(false);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else          { v.pause(); setPlaying(false); }
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setProgress((v.currentTime / v.duration) * 100 || 0);
    const onEnd  = () => setPlaying(false);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("ended", onEnd);
    return () => { v.removeEventListener("timeupdate", onTime); v.removeEventListener("ended", onEnd); };
  }, []);

  return (
    <section className="relative w-full bg-[#111] py-20 overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#e4ff57 1px, transparent 1px), linear-gradient(90deg, #e4ff57 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#e4ff57]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6">

        {/* Title */}
        <div className="mb-8 flex items-start gap-4">
          <div className="flex flex-col">
            <span className="font-mono text-[#e4ff57] text-xs tracking-[0.3em] uppercase mb-1 opacity-60">
              // classified_footage.mp4
            </span>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-none">
              The Origin{" "}
              <span className="text-[#ffadad]">Tape</span>
            </h2>
          </div>
        </div>

        {/* ── Video Frame ── */}
        <div
          className="relative group"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Outer neon border frame */}
          <div
            className="absolute -inset-[3px] rounded-sm pointer-events-none z-20 transition-opacity duration-500"
            style={{
              background: "linear-gradient(135deg, #e4ff57, #ffadad, #e4ff57)",
              opacity: hovered ? 1 : 0.55,
            }}
          />

          {/* Corner brackets */}
          {[
            "top-0 left-0 border-t-4 border-l-4",
            "top-0 right-0 border-t-4 border-r-4",
            "bottom-0 left-0 border-b-4 border-l-4",
            "bottom-0 right-0 border-b-4 border-r-4",
          ].map((cls, i) => (
            <div
              key={i}
              className={`absolute w-8 h-8 border-[#e4ff57] z-30 ${cls}`}
              style={{ margin: "-2px" }}
            />
          ))}

          {/* Inner container */}
          <div className="relative overflow-hidden bg-black rounded-sm z-10">
            {/* CRT scanlines overlay */}
            <div
              className="absolute inset-0 z-20 pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px)",
              }}
            />

            {/* VHS label */}
            <div className="absolute top-3 left-3 z-30 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-mono text-red-400 text-[10px] tracking-widest uppercase opacity-80">
                REC
              </span>
            </div>

            {/* Classified stamp top-right */}
            <div className="absolute top-3 right-3 z-30 border border-[#ffadad] text-[#ffadad] font-mono text-[9px] tracking-widest px-2 py-0.5 uppercase rotate-3 opacity-70">
              Classified
            </div>

            <video
              ref={videoRef}
              src="/videos/pinky-brain-intro.mp4"
              className="w-full aspect-video object-cover"
              playsInline
              preload="metadata"
            />

            {/* Click to toggle */}
            <button
              onClick={toggle}
              className="absolute inset-0 w-full h-full z-10 flex items-center justify-center cursor-pointer focus:outline-none"
              aria-label={playing ? "Pause" : "Play"}
            >
              {/* Big play/pause icon — visible when not playing or on hover */}
              <div
                className={`transition-all duration-300 ${
                  playing && !hovered ? "opacity-0 scale-75" : "opacity-100 scale-100"
                }`}
              >
                <div className="relative flex items-center justify-center w-20 h-20">
                  {/* Glow ring */}
                  <div className="absolute inset-0 rounded-full bg-[#e4ff57]/20 blur-xl" />
                  <div className="relative w-16 h-16 rounded-full bg-black/70 border-2 border-[#e4ff57] flex items-center justify-center backdrop-blur-sm">
                    {playing ? (
                      /* Pause icon */
                      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-[#e4ff57]">
                        <rect x="5" y="4" width="4" height="16" rx="1" />
                        <rect x="15" y="4" width="4" height="16" rx="1" />
                      </svg>
                    ) : (
                      /* Play icon */
                      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-[#e4ff57] translate-x-0.5">
                        <path d="M8 5.14v14.72L19 12 8 5.14z" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* ── Progress bar beneath frame ── */}
          <div className="relative z-10 h-1 bg-white/10 mt-0">
            <div
              className="h-full bg-gradient-to-r from-[#e4ff57] to-[#ffadad] transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Caption */}
        <p className="mt-6 font-mono text-xs text-[#cccccc]/40 tracking-widest uppercase text-center">
          "Pinky, are you pondering what I&apos;m pondering?" &mdash; Brain, probably about $BRAIN
        </p>
      </div>
    </section>
  );
}
