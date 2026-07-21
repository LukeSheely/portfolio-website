import React, { useRef } from "react";
import useAnimatedCanvas from "./useAnimatedCanvas";

/**
 * Placeholder water scene for wakesurfing: a deep-to-bright water gradient,
 * layered rolling waves, and drifting light glints. Easy to swap later for
 * something more specific (a wake, a horizon, footage-derived art).
 */
function WakesurfBackground() {
  const ref = useRef(null);

  useAnimatedCanvas(ref, {
    setup: (ctx, { W, H, state }) => {
      state.glints = Array.from({ length: 40 }, () => ({
        x: Math.random() * W,
        y: H * 0.45 + Math.random() * H * 0.55,
        r: 1 + Math.random() * 2.5,
        sp: 6 + Math.random() * 16,
        ph: Math.random() * Math.PI * 2,
      }));
    },
    frame: (ctx, { t, W, H, state }) => {
      // water gradient
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#041e30");
      g.addColorStop(0.5, "#0a4b66");
      g.addColorStop(1, "#0e6f86");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // layered rolling waves
      const layers = [
        { y: H * 0.5, amp: 18, len: 0.006, sp: 0.6, a: 0.10 },
        { y: H * 0.64, amp: 26, len: 0.005, sp: 0.9, a: 0.12 },
        { y: H * 0.8, amp: 34, len: 0.004, sp: 1.3, a: 0.14 },
      ];
      layers.forEach((L) => {
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 12) {
          const y = L.y + Math.sin(x * L.len + t * L.sp) * L.amp
            + Math.sin(x * L.len * 2.3 + t * L.sp * 1.7) * L.amp * 0.4;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fillStyle = `rgba(180, 235, 245, ${L.a})`;
        ctx.fill();
      });

      // sun/light band near the top
      const band = ctx.createRadialGradient(W * 0.7, H * 0.2, 0, W * 0.7, H * 0.2, Math.max(W, H) * 0.5);
      band.addColorStop(0, "rgba(255, 246, 210, 0.18)");
      band.addColorStop(1, "rgba(255, 246, 210, 0)");
      ctx.fillStyle = band;
      ctx.fillRect(0, 0, W, H);

      // drifting glints
      ctx.globalCompositeOperation = "lighter";
      state.glints.forEach((s) => {
        s.x += s.sp * 0.016;
        if (s.x > W + 5) s.x = -5;
        const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 3 + s.ph));
        ctx.fillStyle = `rgba(230, 250, 255, ${tw * 0.7})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y + Math.sin(t + s.ph) * 3, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalCompositeOperation = "source-over";
    },
  });

  return <canvas ref={ref} className="interest-canvas" aria-hidden="true" />;
}

export default WakesurfBackground;
