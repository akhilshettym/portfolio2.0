"use client";

import { useTheme } from "@/context/ThemeContext";
import { getMySocialsStyles } from "@/utils/swatch";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import { getQualityPreset } from "@/lib/performance/applyQualityTier";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useMotionValue, useSpring } from "framer-motion";
import Image from "next/image";

const TRAIL_IMAGE_COUNT = 22;

const trailImages = Array.from({ length: TRAIL_IMAGE_COUNT }, (_, index) => `/socials/socials-${index + 1}.jpg`);

const TRAIL_CONFIG = {
  maxItems: 6,

  cardSize: {
    mobile: 176,
    desktop: 208,
  },

  borderRadius: "1rem",
};

const WireframeGlobe = ({ size = 500, styles }) => {
  const R = size / 2;

  const meridians = Array.from({ length: 6 }, (_, index) => (
    <div
      key={`meridian-${index}`}
      className={`absolute inset-0 rounded-full border-[1.5px] transition-colors duration-500 ${styles.globeLines}`}
      style={{ transform: `rotateY(${index * 30}deg)` }}
    />
  ));

  const latitudes = [-75, -60, -45, -30, -15, 15, 30, 45, 60, 75].map((angle) => {
    const rad = (angle * Math.PI) / 180;
    const radius = R * Math.cos(rad);
    const z = R * Math.sin(rad);

    return (
      <div
        key={`latitude-${angle}`}
        className={`absolute rounded-full border-[1.5px] transition-colors duration-500 ${styles.globeLines}`}
        style={{
          width: `${radius * 2}px`,
          height: `${radius * 2}px`,
          left: `${R - radius}px`,
          top: `${R - radius}px`,
          transform: `rotateX(90deg) translateZ(${z}px)`,
        }}
      />
    );
  });

  return (
    <div
      className="relative"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        transformStyle: "preserve-3d",
      }}>
      {meridians} {latitudes}
      <div
        className={`absolute inset-0 rounded-full border-2 shadow-[0_0_15px_rgba(0,0,0,0.05)] transition-colors duration-500 ${styles.globeEquator}`}
        style={{
          transform: "rotateX(90deg)",
        }}
      />
    </div>
  );
};

export default function MySocials({ horizontalReveal = false }) {
  const [trail, setTrail] = useState([]);

  const lastPosition = useRef({ x: 0, y: 0 });
  const imageIndex = useRef(0);
  const timeouts = useRef(new Set());

  const { theme } = useTheme();

  const activeTheme = getMySocialsStyles[theme] || getMySocialsStyles.light;
  const shouldReduceMotion = useReducedMotion();

  const tierResult = usePerformanceTier() || { tier: "high" };

  const tier = tierResult.tier;

  const quality = useMemo(
    () =>
      getQualityPreset(tier) || {
        socialTrailDistance: 40,
        socialTrailLifeMs: 800,
      },
    [tier],
  );

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const globeRotateX = useSpring(mouseY, {
    stiffness: 40,
    damping: 20,
  });

  const globeRotateY = useSpring(mouseX, {
    stiffness: 40,
    damping: 20,
  });

  useEffect(() => {
    const currentTimeouts = timeouts.current;

    return () => {
      currentTimeouts.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });

      currentTimeouts.clear();
    };
  }, []);

  const createTrailItem = useCallback((x, y) => {
    const src = trailImages[imageIndex.current];

    imageIndex.current = (imageIndex.current + 1) % trailImages.length;

    const id =
      typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

    return {
      id,
      src,
      x,
      y,
      rotation: Math.random() * 20 - 10,
    };
  }, []);

  const handleMouseMove = useCallback(
    (event) => {
      const rect = event.currentTarget.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      mouseX.set(((x - centerX) / centerX) * 20);
      mouseY.set(((y - centerY) / centerY) * -20);

      if (shouldReduceMotion) {
        return;
      }

      const distance = Math.hypot(x - lastPosition.current.x, y - lastPosition.current.y);

      if (distance < quality.socialTrailDistance) {
        return;
      }

      lastPosition.current = {
        x,
        y,
      };

      const nextItem = createTrailItem(x, y);

      setTrail((previous) => [...previous.slice(-(TRAIL_CONFIG.maxItems - 1)), nextItem]);

      const timeoutId = setTimeout(() => {
        setTrail((previous) => previous.filter((item) => item.id !== nextItem.id));

        timeouts.current.delete(timeoutId);
      }, quality.socialTrailLifeMs);

      timeouts.current.add(timeoutId);
    },
    [createTrailItem, mouseX, mouseY, quality, shouldReduceMotion],
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);

    lastPosition.current = {
      x: 0,
      y: 0,
    };
  }, [mouseX, mouseY]);

  const revealMotion = horizontalReveal
    ? {
        initial: false,
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
      }
    : {
        initial: { opacity: 0, y: 40, filter: "blur(8px)" },
        whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
        viewport: { once: true, amount: 0.2 },
      };

  return (
    <motion.section
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...revealMotion}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex min-h-[80vh] flex-col justify-center overflow-hidden px-5 py-18 transition-colors duration-500 md:min-h-screen md:px-10 ${activeTheme.bg}`}
      style={{ perspective: "1500px" }}>
      <div
        className={`absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent to-transparent transition-colors duration-500 ${activeTheme.divider}`}
      />

      <div
        className={`absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent to-transparent transition-colors duration-500 ${activeTheme.divider}`}
      />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className={`h-150 w-150 rounded-full blur-[80px] transition-colors duration-500 ${activeTheme.glow}`} />
      </div>

      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-30">
        <motion.div
          style={{
            rotateX: globeRotateX,
            rotateY: globeRotateY,
            transformStyle: "preserve-3d",
          }}
          className="flex items-center justify-center">
          <motion.div
            animate={shouldReduceMotion ? undefined : { rotateY: [0, -360] }}
            transition={{
              repeat: Infinity,
              duration: 45,
              ease: "linear",
            }}
            style={{ transformStyle: "preserve-3d" }}>
            <WireframeGlobe size={550} styles={activeTheme} />
          </motion.div>
        </motion.div>
      </div>

      <div className="pointer-events-none relative z-10 mx-auto w-full max-w-6xl">
        <motion.div
          className="pointer-events-auto relative text-center"
          initial={{
            scale: 0.95,
            opacity: 0,
          }}
          whileInView={{
            scale: 1,
            opacity: 1,
          }}
          transition={{
            duration: 0.8,
            delay: 0.2,
          }}>
          <h2
            className={`mt-4 text-[clamp(3.4em,8vw,4.5rem)] font-black uppercase leading-[0.5] tracking-wide transition-colors duration-500 md:text-[clamp(4.5rem,9vw,6rem)] md:tracking-[-0.12em] ${activeTheme.textMain}`}>
            /Socials
          </h2>

          <h1
            className={`mt-8 text-xl font-light uppercase tracking-wide transition-colors duration-500 md:text-3xl ${activeTheme.textMuted}`}>
            Let&apos;s connect
            <br />
            <span className={`font-semibold ${activeTheme.textHighlight}`}>across the web</span>
          </h1>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        <AnimatePresence>
          {trail.map((item) => (
            <motion.div
              key={item.id}
              className="absolute"
              style={{
                left: item.x,
                top: item.y,
                zIndex: 20,
              }}
              initial={{
                opacity: 0,
                scale: 0,
                x: "-50%",
                y: "-50%",
                rotate: item.rotation,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                x: "-50%",
                y: "-50%",
                rotate: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.4,
                filter: "blur(10px)",
                x: "-50%",
                y: "-50%",
              }}
              transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}>
              <div
                className={`relative overflow-hidden border p-2 shadow-2xl backdrop-blur-sm transition-colors duration-500 ${activeTheme.trailCard}`}
                style={{
                  width: `clamp(
                    ${TRAIL_CONFIG.cardSize.mobile}px,
                    18vw,
                    ${TRAIL_CONFIG.cardSize.desktop}px
                  )`,
                  borderRadius: TRAIL_CONFIG.borderRadius,
                }}>
                <Image
                  src={item.src}
                  alt=""
                  aria-hidden="true"
                  width={0}
                  height={0}
                  sizes="100vw"
                  draggable={false}
                  className="block h-auto w-full rounded-xl object-contain select-none"
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
