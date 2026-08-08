"use client";
import { useEffect, useRef } from "react";

export default function StitchBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl") as WebGLRenderingContext;
    if (!gl) return;

    function syncSize() {
      const w = canvas?.clientWidth || 1280;
      const h = canvas?.clientHeight || 720;
      if (canvas && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w;
        canvas.height = h;
      }
    }
    syncSize();
    window.addEventListener("resize", syncSize);

    const vs = `attribute vec2 a_position; varying vec2 v_texCoord; void main() { v_texCoord = a_position * 0.5 + 0.5; gl_Position = vec4(a_position, 0.0, 1.0); }`;
    const fs = `
      precision highp float;
      uniform float u_time;
      varying vec2 v_texCoord;
      void main() {
          vec2 uv = v_texCoord;
          vec3 color1 = vec3(0.98, 0.97, 0.96);
          vec3 color2 = vec3(0.95, 0.92, 0.88);
          float pattern = abs(sin(uv.x * 20.0 + u_time) * cos(uv.y * 20.0 - u_time));
          float mask = smoothstep(0.45, 0.55, pattern);
          vec3 finalColor = mix(color1, color2, mask * 0.05);
          float dist = distance(uv, vec2(0.5));
          finalColor *= 1.0 - dist * 0.1;
          gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    function createShader(type: number, source: string) {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, source);
      gl.compileShader(s);
      return s;
    }

    const vertexShader = createShader(gl.VERTEX_SHADER, vs);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fs);
    if (!vertexShader || !fragmentShader) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vertexShader);
    gl.attachShader(prog, fragmentShader);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");

    let animationFrameId: number;
    function render(t: number) {
      if (canvas && gl) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        if (uTime) gl.uniform1f(uTime, t * 0.001);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      animationFrameId = requestAnimationFrame(render);
    }
    render(0);

    const pContainer = particlesRef.current;
    if (pContainer && pContainer.childNodes.length === 0) {
      for (let i = 0; i < 30; i++) {
        const particle = document.createElement("div");
        particle.className = "absolute rounded-full bg-blue-500/20 pointer-events-none mix-blend-screen";
        const size = Math.random() * 6 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.opacity = (Math.random() * 0.5 + 0.1).toString();
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * -20;
        particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite alternate`;
        pContainer.appendChild(particle);
      }
    }

    return () => {
      window.removeEventListener("resize", syncSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes float {
          0% { transform: translateY(0) translateX(0); opacity: 0.1; }
          50% { opacity: 0.6; }
          100% { transform: translateY(-100px) translateX(20px); opacity: 0.1; }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(74, 0, 18, 0.2)); }
          50% { transform: scale(1.05); filter: drop-shadow(0 0 25px rgba(74, 0, 18, 0.4)); }
        }
        .animate-breathe { animation: breathe 4s ease-in-out infinite; }
      `}</style>
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
        <canvas ref={canvasRef} className="block w-full h-full" />
      </div>
      <div ref={particlesRef} className="absolute inset-0 z-0 pointer-events-none overflow-hidden" />
      <div className="absolute inset-0 w-full h-full bg-linear-to-b from-white/20 via-white/10 to-white/40 dark:from-black/20 dark:via-black/10 dark:to-black/40 pointer-events-none md:hidden z-0"></div>
    </>
  );
}
