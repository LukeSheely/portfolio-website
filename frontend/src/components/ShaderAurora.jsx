import React, { useEffect, useRef } from "react";

/**
 * A living aurora rendered on the GPU: a full-screen fragment shader driven
 * by domain-warped fbm noise, colored from the site's palette, and nudged
 * by the pointer. Falls back silently to the CSS aurora if WebGL is
 * unavailable, and stays off entirely under prefers-reduced-motion.
 */

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_mouse;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  vec2 p = uv;
  p.x *= u_res.x / u_res.y;

  float t = u_time * 0.045;

  // domain warp for that flowing aurora feel
  vec2 q = vec2(fbm(p * 1.8 + t), fbm(p * 1.8 + vec2(5.2, 1.3) - t));
  vec2 r = vec2(
    fbm(p * 1.8 + 2.2 * q + vec2(1.7, 9.2) + t * 1.15),
    fbm(p * 1.8 + 2.2 * q + vec2(8.3, 2.8) - t * 1.05)
  );
  float f = fbm(p * 1.8 + 3.0 * r);

  // palette (matches the CSS design tokens)
  vec3 base  = vec3(0.031, 0.035, 0.047);
  vec3 jade  = vec3(0.122, 0.612, 0.486);
  vec3 plum  = vec3(0.427, 0.247, 0.478);
  vec3 slate = vec3(0.184, 0.427, 0.561);
  vec3 gold  = vec3(0.725, 0.541, 0.243);

  vec3 col = base;
  col = mix(col, slate, clamp(f * f * 1.5, 0.0, 1.0));
  col = mix(col, jade,  clamp(length(q) * 0.65, 0.0, 1.0));
  col = mix(col, plum,  clamp(r.x * 0.55, 0.0, 1.0));
  col = mix(col, gold,  clamp(pow(max(r.y, 0.0), 3.0) * 0.5, 0.0, 1.0));

  // keep it moody: brighter toward the top, darker low and at the edges
  float topFade = smoothstep(1.05, -0.15, uv.y);
  float vign = smoothstep(1.35, 0.25, length(uv - vec2(0.5)));
  col = mix(base, col, clamp(0.35 + 0.75 * topFade, 0.0, 1.0));
  col *= 0.55 + 0.45 * vign;

  // soft glow that trails the cursor
  float md = length((uv - u_mouse) * vec2(u_res.x / u_res.y, 1.0));
  col += jade * 0.07 * smoothstep(0.45, 0.0, md);

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    gl.deleteShader(s);
    return null;
  }
  return s;
}

function ShaderAurora() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext("webgl", { antialias: false, alpha: false }) ||
      canvas.getContext("experimental-webgl");
    if (!gl) return; // CSS aurora remains

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    // full-screen triangle
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");

    document.body.classList.add("webgl-on");

    const mouse = { x: 0.5, y: 0.6, tx: 0.5, ty: 0.6 };
    const onMove = (e) => {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = 1.0 - e.clientY / window.innerHeight;
    };
    window.addEventListener("pointermove", onMove);

    // Cap pixel density — phones pack a lot of pixels, and a full-screen
    // fragment shader at 3x would cook the battery for little visual gain.
    const smallScreen = window.innerWidth <= 640;
    const dpr = Math.min(window.devicePixelRatio || 1, smallScreen ? 1.0 : 1.5);
    const resize = () => {
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener("resize", resize);
    resize();

    let raf;
    let running = true;
    const start = performance.now();
    const render = (now) => {
      if (!running) return;
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    // pause when the tab is hidden to save the battery
    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      document.body.classList.remove("webgl-on");
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <canvas ref={canvasRef} className="shader-canvas" aria-hidden="true" />;
}

export default ShaderAurora;
