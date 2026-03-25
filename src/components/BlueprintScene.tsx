"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const CONTRACT_ADDRESS = "7r9RJw6gWbj6s1N9pGKrdzzd5H7oK1sauuwkUDVKBAGS";
const BAGS_URL = "https://bags.fm/7r9RJw6gWbj6s1N9pGKrdzzd5H7oK1sauuwkUDVKBAGS";

export default function BlueprintScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Pre-generate static data to avoid hydration mismatches
  // We'll just render empty invisible divs on the server, and position them on the client.
  const docsCount = 12;

  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (!mounted || !containerRef.current || !wrapperRef.current) return;
    
    const grids = containerRef.current.querySelectorAll('.grid-plane');
    const docs = containerRef.current.querySelectorAll('.floating-doc');
    
    // Convert NodeList to Array
    const docsArray = Array.from(docs);
    
    const ctx = gsap.context(() => {
      // First, set initial positions for all documents in a grid layout
      const numColumns = 4; // Number of columns in the grid
      const numRows = Math.ceil(docsCount / numColumns);
      const gridSpacingX = 360; // Horizontal spacing between documents
      const gridSpacingY = 360; // Vertical spacing between documents

      docsArray.forEach((el, index) => {
        const col = index % numColumns;
        const row = Math.floor(index / numColumns);

        // Calculate x and y to center the grid
        const startX = -(numColumns - 1) * gridSpacingX / 2;
        const startY = -(numRows - 1) * gridSpacingY / 2;

        const posX = startX + col * gridSpacingX;
        const posY = startY + row * gridSpacingY;

        // Add some random offset to the grid position for a less rigid look
        const randomOffsetX = Math.random() * 200 - 100; // -100 to 100
        const randomOffsetY = Math.random() * 200 - 100; // -100 to 100
        const randomOffsetZ = Math.random() * 200 - 100; // -100 to 100

        gsap.set(el, {
          x: posX + randomOffsetX,
          y: posY + randomOffsetY,
          z: randomOffsetZ, // Keep some random depth variation
          rotationZ: Math.random() * 20 - 10, // Subtle tilt per tile
          width: 300,
          height: 300,
          opacity: 1
        });
      });

      // Animate background grid panning
      gsap.to(grids, {
        backgroundPosition: '40px 40px',
        duration: 2,
        repeat: -1,
        ease: "none"
      });

      // Animate floating effect for documents
      docsArray.forEach((el, index) => {
        gsap.to(el, {
          y: `+=${Math.random() * 40 - 20}`, // Float up/down
          rotationZ: `+=${Math.random() * 4 - 2}`, // Slight rotation while floating
          duration: Math.random() * 2 + 3,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: index * 0.1 // Stagger the start of animations
        });
      });

      const onMouseMove = (e: MouseEvent) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20; 
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        
        gsap.to(containerRef.current, {
          rotationY: x,
          rotationX: -y,
          duration: 1,
          ease: "power2.out"
        });
      };
      
      window.addEventListener("mousemove", onMouseMove);
      return () => window.removeEventListener("mousemove", onMouseMove);
    }, wrapperRef);
    
    return () => ctx.revert();
  }, [mounted]);

  return (
    <div ref={wrapperRef} className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#0f0f0f] flex items-center justify-center [perspective:1000px]">
      <div ref={containerRef} className="relative w-full h-full [transform-style:preserve-3d] opacity-50">
        
        {/* Animated Blueprint Grid */}
        <div className="grid-plane absolute -inset-[50%] border border-[#e4ff57]/5" 
             style={{ 
               backgroundImage: `linear-gradient(rgba(228, 255, 87, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(228, 255, 87, 0.08) 1px, transparent 1px)`,
               backgroundSize: '40px 40px',
               transform: 'translateZ(-300px)'
             }} />
             
        {/* Secondary Grid */}
        <div className="grid-plane absolute -inset-[50%] border border-[#e4ff57]/5" 
             style={{ 
               backgroundImage: `linear-gradient(rgba(228, 255, 87, 0.03) 2px, transparent 2px), linear-gradient(90deg, rgba(228, 255, 87, 0.03) 2px, transparent 2px)`,
               backgroundSize: '200px 200px',
               transform: 'translateZ(-300px)'
             }} />
             
        {/* Floating Documents */}
        {mounted && Array.from({ length: docsCount }).map((_, i) => (
          <div
            key={i}
            className="floating-doc absolute top-1/2 left-1/2 opacity-0 -translate-x-1/2 -translate-y-1/2"
            style={{
              backgroundImage: `url('/art/tokenomics_folders.png')`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              mixBlendMode: 'screen',
              filter: 'invert(1) drop-shadow(0 20px 40px rgba(212,240,0,0.35))'
            }}
          >
             <div className="absolute top-[20%] left-[10%] border border-[#ffadad] text-[#ffadad] text-[10px] sm:text-sm font-mono px-2 py-0.5 tracking-widest uppercase rotate-[-15deg] opacity-80 backdrop-blur-sm">
               Classified
             </div>
             <div className="absolute bottom-[20%] right-[10%] text-[#e4ff57] text-[8px] sm:text-xs font-mono opacity-80">
               ID: {i.toString(36).toUpperCase()}
             </div>
          </div>
        ))}

      </div>
      
      {/* Vignette Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-[#1a1a1a]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] via-transparent to-[#1a1a1a]" />

      {/* Contract Address Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center gap-3 bg-[#111]/80 backdrop-blur-md border border-[#e4ff57]/20 rounded-full px-4 py-2 shadow-[0_0_20px_rgba(228,255,87,0.15)]">
        <span className="text-[10px] font-mono text-[#e4ff57]/60 uppercase tracking-widest hidden sm:inline">CA:</span>
        <button
          onClick={handleCopy}
          title="Click to copy contract address"
          className="font-mono text-[11px] sm:text-xs text-[#e4ff57] hover:text-white transition-colors duration-200 truncate max-w-[140px] sm:max-w-[320px]"
        >
          {copied ? "✓ Copied!" : CONTRACT_ADDRESS}
        </button>
        <span className="text-[#e4ff57]/30 text-xs">|</span>
        <a
          href={BAGS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[#e4ff57]/70 hover:text-[#e4ff57] transition-colors duration-200 whitespace-nowrap"
        >
          Buy on Bags.fm ↗
        </a>
      </div>
    </div>
  );
}
