"use client";

import gsap from "gsap";
import * as THREE from "three";
import "@/styles/bubble_scene.css";
import { useTheme } from "@/context/ThemeContext";
import { useDeviceType } from "@/hooks/useDeviceType";
import { getBubbleSceneStyles } from "@/utils/swatch";
import { memo, useEffect, useRef, useState } from "react";
import { createThreeTimer } from "@/lib/performance/threeTimer";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import { getQualityPreset } from "@/lib/performance/applyQualityTier";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { RADII, POSITIONS, TEXTURE_PATHS, TECH_STACK } from "@/utils/basic";

function BubbleScene() {
  const { theme } = useTheme();
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const fogRef = useRef(null);
  const lightRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const { tier, isTier2 } = usePerformanceTier();
  const { isMobile } = useDeviceType();
  const quality = getQualityPreset(tier);

  const [techIndex, setTechIndex] = useState(0);

  const { isDark, isMetal, styles, gridBackground } = getBubbleSceneStyles(theme);

  useEffect(() => {
    if (fogRef.current) {
      fogRef.current.color.setHex(isDark ? 0x000000 : 0xffffff);
    }
    if (lightRef.current) {
      const lightColor = isMetal ? 0xff4444 : isDark ? 0xffffff : 0xdbeafe;
      lightRef.current.color.setHex(lightColor);
    }
  }, [isDark, isMetal]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTechIndex((prev) => (prev + 1) % TECH_STACK.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return undefined;

    let animationFrameId = null;
    let loadingComplete = false;
    let animationStarted = false;
    let sceneIsVisible = false;
    let mouseMoveTimeout;
    let resizeObserver;
    let frame = 0;
    let cachedIntersects = [];

    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (gl) {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    }

    const scene = new THREE.Scene();

    const initialFogColor = isDark ? "#000000" : "#ffffff";
    scene.fog = new THREE.Fog(initialFogColor, 20, 52);
    fogRef.current = scene.fog;

    const camera = new THREE.PerspectiveCamera(30, wrapper.clientWidth / wrapper.clientHeight, 0.1, 1000);
    camera.position.set(0, 0.3, 24);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: quality.antialias,
      powerPreference: "default",
    });

    renderer.setSize(wrapper.clientWidth, wrapper.clientHeight);
    const maxPixelRatio = isTier2 ? 1 : 1.25;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;

    const loader = new THREE.TextureLoader();
    const textures = TEXTURE_PATHS.map((name) => {
      const texture = loader.load(`/bubbles/bubbles.${name}.svg`);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.flipY = false;
      texture.repeat.set(1, -1);
      texture.offset.set(0, 1);
      return texture;
    });

    scene.add(new THREE.AmbientLight(0xffffff, 1.2));

    const initialLightColor = isMetal ? "#ff4444" : isDark ? "#ffffff" : "#dbeafe";
    const directionalLight = new THREE.DirectionalLight(initialLightColor, 0.8);
    directionalLight.position.set(8, 12, 10);
    scene.add(directionalLight);
    lightRef.current = directionalLight;

    const group = new THREE.Group();
    const baseScaleFactor = isMobile ? 0.75 : 1.0;
    const targetZRotation = isMobile ? -(Math.PI / 2) : 0;

    group.rotation.set(-0.16, 0, targetZRotation + 0.1);
    group.scale.setScalar(baseScaleFactor * 0.8);
    scene.add(group);

    const bubbles = POSITIONS.map((pos, index) => {
      const radius = RADII[index] ?? 0.5;
      const texture = textures[index % textures.length];
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });

      const bubble = new THREE.Sprite(material);
      const scale = radius * 3.2;
      const entryAngle = index * 0.62;
      const entryRadius = 2.5 + (index % 9) * 0.32;

      bubble.scale.set(0.05, 0.05, 0.05);
      bubble.position.set(Math.cos(entryAngle) * entryRadius, -6 + Math.sin(entryAngle) * 1.2, -6 - (index % 7) * 0.2);

      bubble.userData = {
        originalPosition: new THREE.Vector3(pos.x, pos.y, pos.z),
        baseScale: scale,
        velocity: new THREE.Vector3(),
        radius,
        hovered: false,
        floatOffset: Math.random() * Math.PI * 2,
      };
      group.add(bubble);
      return bubble;
    });

    const damping = 0.955;
    const mouseForce = 0.017;
    const returnStrength = 0.015;
    const floatSpeed = shouldReduceMotion || isTier2 ? 0.00025 : 0.00072;
    const floatAmplitude = shouldReduceMotion || isTier2 ? 0.06 : 0.19;
    const hoverScale = isTier2 ? 2.2 : 2.95;
    const mouse = new THREE.Vector2(-10, -10);
    const raycaster = new THREE.Raycaster();
    const tempVector = new THREE.Vector3();

    function startAnimation() {
      if (animationStarted) return;
      animationStarted = true;
      const duration = shouldReduceMotion || isTier2 ? 0.35 : 1.55;
      const scaleDuration = shouldReduceMotion || isTier2 ? 0.35 : 1.25;

      gsap.to(group.rotation, { x: 0, z: targetZRotation, duration, ease: "power3.out" });
      gsap.to(group.scale, {
        x: baseScaleFactor,
        y: baseScaleFactor,
        z: baseScaleFactor,
        duration,
        ease: "power3.out",
      });

      bubbles.forEach((bubble, index) => {
        const delay = shouldReduceMotion || isTier2 ? 0 : Math.min(index * 0.012, 0.8);
        const target = bubble.userData.originalPosition;

        gsap.to(bubble.material, { opacity: 1, duration: 0.45, delay, ease: "power2.out" });
        gsap.to(bubble.position, { x: target.x, y: target.y, z: target.z, duration, delay, ease: "expo.out" });
        gsap.to(bubble.scale, {
          x: bubble.userData.baseScale,
          y: bubble.userData.baseScale,
          duration: scaleDuration,
          delay,
          ease: shouldReduceMotion || isTier2 ? "power2.out" : "elastic.out(1, 0.7)",
        });
      });

      window.setTimeout(
        () => {
          loadingComplete = true;
        },
        shouldReduceMotion || isTier2 ? 420 : 1650,
      );
    }

    function handleCollisions() {
      const collisionCheckLimit = Math.min(bubbles.length, quality.bubbleCollisionLimit);
      for (let i = 0; i < collisionCheckLimit; i += 1) {
        const bubbleA = bubbles[i];
        const radiusA = bubbleA.userData.radius;
        const localLimit = Math.min(i + 12, bubbles.length);
        for (let j = i + 1; j < localLimit; j += 1) {
          const bubbleB = bubbles[j];
          const minDistance = (radiusA + bubbleB.userData.radius) * 1.3;
          const distanceSquared = bubbleA.position.distanceToSquared(bubbleB.position);

          if (distanceSquared === 0 || distanceSquared >= minDistance * minDistance) continue;

          const distance = Math.sqrt(distanceSquared);
          tempVector.subVectors(bubbleB.position, bubbleA.position).normalize();
          const correction = (minDistance - distance) * 0.014;

          bubbleA.position.addScaledVector(tempVector, -correction);
          bubbleB.position.addScaledVector(tempVector, correction);
        }
      }
    }

    const timer = createThreeTimer();
    const animate = () => {
      if (!sceneIsVisible) {
        animationFrameId = null;
        return;
      }
      animationFrameId = requestAnimationFrame(animate);
      timer.update();
      frame += 1;
      const time = performance.now() * floatSpeed;

      if (loadingComplete) {
        if (frame % 5 === 0) {
          if (mouse.x !== -10 && mouse.y !== -10) {
            raycaster.setFromCamera(mouse, camera);
            cachedIntersects = raycaster.intersectObjects(bubbles, false);
          } else {
            cachedIntersects = [];
          }
        }

        bubbles.forEach((bubble) => {
          const { originalPosition, velocity, floatOffset } = bubble.userData;

          if (!isTier2) {
            velocity.x +=
              (originalPosition.x + Math.cos(time * 0.8 + floatOffset) * 0.08 - bubble.position.x) * returnStrength;
            velocity.y +=
              (originalPosition.y + Math.sin(time + floatOffset) * floatAmplitude - bubble.position.y) * returnStrength;
            velocity.z +=
              (originalPosition.z + Math.sin(time * 0.65 + floatOffset) * 0.12 - bubble.position.z) * returnStrength;
          }

          const isHovered = cachedIntersects.some((hit) => hit.object === bubble);

          if (isHovered) {
            tempVector.subVectors(bubble.position, camera.position).normalize();
            if (!isTier2) velocity.addScaledVector(tempVector, mouseForce);
          }

          if (isHovered && !bubble.userData.hovered) {
            bubble.userData.hovered = true;
            gsap.to(bubble.scale, {
              x: bubble.userData.radius * hoverScale,
              y: bubble.userData.radius * hoverScale,
              duration: 0.35,
              ease: "power3.out",
            });
          } else if (!isHovered && bubble.userData.hovered) {
            bubble.userData.hovered = false;
            gsap.to(bubble.scale, {
              x: bubble.userData.baseScale,
              y: bubble.userData.baseScale,
              duration: 0.55,
              ease: "power3.out",
            });
          }

          if (!isTier2) {
            velocity.multiplyScalar(damping);
            bubble.position.add(velocity);
          }
          bubble.lookAt(camera.position);
        });

        if (!isTier2 && frame % 4 === 0) {
          handleCollisions();
        }
      }
      renderer.render(scene, camera);
    };

    const startLoop = () => {
      if (animationFrameId) return;
      sceneIsVisible = true;
      animate();
    };

    const stopLoop = () => {
      sceneIsVisible = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startLoop();
          if (entry.intersectionRatio > 0) startAnimation();
        } else {
          stopLoop();
        }
      },
      { threshold: 0 },
    );
    observer.observe(wrapper);

    const onPointerMove = (event) => {
      const rect = wrapper.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      window.clearTimeout(mouseMoveTimeout);
      mouseMoveTimeout = window.setTimeout(() => {
        mouse.x = -10;
        mouse.y = -10;
      }, 160);
    };

    const onPointerLeave = () => {
      mouse.x = -10;
      mouse.y = -10;
    };

    wrapper.addEventListener("pointermove", onPointerMove, { passive: true });
    wrapper.addEventListener("pointerleave", onPointerLeave);

    const onResize = () => {
      const width = wrapper.clientWidth;
      const height = wrapper.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
      renderer.render(scene, camera);
    };

    resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(wrapper);
    renderer.render(scene, camera);

    return () => {
      stopLoop();
      window.clearTimeout(mouseMoveTimeout);
      observer.disconnect();
      resizeObserver?.disconnect();
      wrapper.removeEventListener("pointermove", onPointerMove);
      wrapper.removeEventListener("pointerleave", onPointerLeave);
      gsap.killTweensOf(group.rotation);
      gsap.killTweensOf(group.scale);
      bubbles.forEach((bubble) => {
        gsap.killTweensOf(bubble.position);
        gsap.killTweensOf(bubble.scale);
        gsap.killTweensOf(bubble.material);
        bubble.material.dispose();
      });
      textures.forEach((texture) => texture.dispose());
      renderer.dispose();
    };
  }, [isTier2, quality.antialias, quality.bubbleCollisionLimit, shouldReduceMotion, tier, isMobile, isDark, isMetal]);

  return (
    <section
      className={`bubble-wrapper relative w-full pb-12 flex flex-col justify-center transition-colors duration-500 ${styles.section}`}>
      <div
        ref={wrapperRef}
        className="bubble-scene-panel bg-transparent relative w-full min-h-100 transition-all duration-500">
        <div
          className="bubble-grid transition-all duration-500"
          aria-hidden="true"
          style={{ backgroundImage: gridBackground }}
        />
        <div
          className={`bubble-orbit bubble-orbit-one mt-10 transition-colors duration-500 ${styles.orbitBorder}`}
          aria-hidden="true"
        />
        <div
          className={`bubble-orbit bubble-orbit-two mt-5 transition-colors duration-500 ${styles.orbitBorder}`}
          aria-hidden="true"
        />

        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 34, filter: "blur(10px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true, amount: 0.4 }}
        className={`bubble-content relative z-10 w-full max-w-6xl mx-auto px-4 -mt-8 bg-linear-to-t ${styles.fadeGradient}`}>
        <div className="bubble-content-inner flex flex-col items-center justify-center pt-16 space-y-3 md:space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3">
            <h2
              className={`text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tighter md:-tracking-widest transition-colors duration-500 ${styles.title}`}>
              /tech_stack
            </h2>

            <div className="relative h-8 md:h-10 w-full md:w-64 flex items-center justify-center md:justify-start overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={techIndex}
                  initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: -20, opacity: 0, filter: "blur(4px)" }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className={`absolute font-bold text-lg md:text-2xl font-sans text-center md:text-left w-full truncate transition-colors duration-300 uppercase ${styles.accent}`}>
                  {TECH_STACK[techIndex]}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <p
            className={`relative z-10 text-center text-sm md:text-base leading-relaxed md:leading-normal font-sans font-medium transition-colors duration-300 opacity-90 ${styles.text}`}>
            Architecting fluid user interfaces and high-throughput distributed systems—building resilient cloud
            infrastructure engineered to maintain strict data consistency under critical enterprise workloads.
          </p>
        </div>
      </motion.div>
    </section>
  );
}

export default memo(BubbleScene);
