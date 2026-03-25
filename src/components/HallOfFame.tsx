"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function HallOfFame() {
  const [topHolders, setTopHolders] = useState<any[]>([
    { rank: 1, wallet_address: "8x9...4V", balance: 842000 },
    { rank: 2, wallet_address: "BrainWallet...SOL", balance: 612400 },
    { rank: 3, wallet_address: "7r9...BAGS", balance: 320000 },
    { rank: 4, wallet_address: "Degen...X1", balance: 150000 },
    { rank: 5, wallet_address: "Fren...LUV", balance: 90000 },
  ]);

  useEffect(() => {
    fetch('/api/hall-of-fame')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          // ensure rank is attached
          const mapped = data.map((d: any, i: number) => ({ ...d, rank: i + 1 }));
          setTopHolders(mapped);
        }
      })
      .catch(err => console.error("API error", err));
  }, []);

  return (
    <section className="bg-[#1a1a1a] text-[#cccccc] py-32 border-t border-[#ffadad]/30 relative overflow-hidden">
      {/* Video Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-black">
        <video
          src="/videos/hallfame-bg.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="absolute top-1/2 left-1/2 w-auto h-auto min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover mix-blend-screen opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/80 to-[#1a1a1a]/40" />
        <div className="absolute inset-0 opacity-10 bg-[url('/noise.png')] mix-blend-overlay" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">

        {/* Hall of Fame (Data Table) */}
        <div>
          <h2 className="text-[4rem] md:text-[6.5rem] leading-[0.85] font-black tracking-tighter uppercase font-sans mb-8 text-[#e4ff57]">
            Hall of <span className="text-white">Fame</span>
          </h2>
          <p className="font-mono text-sm opacity-60 uppercase tracking-widest mb-8">
            The Top 100 believers receiving SOL reflections.
          </p>

          <div className="border-4 border-[#cccccc]/20 bg-[#1a1a1a] p-1">
            <div className="grid grid-cols-12 gap-4 border-b-2 border-[#cccccc]/20 p-4 font-mono text-xs uppercase tracking-widest text-[#cccccc]/60">
              <div className="col-span-2">Rank</div>
              <div className="col-span-6">Address</div>
              <div className="col-span-4 text-right">Balance ($BRAIN)</div>
            </div>

            {topHolders.map((holder, idx) => (
              <div
                key={holder.rank}
                className={`grid grid-cols-12 gap-4 p-4 font-mono items-center border-b border-[#cccccc]/5 hover:bg-[#cccccc]/5 transition-colors ${idx === 0 ? 'text-[#e4ff57]' : ''}`}
              >
                <div className="col-span-2 font-black text-xl">#{holder.rank}</div>
                <div className="col-span-6 truncate">{holder.wallet_address || holder.address}</div>
                <div className="col-span-4 text-right font-black">{Number(holder.balance).toLocaleString()}</div>
              </div>
            ))}

            <div className="p-4 text-center font-mono text-sm text-[#ffadad] animate-pulse">
              [ Fetching Remaining 95 Rows from Postgres Indexer... ]
            </div>
          </div>
        </div>

        {/* Hall of Shame (Pixel Avatars) */}
        <div>
          <h2 className="text-[4rem] md:text-[6.5rem] leading-[0.85] font-black tracking-tighter uppercase font-sans mb-8 text-[#ffadad]">
            Hall of <span className="text-white">Shame</span>
          </h2>
          <p className="font-mono text-sm opacity-60 uppercase tracking-widest mb-8">
            Those who panic sold before the satellite calibration.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {[
              { id: 1, name: "Jeet_Wallet_1", return: "-34% Return" },
              { id: 2, name: "Jeet_Wallet_2", return: "-67% Return" },
              { id: 3, name: "Jeet_Wallet_3", return: "-91% Return" },
              { id: 4, name: "Jeet_Wallet_4", return: "-12% Return" },
              { id: 5, name: "Jeet_Wallet_5", return: "-203% Return" },
              { id: 6, name: "Jeet_Wallet_6", return: "+400% Return", note: "sold anyway somehow" }
            ].map((wallet) => (
              <div key={wallet.id} className="aspect-square bg-black border-4 border-[#333] relative group overflow-hidden flex flex-col items-center justify-end">
                <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity p-2">
                  <Image
                    src="/art/shame_pixel_avatars.png"
                    alt="Crying Pixel Avatar"
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover object-top filter grayscale group-hover:grayscale-0 transition-all duration-500 scale-[1.5]"
                  />
                </div>
                <div className="relative z-10 w-full bg-black/80 backdrop-blur-sm p-2 text-center border-t border-[#444]">
                  <div className="font-mono text-[10px] text-[#ffadad] uppercase truncate">{wallet.name}</div>
                  <div className="font-mono text-[10px] text-white/50">{wallet.return}</div>
                  {wallet.note && (
                    <div className="absolute -top-6 -right-2 bg-[#ff3333] border-2 border-white text-white font-black font-sans text-[10px] px-2 py-1 transform rotate-[15deg] shadow-[4px_4px_0px_#000000]">
                      {wallet.note}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
