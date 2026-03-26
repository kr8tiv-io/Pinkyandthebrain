"use client";

import { ReactNode, useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScrolling({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.2,
      smoothWheel: true,
      prevent: (node: HTMLElement) => {
        // Let nested scrollable containers (terminals, charts) scroll natively
        if (node.classList.contains('custom-scrollbar')) return true;
        if (node.classList.contains('wr-chart-frame')) return true;
        if (node.closest('.custom-scrollbar')) return true;
        if (node.closest('.wr-chart-frame')) return true;
        if (node.closest('.recharts-wrapper')) return true;
        return false;
      },
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
