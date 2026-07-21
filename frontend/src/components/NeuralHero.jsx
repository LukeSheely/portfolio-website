import React, { useEffect, useRef } from "react";

/**
 * A living neural network behind the hero portrait. Layered nodes fire in
 * cascades of light — a signal enters at the input layer, travels an edge,
 * flares the node it reaches, then branches onward toward the output. The
 * cursor charges nearby nodes. Rendered on a 2D canvas with additive glow.
 *
 * Honors prefers-reduced-motion (draws a single static frame) and pauses
 * when the tab is hidden or the hero scrolls out of view.
 */

const MINT = [111, 231, 193];
const GOLD = [232, 201, 138];

function lerp(a, b, t) {
  return a + (b - a) * t;
}
function mixRGB(a, b, t) {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

function NeuralHero() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0;
    let H = 0;
    let nodes = [];
    let edges = [];
    let signals = [];
    const mouse = { x: -9999, y: -9999 };

    // Feed-forward layout: columns of nodes, sparsely connected to the next
    // column. Positions are recomputed on resize.
    const LAYERS = [4, 6, 6, 3];

    const build = () => {
      nodes = [];
      edges = [];
      signals = [];
      const padX = W * 0.13;
      const padY = H * 0.12;
      const usableW = W - padX * 2;
      const usableH = H - padY * 2;

      const layerNodes = [];
      LAYERS.forEach((count, li) => {
        const x = padX + (LAYERS.length === 1 ? 0 : (usableW * li) / (LAYERS.length - 1));
        const col = [];
        for (let i = 0; i < count; i++) {
          const y = padY + (count === 1 ? usableH / 2 : (usableH * i) / (count - 1));
          const node = {
            x,
            y,
            bx: x,
            by: y,
            ox: 0,
            oy: 0,
            e: 0,
            phase: Math.random() * Math.PI * 2,
            layer: li,
            r: 2.6 + Math.random() * 1.4,
            out: [],
          };
          col.push(node);
          nodes.push(node);
        }
        layerNodes.push(col);
      });

      // connect each node to the 2–3 nearest nodes in the next layer
      for (let li = 0; li < layerNodes.length - 1; li++) {
        const cur = layerNodes[li];
        const next = layerNodes[li + 1];
        cur.forEach((n) => {
          const ranked = [...next].sort(
            (a, b) => Math.abs(a.by - n.by) - Math.abs(b.by - n.by)
          );
          const k = 2 + (Math.random() < 0.5 ? 1 : 0);
          ranked.slice(0, k).forEach((m) => {
            const edge = { a: n, b: m };
            edges.push(edge);
            n.out.push(edge);
          });
        });
      }
    };

    const spawnFrom = (node) => {
      if (signals.length > 46) return;
      node.out.forEach((edge) => {
        if (Math.random() < 0.7) {
          signals.push({ edge, t: 0, speed: 0.9 + Math.random() * 0.7 });
        }
      });
    };

    const inputNodes = () => nodes.filter((n) => n.layer === 0);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // edges
      ctx.lineWidth = 1;
      edges.forEach((edge) => {
        const a = edge.a;
        const b = edge.b;
        const glow = Math.min(1, (a.e + b.e) * 0.5);
        ctx.strokeStyle = `rgba(140, 200, 185, ${0.05 + glow * 0.35})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      });

      ctx.globalCompositeOperation = "lighter";

      // travelling signals
      signals.forEach((s) => {
        const { a, b } = s.edge;
        const x = lerp(a.x, b.x, s.t);
        const y = lerp(a.y, b.y, s.t);
        const g = ctx.createRadialGradient(x, y, 0, x, y, 7);
        g.addColorStop(0, "rgba(180, 255, 230, 0.9)");
        g.addColorStop(1, "rgba(111, 231, 193, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();
      });

      // nodes
      nodes.forEach((n) => {
        const idle = 0.14 + 0.06 * (0.5 + 0.5 * Math.sin(n.phase));
        const energy = Math.min(1, idle + n.e);
        const col = mixRGB(MINT, GOLD, n.layer === LAYERS.length - 1 ? 0.5 + n.e * 0.5 : n.e);
        const radius = n.r + energy * 6;
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, radius * 2.2);
        g.addColorStop(0, `rgba(${col[0] | 0}, ${col[1] | 0}, ${col[2] | 0}, ${0.5 + energy * 0.5})`);
        g.addColorStop(1, `rgba(${col[0] | 0}, ${col[1] | 0}, ${col[2] | 0}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius * 2.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(230, 255, 245, ${0.5 + energy * 0.5})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, Math.max(1, n.r * 0.6), 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalCompositeOperation = "source-over";
    };

    let raf;
    let running = true;
    let last = performance.now();
    let spawnAcc = 0;

    const frame = (now) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // periodically fire the input layer
      spawnAcc += dt;
      if (spawnAcc > 0.45) {
        spawnAcc = 0;
        const ins = inputNodes();
        spawnFrom(ins[(Math.random() * ins.length) | 0]);
      }

      // advance signals
      for (let i = signals.length - 1; i >= 0; i--) {
        const s = signals[i];
        s.t += s.speed * dt;
        if (s.t >= 1) {
          const arrived = s.edge.b;
          arrived.e = 1;
          if (arrived.layer < LAYERS.length - 1) spawnFrom(arrived);
          signals.splice(i, 1);
        }
      }

      // node update: energy decay, idle breathing, cursor charge + nudge
      nodes.forEach((n) => {
        n.e *= 0.94;
        n.phase += dt * 1.6;
        const dx = n.bx - mouse.x;
        const dy = n.by - mouse.y;
        const dist = Math.hypot(dx, dy);
        const R = 120;
        let tx = 0;
        let ty = 0;
        if (dist < R) {
          const f = 1 - dist / R;
          n.e = Math.max(n.e, f * 0.8);
          tx = (dx / (dist || 1)) * f * 10;
          ty = (dy / (dist || 1)) * f * 10;
        }
        n.ox += (tx - n.ox) * 0.1;
        n.oy += (ty - n.oy) * 0.1;
        n.x = n.bx + n.ox;
        n.y = n.by + n.oy;
      });

      draw();
      raf = requestAnimationFrame(frame);
    };

    const setSize = () => {
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      if (W === 0 || H === 0) return;
      const small = window.innerWidth <= 640;
      const dpr = Math.min(window.devicePixelRatio || 1, small ? 1 : 1.5);
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
      if (reduced) draw();
    };

    const ro = new ResizeObserver(setSize);
    ro.observe(canvas);
    setSize();

    if (reduced) {
      draw();
      return () => ro.disconnect();
    }

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerout", onLeave);

    // pause when scrolled away or tab hidden
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !document.hidden) {
          if (!running) {
            running = true;
            last = performance.now();
            raf = requestAnimationFrame(frame);
          }
        } else {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0.05 }
    );
    io.observe(canvas);

    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onLeave);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={canvasRef} className="neural-canvas" aria-hidden="true" />;
}

export default NeuralHero;
