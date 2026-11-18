import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Hero3DProps {
  /** Versão leve: menos partículas, sem feixes de luz e menor resolução. */
  lite?: boolean;
}

const GOLD = 0xf5b13d;

/** Textura redonda e suave para as partículas. */
function makeParticleTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,220,140,0.55)');
  g.addColorStop(1, 'rgba(255,200,80,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

/**
 * Fundo 3D da capa: logo da MACDP em camadas (efeito de volume), partículas douradas e
 * feixes de luz de palco. Reage ao mouse e ao scroll.
 */
export default function Hero3D({ lite = false }: Hero3DProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !lite, powerPreference: 'low-power' });
    } catch {
      return; // Sem WebGL: a capa continua funcionando sem o 3D.
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lite ? 1.25 : 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const FOV = 35;
    const DIST = 9;
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
    camera.position.z = DIST;

    // ---------- Logo em camadas ----------
    const logoGroup = new THREE.Group();
    scene.add(logoGroup);
    const layerMaterials: THREE.MeshBasicMaterial[] = [];
    const layerCount = lite ? 10 : 18;
    const depth = 0.55;
    const geometry = new THREE.PlaneGeometry(1, 1);
    const backColor = new THREE.Color(0xb7791f);
    const frontColor = new THREE.Color(0xffffff);
    new THREE.TextureLoader().load('/images/logo.png', (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      for (let i = 0; i < layerCount; i++) {
        const t = i / (layerCount - 1); // 0 = fundo, 1 = frente
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          depthWrite: false,
          color: backColor.clone().lerp(frontColor, Math.pow(t, 2.2)),
        });
        layerMaterials.push(material);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.z = -depth + t * depth;
        mesh.renderOrder = i;
        logoGroup.add(mesh);
      }
    });

    // ---------- Partículas ----------
    const particleCount = lite ? 70 : 200;
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);
    const spread = { x: 16, y: 10, z: 8 };
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spread.x;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread.y;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread.z - 1;
      speeds[i] = 0.1 + Math.random() * 0.25;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleTexture = makeParticleTexture();
    const particleMaterial = new THREE.PointsMaterial({
      map: particleTexture,
      color: GOLD,
      size: lite ? 0.2 : 0.16,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // ---------- Feixes de luz de palco ----------
    const beams: THREE.Mesh[] = [];
    const beamGeometry = new THREE.ConeGeometry(1.1, 11, 24, 1, true);
    const beamMaterials: THREE.MeshBasicMaterial[] = [];
    if (!lite) {
      const beamSetup = [
        { x: -4.5, color: GOLD, opacity: 0.07, rot: 0.25 },
        { x: 0.5, color: 0xffe2a8, opacity: 0.06, rot: -0.1 },
        { x: 5, color: 0x6f8cff, opacity: 0.07, rot: -0.28 },
      ];
      beamSetup.forEach((b) => {
        const material = new THREE.MeshBasicMaterial({
          color: b.color,
          transparent: true,
          opacity: b.opacity,
          side: THREE.DoubleSide,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        beamMaterials.push(material);
        const beam = new THREE.Mesh(beamGeometry, material);
        beam.position.set(b.x, 6.5, -3);
        beam.rotation.z = b.rot;
        beam.userData.baseRot = b.rot;
        beams.push(beam);
        scene.add(beam);
      });
    }

    // ---------- Tamanho e posição responsivos ----------
    let viewW = 1;
    let viewH = 1;
    let isNarrow = false;
    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      viewH = 2 * Math.tan((FOV * Math.PI) / 360) * DIST;
      viewW = viewH * camera.aspect;
      isNarrow = w < 760;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

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

    // ---------- Loop ----------
    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden) return;

      const t = clock.getElapsedTime();
      const heroHeight = host.clientHeight || window.innerHeight;
      const scroll = Math.min(Math.max(window.scrollY / heroHeight, 0), 1.2);

      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;

      // Logo: tamanho/posição conforme a tela; gira com mouse e scroll; some ao rolar
      const logoSize = isNarrow ? viewW * 0.7 : Math.min(viewH * 0.62, viewW * 0.36);
      logoGroup.scale.setScalar(logoSize);
      logoGroup.position.x = isNarrow ? 0 : viewW * 0.23;
      logoGroup.position.y = (isNarrow ? viewH * 0.2 : viewH * 0.03) + scroll * viewH * 0.35 + Math.sin(t * 0.8) * 0.08;
      logoGroup.rotation.y = Math.sin(t * 0.5) * 0.22 + pointer.x * 0.4 + scroll * 1.3;
      logoGroup.rotation.x = pointer.y * 0.15 - scroll * 0.25;
      const logoOpacity = (isNarrow ? 0.38 : 0.95) * (1 - Math.min(scroll, 1) * 0.9);
      layerMaterials.forEach((m) => {
        m.opacity = logoOpacity;
      });

      // Partículas sobem devagar e fazem parallax com o scroll
      const pos = particleGeometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        let y = pos.getY(i) + speeds[i] * 0.012;
        if (y > spread.y / 2) y = -spread.y / 2;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
      particles.position.y = scroll * 3;
      particles.rotation.y = pointer.x * 0.08 + t * 0.01;

      // Feixes balançam suavemente e acompanham o scroll
      beams.forEach((beam, i) => {
        beam.rotation.z = beam.userData.baseRot + Math.sin(t * 0.35 + i * 1.7) * 0.07 + scroll * 0.18 * (i - 1);
        beamMaterials[i].opacity = (0.05 + 0.03 * Math.sin(t * 0.6 + i)) * (1 - Math.min(scroll, 1) * 0.8);
      });

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onPointer);
      geometry.dispose();
      particleGeometry.dispose();
      beamGeometry.dispose();
      particleTexture.dispose();
      particleMaterial.dispose();
      beamMaterials.forEach((m) => m.dispose());
      layerMaterials.forEach((m) => {
        m.map?.dispose();
        m.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [lite]);

  return <div ref={hostRef} className="hero-3d" aria-hidden="true" />;
}
