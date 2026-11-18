import { useEffect, useRef } from 'react';

/**
 * Versão do fundo animado que NÃO depende de WebGL: o logo em camadas usa transformações 3D de CSS,
 * as partículas usam canvas 2D e os feixes de luz são degradês animados.
 */
const LAYERS = 12;
const GAP = 3; // px entre camadas (profundidade)

export default function Hero3DLite({ lite = false }: { lite?: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const logo = logoRef.current;
    const canvas = canvasRef.current;
    if (!host || !logo || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ---------- Partículas (canvas 2D) ----------
    const count = lite ? 40 : 90;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 1;
    let h = 1;
    const resize = () => {
      w = host.clientWidth || 1;
      h = host.clientHeight || 1;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 48;
    const sctx = sprite.getContext('2d')!;
    const grad = sctx.createRadialGradient(24, 24, 0, 24, 24, 24);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.35, 'rgba(255,215,130,0.55)');
    grad.addColorStop(1, 'rgba(255,190,70,0)');
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 48, 48);

    const parts = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      s: 6 + Math.random() * 14,
      v: 0.012 + Math.random() * 0.03,
      a: 0.25 + Math.random() * 0.6,
      d: Math.random() * Math.PI * 2,
    }));

    // ---------- Interação ----------
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(host);

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden) {
        last = now;
        return;
      }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = now / 1000;
      const heroH = host.clientHeight || window.innerHeight;
      const scroll = Math.min(Math.max(window.scrollY / heroH, 0), 1.2);

      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;

      // Logo
      const ry = Math.sin(t * 0.5) * 12 + pointer.x * 24 + scroll * 75;
      const rx = -pointer.y * 9 - scroll * 12;
      const ty = -scroll * 90 + Math.sin(t * 0.8) * 4;
      logo.style.transform = `translateY(${ty}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      logo.style.opacity = String(Math.max(0, 1 - Math.min(scroll, 1) * 0.9));

      // Partículas
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (const p of parts) {
        p.y -= p.v * dt;
        if (p.y < -0.05) {
          p.y = 1.05;
          p.x = Math.random();
        }
        const px = p.x * w + Math.sin(t * 0.4 + p.d) * 12 + pointer.x * 14 * (p.s / 20);
        const py = p.y * h - scroll * 120 * (p.s / 20);
        ctx.globalAlpha = p.a * (0.7 + 0.3 * Math.sin(t * 1.2 + p.d));
        ctx.drawImage(sprite, px - p.s / 2, py - p.s / 2, p.s, p.s);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onPointer);
    };
  }, [lite]);

  const layers = lite ? 8 : LAYERS;

  return (
    <div ref={hostRef} className="hero-3d hero-3d-lite" aria-hidden="true">
      {!lite && (
        <>
          <span className="h3l-beam h3l-beam-a" />
          <span className="h3l-beam h3l-beam-b" />
          <span className="h3l-beam h3l-beam-c" />
        </>
      )}
      <canvas ref={canvasRef} className="h3l-canvas" />
      <div className="h3l-stage">
        <div ref={logoRef} className="h3l-logo">
          {Array.from({ length: layers }, (_, i) => {
            const t = i / (layers - 1); // 0 = fundo, 1 = frente
            const mix = Math.pow(t, 2.2);
            const r = Math.round(183 + (255 - 183) * mix);
            const g = Math.round(121 + (255 - 121) * mix);
            const b = Math.round(31 + (255 - 31) * mix);
            return (
              <span
                key={i}
                className="h3l-layer"
                style={{
                  transform: `translateZ(${(i - layers / 2) * GAP}px)`,
                  backgroundColor: `rgb(${r}, ${g}, ${b})`,
                }}
              />
            );
          })}
        </div>
      </div>

      <style>{`
        .hero-3d-lite { overflow: hidden; }
        .h3l-canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
        .h3l-stage {
          position: absolute;
          right: 7%;
          top: 50%;
          width: min(46vh, 34vw);
          aspect-ratio: 1;
          margin-top: calc(min(46vh, 34vw) / -2);
          perspective: 900px;
        }
        .h3l-logo { position: absolute; inset: 0; transform-style: preserve-3d; will-change: transform; }
        .h3l-layer {
          position: absolute;
          inset: 0;
          -webkit-mask: url('/images/logo.png') center / contain no-repeat;
          mask: url('/images/logo.png') center / contain no-repeat;
        }
        .h3l-beam {
          position: absolute;
          top: -10%;
          width: 22vw;
          height: 120%;
          transform-origin: 50% 0;
          mix-blend-mode: screen;
          filter: blur(14px);
          animation: h3l-sway 9s ease-in-out infinite alternate;
        }
        .h3l-beam-a { left: 8%; background: linear-gradient(180deg, rgba(245, 177, 61, 0.22), transparent 75%); clip-path: polygon(40% 0, 60% 0, 100% 100%, 0 100%); --r: 8deg; }
        .h3l-beam-b { left: 38%; background: linear-gradient(180deg, rgba(255, 226, 168, 0.18), transparent 70%); clip-path: polygon(42% 0, 58% 0, 100% 100%, 0 100%); --r: -5deg; animation-duration: 11s; }
        .h3l-beam-c { right: 6%; background: linear-gradient(180deg, rgba(111, 140, 255, 0.2), transparent 75%); clip-path: polygon(40% 0, 60% 0, 100% 100%, 0 100%); --r: -9deg; animation-duration: 10s; }
        @keyframes h3l-sway {
          from { transform: rotate(var(--r)); }
          to { transform: rotate(calc(var(--r) * -1)); }
        }
        @media (max-width: 1100px) {
          .h3l-stage { right: 3%; top: 33%; width: min(30vh, 22vw); margin-top: calc(min(30vh, 22vw) / -2); }
        }
        @media (max-width: 760px) {
          .h3l-stage { right: 50%; margin-right: calc(min(70vw, 340px) / -2); width: min(70vw, 340px); top: 24%; margin-top: 0; opacity: 0.35; }
          .h3l-beam { width: 40vw; }
        }
      `}</style>
    </div>
  );
}
