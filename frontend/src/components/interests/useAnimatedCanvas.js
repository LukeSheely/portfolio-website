import { useEffect } from "react";

/**
 * Shared full-viewport canvas driver for the interest backgrounds.
 * Handles sizing (DPR-capped), the rAF loop, tab-hidden pausing, and
 * prefers-reduced-motion (draws a single frame). Callers provide:
 *   setup(ctx, { W, H, state })  — (re)seed on mount/resize
 *   frame(ctx, { t, W, H, state }) — draw one frame (t = seconds)
 */
export default function useAnimatedCanvas(ref, { setup, frame }) {
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const state = {};
    let W = 0;
    let H = 0;

    const resize = () => {
      const small = window.innerWidth <= 640;
      const dpr = Math.min(window.devicePixelRatio || 1, small ? 1 : 1.5);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (setup) setup(ctx, { W, H, state });
    };
    resize();
    window.addEventListener("resize", resize);

    let raf;
    let running = true;
    const start = performance.now();
    const loop = (now) => {
      if (!running) return;
      frame(ctx, { t: (now - start) / 1000, W, H, state });
      raf = requestAnimationFrame(loop);
    };

    if (reduced) {
      frame(ctx, { t: 0, W, H, state });
    } else {
      raf = requestAnimationFrame(loop);
    }

    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running && !reduced) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);
}
