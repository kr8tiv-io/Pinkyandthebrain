"use client";

import { ReactNode, useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScrolling({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.12,
      duration: 1.0,
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
