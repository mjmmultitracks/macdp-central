import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, ZoomIn, ZoomOut, Eye, Sparkles, RefreshCw } from 'lucide-react';

interface Shirt3DViewerProps {
  frontImageUrl?: string;
  backImageUrl?: string;
  eventTitle: string;
  baseColor?: string;
  category?: string;
  isKids?: boolean;
}

export const Shirt3DViewer: React.FC<Shirt3DViewerProps> = ({
  frontImageUrl,
  backImageUrl,
  eventTitle,
  baseColor = '#361c0e',
  category = 'Conferência',
  isKids = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const currentColor = baseColor;
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [currentView, setCurrentView] = useState<'frente' | 'costas' | 'lado' | 'livre'>('frente');
  const [isLoaded, setIsLoaded] = useState(false);

  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const shirtGroupRef = useRef<THREE.Group | null>(null);
  const panelMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const coreMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const reqAnimationRef = useRef<number | null>(null);

  // Target rotation for smooth transitions
  const targetRotationYRef = useRef(0);
  const targetRotationXRef = useRef(0);
  const currentRotationYRef = useRef(0);
  const currentRotationXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const autoRotateSpeedRef = useRef(0.008);

  // Helper to generate a default high-res canvas texture for the shirt front
  const createDefaultFrontTexture = (title: string, kids: boolean) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, 1024, 1024);

    // Glow circle background
    const grad = ctx.createRadialGradient(512, 480, 50, 512, 480, 360);
    grad.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
    grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Decorative geometric ring
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(512, 480, 240, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(512, 480, 260, 0, Math.PI * 2);
    ctx.stroke();

    // Emblem Icon / Crown / Flame
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 70px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👑', 512, 350);

    // Main Hebrew Word DOROT or KIDS badge
    if (kids) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = '900 68px system-ui, -apple-system, sans-serif';
      ctx.fillText('CAÇADORES', 512, 430);
      ctx.fillStyle = '#f59e0b';
      ctx.font = '900 95px system-ui, -apple-system, sans-serif';
      ctx.fillText('KIDS 2026', 512, 515);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
      ctx.fillText('PEQUENOS SOLDADOS DA GLÓRIA', 512, 580);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 44px system-ui, -apple-system, sans-serif';
      ctx.fillText('CONFERÊNCIA PROFÉTICA', 512, 395);

      ctx.fillStyle = '#f59e0b';
      ctx.font = '900 110px system-ui, -apple-system, sans-serif';
      ctx.fillText('DOROT', 512, 490);

      // Hebrew letters (Gerações)
      ctx.fillStyle = 'rgba(245, 158, 11, 0.85)';
      ctx.font = 'bold 42px system-ui, -apple-system, sans-serif';
      ctx.fillText('דּוֹרוֹת • 2026', 512, 555);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '600 30px system-ui, -apple-system, sans-serif';
      ctx.fillText('CAÇADORES DA PRESENÇA', 512, 605);
    }

    // Bottom banner
    ctx.fillStyle = 'rgba(245, 158, 11, 0.9)';
    ctx.fillRect(362, 650, 300, 4);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.fillText('MACDP CENTRAL • CHÁCARA PARAÍSO VERDE', 512, 690);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;
    return texture;
  };

  // Helper to generate a default high-res canvas texture for the shirt back
  const createDefaultBackTexture = (title: string, kids: boolean) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, 1024, 1024);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Top Collar Arch
    ctx.fillStyle = '#f59e0b';
    ctx.font = '900 42px system-ui, -apple-system, sans-serif';
    ctx.fillText('MINISTÉRIO APOSTÓLICO', 512, 340);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 64px system-ui, -apple-system, sans-serif';
    ctx.fillText('CAÇADORES DA PRESENÇA', 512, 410);

    // Cross / Flame Symbol
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
    ctx.lineWidth = 3;
    ctx.strokeRect(380, 460, 264, 2);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 500 34px system-ui, -apple-system, sans-serif';
    ctx.fillText('"Proibido a Entrada de Pessoas Perfeitas"', 512, 510);

    // Big central thematic scripture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
    ctx.fillText('UMA GERAÇÃO QUE NÃO NEGOCIA A GLÓRIA', 512, 610);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 30px system-ui, -apple-system, sans-serif';
    ctx.fillText('IRANDUBA / AM • RETIRO & CONFERÊNCIA', 512, 675);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;
    return texture;
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 480;
    const height = mountRef.current.clientHeight || 420;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.3, 5.8);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // 4. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // Key Light (Warm Gold Tone)
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.8);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    // Fill Light (Cool Neutral)
    const fillLight = new THREE.DirectionalLight(0xdbeafe, 1.2);
    fillLight.position.set(-4, 3, 4);
    scene.add(fillLight);

    // Rim/Back Light (Separation and Edge Sheen)
    const rimLight = new THREE.DirectionalLight(0xf59e0b, 1.6);
    rimLight.position.set(0, 4, -5);
    scene.add(rimLight);

    // Bottom bounce light
    const bounceLight = new THREE.DirectionalLight(0xffffff, 0.5);
    bounceLight.position.set(0, -5, 2);
    scene.add(bounceLight);

    // 5. Construct T-Shirt 3D Geometry
    const shirtGroup = new THREE.Group();
    shirtGroupRef.current = shirtGroup;
    scene.add(shirtGroup);

    const hasCustomImages = Boolean(frontImageUrl && backImageUrl);
    const loader = new THREE.TextureLoader();

    if (hasCustomImages) {
      // ===== PHOTOREALISTIC CURVED 3D GARMENT FROM CUTOUT MOCKUPS =====
      const width = 3.12;
      const height = 4.41;
      const segX = 32;
      const segY = 32;

      // A. Front Curved Panel
      const frontGeo = new THREE.PlaneGeometry(width, height, segX, segY);
      const frontPos = frontGeo.attributes.position;
      for (let i = 0; i < frontPos.count; i++) {
        const x = frontPos.getX(i);
        const y = frontPos.getY(i);
        const normX = x / (width / 2); // -1 to 1
        const curveX = (1 - normX * normX) * 0.22;
        const curveY = y > 0.4 ? Math.sin(((y - 0.4) / 1.8) * Math.PI) * 0.08 : 0;
        frontPos.setZ(i, curveX + curveY);
      }
      frontGeo.computeVertexNormals();

      const frontTex = loader.load(frontImageUrl!);
      frontTex.anisotropy = 8;
      frontTex.colorSpace = THREE.SRGBColorSpace;

      const isBaseOriginal = currentColor.toLowerCase() === baseColor.toLowerCase() || currentColor === '#361c0e';
      const frontMat = new THREE.MeshStandardMaterial({
        map: frontTex,
        color: isBaseOriginal ? new THREE.Color(0xffffff) : new THREE.Color(currentColor),
        transparent: true,
        alphaTest: 0.03,
        roughness: 0.62,
        metalness: 0.06,
        side: THREE.FrontSide,
      });
      panelMaterialsRef.current.push(frontMat);

      const frontMesh = new THREE.Mesh(frontGeo, frontMat);
      frontMesh.position.set(0, 0, 0.12);
      shirtGroup.add(frontMesh);

      // B. Back Curved Panel
      const backGeo = new THREE.PlaneGeometry(width, height, segX, segY);
      const backPos = backGeo.attributes.position;
      for (let i = 0; i < backPos.count; i++) {
        const x = backPos.getX(i);
        const y = backPos.getY(i);
        const normX = x / (width / 2);
        const curveX = (1 - normX * normX) * 0.22;
        const curveY = y > 0.4 ? Math.sin(((y - 0.4) / 1.8) * Math.PI) * 0.08 : 0;
        backPos.setZ(i, curveX + curveY);
      }
      backGeo.computeVertexNormals();

      const backTex = loader.load(backImageUrl!);
      backTex.anisotropy = 8;
      backTex.colorSpace = THREE.SRGBColorSpace;

      const backMat = new THREE.MeshStandardMaterial({
        map: backTex,
        color: isBaseOriginal ? new THREE.Color(0xffffff) : new THREE.Color(currentColor),
        transparent: true,
        alphaTest: 0.03,
        roughness: 0.62,
        metalness: 0.06,
        side: THREE.FrontSide,
      });
      panelMaterialsRef.current.push(backMat);

      const backMesh = new THREE.Mesh(backGeo, backMat);
      backMesh.rotation.y = Math.PI;
      backMesh.position.set(0, 0, -0.12);
      shirtGroup.add(backMesh);

      // C. Inner Volumetric Mannequin / Torso Core (Gives tangible 3D thickness from all angles)
      const coreGeo = new THREE.CylinderGeometry(1.05, 0.98, 2.7, 36, 8);
      coreGeo.scale(1.0, 1.0, 0.24);
      const coreMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(currentColor).multiplyScalar(0.7),
        roughness: 0.88,
        metalness: 0.04,
      });
      coreMaterialsRef.current.push(coreMat);
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.position.set(0, -0.15, 0);
      shirtGroup.add(coreMesh);

      // D. Realistic Inner Collar Ring (Depth inside neck opening)
      const collarGeo = new THREE.TorusGeometry(0.46, 0.07, 16, 36);
      collarGeo.scale(1.0, 0.52, 1.0);
      const collarMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(currentColor).multiplyScalar(0.55),
        roughness: 0.92,
      });
      coreMaterialsRef.current.push(collarMat);
      const collarMesh = new THREE.Mesh(collarGeo, collarMat);
      collarMesh.rotation.x = Math.PI / 2;
      collarMesh.position.set(0, 1.34, 0);
      shirtGroup.add(collarMesh);

    } else {
      // ===== PROCEDURAL 3D SHIRT (FALLBACK FOR EVENTS WITHOUT MOCKUPS) =====
      const fabricMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(currentColor),
        roughness: 0.68,
        metalness: 0.08,
        flatShading: false,
      });
      coreMaterialsRef.current.push(fabricMaterial);

      // Torso
      const torsoGeo = new THREE.CylinderGeometry(1.22, 1.18, 2.5, 48, 16, true);
      torsoGeo.scale(1.0, 1.0, 0.46);
      const torsoMesh = new THREE.Mesh(torsoGeo, fabricMaterial);
      torsoMesh.position.y = -0.15;
      shirtGroup.add(torsoMesh);

      // Bottom cap
      const bottomCapGeo = new THREE.CylinderGeometry(1.18, 1.18, 0.05, 48);
      bottomCapGeo.scale(1.0, 1.0, 0.46);
      const bottomCapMesh = new THREE.Mesh(bottomCapGeo, fabricMaterial);
      bottomCapMesh.position.y = -1.4;
      shirtGroup.add(bottomCapMesh);

      // Shoulders
      const shoulderGeo = new THREE.CylinderGeometry(0.72, 1.22, 0.65, 48, 12);
      shoulderGeo.scale(1.0, 1.0, 0.46);
      const shoulderMesh = new THREE.Mesh(shoulderGeo, fabricMaterial);
      shoulderMesh.position.y = 1.35;
      shirtGroup.add(shoulderMesh);

      // Collar
      const collarGeo = new THREE.TorusGeometry(0.52, 0.075, 20, 48);
      collarGeo.scale(1.0, 0.62, 1.0);
      const collarMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(currentColor).multiplyScalar(0.92),
        roughness: 0.85,
      });
      coreMaterialsRef.current.push(collarMat);
      const collarMesh = new THREE.Mesh(collarGeo, collarMat);
      collarMesh.rotation.x = Math.PI / 2;
      collarMesh.position.set(0, 1.62, 0);
      shirtGroup.add(collarMesh);

      // Sleeves
      const sleeveGeo = new THREE.CylinderGeometry(0.48, 0.42, 1.0, 32);
      const leftSleeve = new THREE.Mesh(sleeveGeo, fabricMaterial);
      leftSleeve.position.set(-1.42, 1.0, 0);
      leftSleeve.rotation.z = -Math.PI / 3.4;
      leftSleeve.rotation.y = 0.12;
      leftSleeve.scale.set(1.0, 1.0, 0.72);
      shirtGroup.add(leftSleeve);

      const rightSleeve = new THREE.Mesh(sleeveGeo, fabricMaterial);
      rightSleeve.position.set(1.42, 1.0, 0);
      rightSleeve.rotation.z = Math.PI / 3.4;
      rightSleeve.rotation.y = -0.12;
      rightSleeve.scale.set(1.0, 1.0, 0.72);
      shirtGroup.add(rightSleeve);

      // Front Graphic Decal
      const frontTex = createDefaultFrontTexture(eventTitle, isKids);
      const frontDecalGeo = new THREE.PlaneGeometry(1.65, 1.85, 16, 16);
      const frontPos = frontDecalGeo.attributes.position;
      for (let i = 0; i < frontPos.count; i++) {
        const x = frontPos.getX(i);
        frontPos.setZ(i, -Math.pow(x / 1.65, 2) * 0.14);
      }
      frontDecalGeo.computeVertexNormals();

      const frontDecalMat = new THREE.MeshBasicMaterial({
        map: frontTex,
        transparent: true,
        opacity: 0.96,
        depthWrite: false,
      });
      const frontDecalMesh = new THREE.Mesh(frontDecalGeo, frontDecalMat);
      frontDecalMesh.position.set(0, 0.12, 0.285);
      shirtGroup.add(frontDecalMesh);

      // Back Graphic Decal
      const backTex = createDefaultBackTexture(eventTitle, isKids);
      const backDecalGeo = new THREE.PlaneGeometry(1.65, 1.85, 16, 16);
      const backPos = backDecalGeo.attributes.position;
      for (let i = 0; i < backPos.count; i++) {
        const x = backPos.getX(i);
        backPos.setZ(i, -Math.pow(x / 1.65, 2) * 0.14);
      }
      backDecalGeo.computeVertexNormals();

      const backDecalMat = new THREE.MeshBasicMaterial({
        map: backTex,
        transparent: true,
        opacity: 0.96,
        depthWrite: false,
      });
      const backDecalMesh = new THREE.Mesh(backDecalGeo, backDecalMat);
      backDecalMesh.rotation.y = Math.PI;
      backDecalMesh.position.set(0, 0.12, -0.285);
      shirtGroup.add(backDecalMesh);
    }

    // Ground Shadow Plate (Soft Studio Pedestal)
    const shadowGeo = new THREE.PlaneGeometry(3.6, 2.2);
    const canvasShadow = document.createElement('canvas');
    canvasShadow.width = 256;
    canvasShadow.height = 256;
    const ctxS = canvasShadow.getContext('2d');
    if (ctxS) {
      const g = ctxS.createRadialGradient(128, 128, 20, 128, 128, 120);
      g.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
      g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctxS.fillStyle = g;
      ctxS.fillRect(0, 0, 256, 256);
    }
    const shadowTex = new THREE.CanvasTexture(canvasShadow);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, -2.15, 0);
    scene.add(shadowMesh);

    setIsLoaded(true);

    // 6. Animation Loop with Smooth Interpolation
    let animationFrameId = 0;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (isAutoRotating && !isDraggingRef.current) {
        targetRotationYRef.current += autoRotateSpeedRef.current;
      }

      // Smooth damping (LERP)
      currentRotationYRef.current += (targetRotationYRef.current - currentRotationYRef.current) * 0.1;
      currentRotationXRef.current += (targetRotationXRef.current - currentRotationXRef.current) * 0.1;

      if (shirtGroupRef.current) {
        shirtGroupRef.current.rotation.y = currentRotationYRef.current;
        shirtGroupRef.current.rotation.x = currentRotationXRef.current;
        // Subtle floating breathing effect
        shirtGroupRef.current.position.y = Math.sin(Date.now() * 0.002) * 0.04;
      }

      renderer.render(scene, camera);
    };
    animate();
    reqAnimationRef.current = animationFrameId;

    // 7. Mouse & Touch Drag Event Handlers
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      setIsAutoRotating(false);
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - prevMousePosRef.current.x;
      const deltaY = e.clientY - prevMousePosRef.current.y;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };

      targetRotationYRef.current += deltaX * 0.008;
      targetRotationXRef.current = Math.max(-0.35, Math.min(0.35, targetRotationXRef.current + deltaY * 0.004));
      setCurrentView('livre');
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      const newZ = cameraRef.current.position.z + e.deltaY * 0.005;
      cameraRef.current.position.z = Math.max(3.8, Math.min(7.2, newZ));
    };

    // Touch Handlers
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        setIsAutoRotating(false);
        prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMousePosRef.current.x;
      const deltaY = e.touches[0].clientY - prevMousePosRef.current.y;
      prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      targetRotationYRef.current += deltaX * 0.01;
      targetRotationXRef.current = Math.max(-0.35, Math.min(0.35, targetRotationXRef.current + deltaY * 0.005));
      setCurrentView('livre');
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    const el = renderer.domElement;
    el.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    el.addEventListener('wheel', handleWheel, { passive: false });

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      el.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      el.removeEventListener('wheel', handleWheel);

      el.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);

      if (mountRef.current && renderer.domElement) {
        mountRef.current.innerHTML = '';
      }
      renderer.dispose();
    };
  }, [frontImageUrl, backImageUrl, eventTitle, isKids]);

  // Update Color dynamically
  useEffect(() => {
    const isBaseOriginal = baseColor.toLowerCase() === '#361c0e' || Boolean(frontImageUrl && backImageUrl);
    panelMaterialsRef.current.forEach((mat) => {
      if (isBaseOriginal) {
        mat.color.set(0xffffff);
      } else {
        mat.color.set(baseColor);
      }
    });
    coreMaterialsRef.current.forEach((mat) => {
      mat.color.set(baseColor);
    });
  }, [baseColor, frontImageUrl, backImageUrl]);

  // View switchers
  const setViewFront = () => {
    setIsAutoRotating(false);
    targetRotationYRef.current = 0;
    targetRotationXRef.current = 0;
    setCurrentView('frente');
  };

  const setViewBack = () => {
    setIsAutoRotating(false);
    targetRotationYRef.current = Math.PI;
    targetRotationXRef.current = 0;
    setCurrentView('costas');
  };

  const setViewSide = () => {
    setIsAutoRotating(false);
    targetRotationYRef.current = Math.PI / 2;
    targetRotationXRef.current = 0;
    setCurrentView('lado');
  };

  const toggleAutoRotate = () => {
    setIsAutoRotating(!isAutoRotating);
  };

  const resetZoom = (direction: 'in' | 'out') => {
    if (!cameraRef.current) return;
    const factor = direction === 'in' ? -0.5 : 0.5;
    cameraRef.current.position.z = Math.max(3.8, Math.min(7.2, cameraRef.current.position.z + factor));
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '420px',
        borderRadius: '16px',
        background: 'radial-gradient(circle at 50% 40%, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        boxShadow: 'inset 0 0 60px rgba(0, 0, 0, 0.5), 0 10px 30px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 3D WebGL Canvas */}
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '100%',
          cursor: isDraggingRef.current ? 'grabbing' : 'grab',
        }}
      />

      {/* Top Floating Badges */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          right: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            color: 'var(--accent-gold)',
            fontSize: '0.8rem',
            fontWeight: 800,
          }}
        >
          <Sparkles size={14} />
          <span>Visualizador 3D Interativo 360°</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '0.25rem 0.65rem',
            borderRadius: '6px',
            color: '#94a3b8',
            fontSize: '0.72rem',
          }}
        >
          <span>Arraste para girar</span>
        </div>
      </div>


      {/* Control Buttons (Bottom Right) */}
      <div
        style={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          padding: '0.4rem 0.65rem',
          borderRadius: '30px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        <button
          type="button"
          onClick={setViewFront}
          style={{
            background: currentView === 'frente' ? 'var(--accent-gold)' : 'transparent',
            color: currentView === 'frente' ? '#0f172a' : '#cbd5e1',
            border: 'none',
            borderRadius: '16px',
            padding: '0.25rem 0.65rem',
            fontSize: '0.75rem',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          Frente
        </button>

        <button
          type="button"
          onClick={setViewBack}
          style={{
            background: currentView === 'costas' ? 'var(--accent-gold)' : 'transparent',
            color: currentView === 'costas' ? '#0f172a' : '#cbd5e1',
            border: 'none',
            borderRadius: '16px',
            padding: '0.25rem 0.65rem',
            fontSize: '0.75rem',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          Costas
        </button>

        <button
          type="button"
          onClick={setViewSide}
          style={{
            background: currentView === 'lado' ? 'var(--accent-gold)' : 'transparent',
            color: currentView === 'lado' ? '#0f172a' : '#cbd5e1',
            border: 'none',
            borderRadius: '16px',
            padding: '0.25rem 0.65rem',
            fontSize: '0.75rem',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          Perfil
        </button>

        <div style={{ width: '1px', height: '18px', background: 'rgba(255, 255, 255, 0.2)' }} />

        <button
          type="button"
          onClick={toggleAutoRotate}
          title={isAutoRotating ? 'Pausar Rotação' : 'Girar 360°'}
          style={{
            background: isAutoRotating ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
            color: isAutoRotating ? 'var(--accent-gold)' : '#cbd5e1',
            border: 'none',
            borderRadius: '50%',
            width: '26px',
            height: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <RotateCw size={14} className={isAutoRotating ? 'animate-spin' : ''} />
        </button>

        <button
          type="button"
          onClick={() => resetZoom('in')}
          title="Aproximar Zoom"
          style={{
            background: 'transparent',
            color: '#cbd5e1',
            border: 'none',
            borderRadius: '50%',
            width: '26px',
            height: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ZoomIn size={14} />
        </button>

        <button
          type="button"
          onClick={() => resetZoom('out')}
          title="Afastar Zoom"
          style={{
            background: 'transparent',
            color: '#cbd5e1',
            border: 'none',
            borderRadius: '50%',
            width: '26px',
            height: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ZoomOut size={14} />
        </button>
      </div>
    </div>
  );
};
