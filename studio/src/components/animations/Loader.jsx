"use client";

import gsap from "gsap";
import * as THREE from "three";
import { GREETINGS } from "@/utils/basic";
import { pushToDataLayer } from "@/lib/gtm";
import { getLoaderStyles } from "@/utils/swatch";
import { useTheme } from "@/context/ThemeContext";
import { useEffect, useRef, useState } from "react";
import { hasLocationPreference } from "@/utils/stage";
import LocationModal from "@/components/modals/LocationModal";
import { createThreeTimer } from "@/lib/performance/threeTimer";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { getQualityPreset, getRendererPixelRatio } from "@/lib/performance/applyQualityTier";

export default function Loader({ onFinish }) {
  const { theme } = useTheme();
  const containerRef = useRef(null);

  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const { tier } = usePerformanceTier();
  const quality = getQualityPreset(tier);

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const progressRef = useRef(0);
  const lastTimeRef = useRef(0);
  const pausePointRef = useRef(null);
  const trackingFired = useRef(false);
  const modalTriggeredRef = useRef(false);

  const { bgColorClass, textColorClass, textFadedClass, progressBgClass, progressFillClass } = getLoaderStyles(theme);

  useEffect(() => {
    if (!tier) return;
    if (trackingFired.current) return;

    const deviceType = isMobile ? "mobile" : "desktop";

    pushToDataLayer("performance_tier_evaluated", { perf_tier: tier });
    pushToDataLayer("device_type", { device_type: deviceType });

    trackingFired.current = true;
  }, [tier, isMobile]);

  useEffect(() => {
    pausePointRef.current = Math.floor(Math.random() * 30) + 20;
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)");

    const handle = setTimeout(() => {
      setMounted(true);
      setIsMobile(media.matches);
    }, 0);

    const handler = (event) => {
      setIsMobile(event.matches);
    };

    media.addEventListener("change", handler);

    return () => {
      clearTimeout(handle);
      media.removeEventListener("change", handler);
    };
  }, []);

  useEffect(() => {
    let frameId;

    lastTimeRef.current = performance.now();
    const DURATION_MS = GREETINGS.length * 400;

    const animate = (time) => {
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      if (!isPaused) {
        progressRef.current += (100 / DURATION_MS) * delta;

        const next = Math.min(progressRef.current, 100);
        setProgress(next);

        const hasPreference = typeof window !== "undefined" && hasLocationPreference();

        if (!hasPreference && !modalTriggeredRef.current && next >= pausePointRef.current) {
          modalTriggeredRef.current = true;

          setIsPaused(true);
          setShowLocationModal(true);

          return;
        }

        if (next >= 100) {
          setProgress(100);

          setTimeout(() => {
            setDone(true);
            onFinish?.();
          }, 800);

          return;
        }
      }

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isPaused, onFinish]);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    const fogColor = theme === "dark" || theme === "metal" ? 0x000000 : 0xffffff;

    scene.fog = new THREE.Fog(fogColor, 6, 18);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = isMobile ? 6 : 5;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile && quality.antialias,
      powerPreference: tier === "tier_1" ? "high-performance" : "default",
    });

    renderer.setPixelRatio(isMobile ? 1 : getRendererPixelRatio(tier));
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    let controls;

    if (!isMobile && tier === "tier_1") {
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
    }

    const geometry = new THREE.BufferGeometry();
    const count = Math.round((isMobile ? 850 : 2000) * quality.particleMultiplier);
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particleColor = theme === "metal" ? 0xff0000 : theme === "dark" ? 0xffffff : 0x111111;

    const material = new THREE.PointsMaterial({
      size: isMobile ? 0.025 : 0.02,
      color: particleColor,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);

    scene.add(points);

    let frameId;
    const timer = createThreeTimer();

    function animate() {
      frameId = requestAnimationFrame(animate);

      const delta = Math.min(timer.update(), 0.033);
      const speed = delta * 60;

      points.rotation.y += (isMobile ? 0.0025 : 0.0035) * speed;
      points.rotation.x += (isMobile ? 0.001 : 0.0018) * speed;

      controls?.update();
      renderer.render(scene, camera);
    }

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);

      window.removeEventListener("resize", handleResize);

      controls?.dispose();

      scene.remove(points);
      geometry.dispose();
      material.dispose();
      renderer.setAnimationLoop(null);
      renderer.dispose();
      renderer.forceContextLoss?.();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [mounted, isMobile, quality.antialias, quality.particleMultiplier, tier, theme]);

  useEffect(() => {
    if (!done) return;

    const container = containerRef.current;

    if (!container) return;

    gsap.to(container, {
      scale: isMobile ? 2 : 3,
      opacity: 0,
      duration: 1.2,
      ease: "power4.inOut",
    });

    return () => {
      gsap.killTweensOf(container);
    };
  }, [done, isMobile]);

  const handleLocationSelected = () => {
    setShowLocationModal(false);

    setTimeout(() => {
      lastTimeRef.current = performance.now();
      setIsPaused(false);
    }, 300);
  };

  const greetingIndex = Math.min(Math.floor((progress / 100) * GREETINGS.length), GREETINGS.length - 1);

  return (
    <div className={`fixed inset-0 z-999 overflow-hidden ${bgColorClass}`}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(59,130,246,0.10),transparent_60%)]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.06),transparent_55%)]" />

        <div className="absolute inset-0 bg-linear-to-b from-transparent via-blue-50/10 to-transparent" />
      </div>

      <div className={`absolute inset-0 pointer-events-none text-xl font-light ${textFadedClass}`}>
        <div className="absolute top-8 left-8">+</div>
        <div className="absolute top-8 right-8">+</div>
        <div className="absolute bottom-8 left-8">+</div>
        <div className="absolute bottom-8 right-8">+</div>
      </div>

      <div ref={containerRef} className="absolute inset-0" />

      <div className={`absolute top-0 left-0 z-50 h-1.5 w-full ${progressBgClass}`}>
        <div className={`h-full ${progressFillClass}`} style={{ width: `${progress}%` }} />
      </div>

      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <div className="relative flex h-20 w-full items-center justify-center overflow-hidden">
          {GREETINGS.map((greeting, idx) => {
            let offset = 1;

            if (idx === greetingIndex) {
              offset = 0;
            } else if (idx < greetingIndex) {
              offset = -1;
            }

            return (
              <span
                key={`${greeting}-${idx}`}
                className={`loader-greeting absolute ${isMobile ? "text-[16px]" : "text-[22px]"} font-bold tracking-tight transition-all duration-450 ease-[cubic-bezier(0.22,1,0.36,1)] ${textColorClass}`}
                style={{
                  opacity: offset === 0 ? 1 : 0,
                  transform: `translateY(${offset * 32}px)`,
                }}>
                {greeting}
              </span>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-12 z-10 flex w-full justify-center px-6 text-center pointer-events-none">
        <h1
          className={`${
            isMobile ? "text-2xl" : "text-[clamp(0.5em,2vw,1.5rem)]"
          } font-black leading-[0.82] tracking-tighter md:tracking-[-0.09em] will-change-transform ${textColorClass}`}
          style={{ fontFeatureSettings: '"ss01" on, "ss02" on' }}>
          AKHIL SHETTY M
        </h1>
      </div>

      <LocationModal open={showLocationModal} onComplete={handleLocationSelected} />
    </div>
  );
}
