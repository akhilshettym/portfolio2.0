"use client";

import Link from "next/link";
import { SOCIALS } from "@/utils/basic";
import { FiShield } from "react-icons/fi";
import { goToTop } from "@/utils/functions";
import { useRouter } from "next/navigation";
import { HiArrowSmUp } from "react-icons/hi";
import { FaRegCopyright } from "react-icons/fa6";
import { useTheme } from "@/context/ThemeContext";
import { useDeviceType } from "@/hooks/useDeviceType";
import FooterAscii from "@/components/basic/FooterAscii";
import CustomButton from "@/components/basic/CustomButton";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { getFooterMarqueeStyles, getFooterStyles } from "@/utils/swatch";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "framer-motion";

function splitLetters(text) {
  return Array.from(text);
}

function AnimatedWord({ text, className = "", delay = 0 }) {
  const chars = useMemo(() => splitLetters(text), [text]);

  return (
    <span className={`block w-full ${className}`} aria-label={text}>
      {chars.map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
            delay: delay + index * 0.015,
          }}
          className="inline-block"
          style={{ whiteSpace: char === " " ? "pre" : "normal" }}>
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}

const MarqueeLine = ({ text, large }) => {
  const { theme } = useTheme();
  const { textColor, dotColor } = getFooterMarqueeStyles(theme);

  const marqueeAnimation = large ? { x: [-2400, 0] } : { x: [0, -2400] };

  return (
    <div className="relative overflow-hidden">
      <motion.div
        className="flex w-max items-center gap-6 whitespace-nowrap"
        transition={{ duration: 46, ease: "linear", repeat: Infinity }}
        animate={marqueeAnimation}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-6">
            <span
              className={`font-bold transition-colors duration-500 ${textColor} ${large ? "text-[5rem]" : "text-[2rem]"}`}>
              {text}
            </span>
            <span className={`h-3 w-3 rounded-full sm:h-4 sm:w-4 transition-colors duration-500 ${dotColor}`} />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const MarqueeLineLow = ({ text, large, isMobile }) => {
  const { theme } = useTheme();
  const { textColor, dotColor } = getFooterMarqueeStyles(theme);

  return (
    <div className="relative overflow-hidden py-2">
      <motion.div
        className="flex w-max items-center gap-6 whitespace-nowrap"
        transition={{ duration: 46, ease: "linear", repeat: Infinity }}>
        <div className="flex items-center gap-6">
          <span
            className={`font-bold transition-colors duration-500 ${textColor} ${large ? (isMobile ? "text-[3rem]" : "text-[5rem]") : "text-[2rem]"}`}>
            {text}
          </span>
          <span className={`h-3 w-3 rounded-full sm:h-4 sm:w-4 transition-colors duration-500 ${dotColor}`} />
        </div>
      </motion.div>
    </div>
  );
};

const Footer = () => {
  const router = useRouter();
  const sectionRef = useRef(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const { theme } = useTheme();
  const { isMobile } = useDeviceType();
  const { isTier2 } = usePerformanceTier();

  const styles = getFooterStyles(theme);

  useEffect(() => {
    const handle = window.setTimeout(() => setIsHydrated(true), 0);
    return () => window.clearTimeout(handle);
  }, []);

  const { scrollYProgress } = useScroll({
    target: isHydrated ? sectionRef : null,
    offset: ["start end", "end start"],
  });

  const shellShadow = useTransform(scrollYProgress, [0, 0.42, 1], ["none", "none", "none"]);
  const shadowToApply = prefersReducedMotion ? undefined : shellShadow;

  const sectionPadding = useSpring(useTransform(scrollYProgress, [0, 0.28, 0.42, 0.56, 1], [50, 50, 30, 0, 0]), {
    stiffness: 72,
    damping: 20,
    mass: 0.9,
  });

  const revealLift = useSpring(useTransform(scrollYProgress, [0, 0.28, 0.55, 1], [16, 10, 0, 0]), {
    stiffness: 80,
    damping: 22,
    mass: 0.8,
  });

  const curtainOpacity = useTransform(scrollYProgress, [0, 0.12, 0.3, 0.56, 1], [1, 0.96, 0.84, 0.42, 0]);
  const gridOpacity = useTransform(scrollYProgress, [0, 0.18, 0.5, 1], [0.18, 0.14, 0.08, 0]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.12, 0.34, 0.7, 1], [0.32, 0.22, 0.12, 0.04, 0]);

  const animatedCard = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24, filter: "blur(10px)" },
        whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
        viewport: { once: true, amount: 0.25 },
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
      };

  const handleNavigation = () => {
    router.push("/start");
    goToTop();
  };

  const topOverlayOpacity = useTransform(scrollYProgress, [0, 0.2, 0.5, 1], [0.7, 0.5, 0.2, 0]);
  const topBorderOpacity = useTransform(scrollYProgress, [0, 0.18, 0.45, 1], [0.85, 0.5, 0.18, 0]);

  const renderTierOneFooter = () => {
    return (
      <motion.section
        ref={sectionRef}
        style={prefersReducedMotion ? undefined : { padding: sectionPadding }}
        className={`relative z-50 w-full p-12.5 transition-colors duration-500 ${styles.section}`}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            style={{ opacity: glowOpacity }}
            className={`absolute left-1/2 top-10 h-128 w-lg -translate-x-1/2 rounded-full blur-3xl sm:h-184 sm:w-184 transition-colors duration-500 ${styles.gridGlow}`}
          />

          <motion.div
            style={{
              opacity: gridOpacity,
              backgroundImage: `linear-gradient(to right, ${styles.gridLines} 1px, transparent 1px), linear-gradient(to bottom, ${styles.gridLines} 1px, transparent 1px)`,
            }}
            className="absolute inset-0 bg-size-[64px_64px]"
          />

          <motion.div
            style={{
              opacity: curtainOpacity,
              backgroundImage: `radial-gradient(circle at top, ${styles.curtain}, transparent 52%)`,
            }}
            className="absolute inset-0"
          />
        </div>

        <motion.div
          style={prefersReducedMotion ? undefined : { y: revealLift, boxShadow: shadowToApply }}
          className={`relative mx-auto w-full overflow-hidden z-10 transition-colors duration-500 ${styles.footerContainer}`}>
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              opacity: topOverlayOpacity,
              backgroundImage: `linear-gradient(to bottom, ${styles.topOverlay}, rgba(255,255,255,0) 45%)`,
            }}
          />

          <motion.div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-x-0 top-0 z-20 h-px transition-colors duration-500 ${styles.topBorder}`}
            style={{ opacity: topBorderOpacity }}
          />

          <div className="relative z-40">
            <div className="mx-auto flex w-full max-w-[1600px] flex-col justify-between px-4 py-2">
              <div className="mb-5 flex h-[55vh] w-full flex-col gap-4 md:flex-row">
                <div className="w-full md:w-[60%]">
                  <div className="flex h-full w-full flex-col gap-4">
                    <div
                      className={`flex flex-1 items-center justify-center transition-colors duration-500 ${styles.textAccent}`}>
                      <div className="overflow-hidden">
                        <MarqueeLine large={true} text="A DESIGNER & DEVELOPER. CREATIVELY DRIVEN." />
                        <MarqueeLine text="A DESIGNER & DEVELOPER. CREATIVELY DRIVEN." />
                      </div>
                    </div>

                    <div
                      className={`relative flex-1 overflow-hidden rounded-md p-6 transition-colors duration-500 ${styles.cardOuter}`}>
                      <div className="flex h-full w-full flex-col gap-4">
                        <div className="flex-1 rounded-md">
                          <div className="flex flex-row gap-4 h-full w-full">
                            <div
                              className={`flex-1 rounded-md p-4 transition-colors duration-500 ${styles.cardInner1} ${styles.textSecondary}`}>
                              Engineered enduring digital systems over temporary digital legacies.
                            </div>

                            <div
                              className={`flex-1 rounded-md p-4 transition-colors duration-500 ${styles.cardInner2}`}>
                              <div className="absolute top-4 right-5 z-10 mt-2">
                                <video
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  width={200}
                                  height={80}
                                  aria-hidden="true"
                                  className={`w-auto object-contain transition-all duration-500 ${styles.imageBlend}`}
                                  style={{ width: "auto", height: 80 }}>
                                  <source src="/footer/animated_zigzag.mp4" type="video/mp4" />
                                </video>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 rounded-md">
                          <motion.p
                            {...animatedCard}
                            className={`w-full text-[15px] transition-colors duration-500 ${styles.textSecondary}`}>
                            <AnimatedWord
                              delay={0.06}
                              text="I synthesize complex brand visions into enduring digital systems, engineering high-end corporate identities, scalable design frameworks, and premium digital products that bridge the gap between aesthetic rigor and technical performance, while creating cohesive brand ecosystems built for clarity, longevity, and meaningful user impact."
                            />
                          </motion.p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`flex h-full w-full flex-col gap-4 p-6 shadow-sm border rounded-md transition-colors duration-500 ${styles.panelBg} ${styles.border} md:w-[40%]`}>
                  <div
                    className={`h-[35%] rounded-md p-4 flex flex-row gap-4 w-full transition-colors duration-500 ${styles.panelHeader}`}>
                    <div className="w-[50%] p-3">
                      <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        width={380}
                        height={35}
                        aria-hidden="true"
                        className={`w-full h-auto object-contain transition-all duration-500 ${styles.imageBlend}`}>
                        <source src="/footer/animated_blob_gloop.mp4" type="video/mp4" />
                      </video>
                    </div>

                    <div
                      className={`w-[50%] rounded-md border p-3 transition-colors duration-500 flex items-center gap-4 ${styles.panelBg} ${styles.border} ${styles.textPrimary}`}>
                      <div className="flex w-[40%] items-center py-2 justify-start">
                        <FooterAscii className="w-full" />
                      </div>

                      <div className="flex h-full flex-1 items-center justify-center">
                        <div className="flex flex-col justify-center text-justify">
                          <span className="text-[7px] leading-normal opacity-40">
                            Usually somewhere between coffee, code & curiosity.
                            {/* Probably overthinking the details, always curious about what&apos;s */}
                            {/* I like making things that feel simple, sometimes too simple.  */}
                            Still figuring it out {":)"} One thing at a time. Never really done experimenting.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`relative flex h-[65%] flex-col justify-between overflow-hidden rounded-md border p-5 transition-colors duration-500 ${styles.border}`}>
                    <div className="absolute top-0 right-0 h-32 w-32 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col gap-2">
                      <div className="grid grid-cols-2 gap-3">
                        {SOCIALS.map((social) => {
                          const Icon = social.icon;

                          return (
                            <Link
                              key={social.label}
                              href={social.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`group relative block overflow-hidden px-4 py-1 rounded-md transition-all duration-300 hover:-translate-y-1 ${styles.socialCard}`}>
                              <div className="relative flex items-center gap-3">
                                <div className={`${styles.iconBoxBase} ${styles.iconBox}`}>
                                  <Icon className="text-base" />
                                </div>
                                <span
                                  className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${styles.textSecondary}`}>
                                  {social.label}
                                </span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    <div className="w-full sm:w-auto flex justify-end">
                      <CustomButton
                        title={`${isMobile ? "Let's Connect" : "Let's Get In Contact"}`}
                        onClick={handleNavigation}
                        width={300}
                        height={40}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mx-auto flex max-w-[1600px] flex-col justify-between px-4">
              <div
                className={`mb-4 flex h-[12vh] min-h-26.25 md:h-[14vh] md:min-h-30 w-full gap-2 rounded-md p-2 transition-colors duration-500 ${styles.wrapperBg}`}>
                <div
                  className={`flex h-full w-[20%] flex-col rounded-md border p-3 shadow-sm transition-colors duration-500 ${styles.panelBg} ${styles.border}`}>
                  <p
                    className={`text-[10px] font-semibold uppercase tracking-normal transition-colors duration-500 ${styles.textMuted}`}>
                    Made in india
                  </p>

                  <div
                    className={`mt-auto flex items-center justify-between text-[9px] uppercase tracking-wider transition-colors duration-500 ${styles.textMuted}`}>
                    <span>2026</span>
                    <span>v1.0</span>
                  </div>

                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    width={300}
                    height={100}
                    aria-hidden="true"
                    className={`mt-1 h-auto max-h-10 w-full object-contain transition-all duration-500 ${styles.imageBlend}`}>
                    <source src="/footer/animated_binary_code.mp4" type="video/mp4" />
                  </video>
                </div>

                <div className="flex w-[80%] flex-col gap-2">
                  <div
                    className={`group relative min-h-0 flex-1 overflow-hidden rounded-md border p-2 shadow-sm transition-colors duration-500 ${styles.panelBg} ${styles.border}`}>
                    <p className={`text-xs leading-snug transition-colors duration-500 ${styles.textSecondary}`}>
                      Think more, design less. Build intentionally. Refactor ruthlessly. Simplify until it breaks. Ship
                      often. Leave the web better than you found it. Build hooks, not walls. For best results, pair with
                      coffee, curiosity, and a dash of skepticism. Measure meticulously, but optimize only when proven
                      necessary. Document the &apos;why,&apos; because the &apos;what&apos; will inevitably change.
                    </p>
                  </div>

                  <div
                    className={`flex w-full items-center justify-between gap-3 overflow-hidden rounded-md border px-3 py-1 shadow-sm whitespace-nowrap transition-colors duration-500 ${styles.panelBg} ${styles.borderLight}`}>
                    <span
                      className={`shrink text-[10px] font-semibold uppercase tracking-wider sm:text-xs transition-colors duration-500 ${styles.textSecondary}`}>
                      Independent Developer
                    </span>

                    <div className="min-w-0 shrink">
                      <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        width={100}
                        height={24}
                        aria-hidden="true"
                        className={`h-4 w-auto object-contain opacity-80 transition-all duration-500 ${styles.imageBlend}`}>
                        <source src="/footer/animated_decorative_dashes.mp4" type="video/mp4" />
                      </video>
                    </div>

                    <button
                      onClick={handleNavigation}
                      className={`cursor-pointer text-[10px] tracking-wider transition-opacity duration-300 hover:opacity-70 sm:text-xs ${styles.buttonBg}`}>
                      Am probably not sleeping, Hit me up ↗
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative w-full">
              <div
                className={`relative h-28 w-full overflow-hidden transition-colors duration-500 ${styles.footerBottom}`}>
                <h2
                  className={`absolute left-1/2 bottom-[-0.38em] -translate-x-1/2 select-none whitespace-nowrap text-[clamp(1rem,12vw,15rem)] font-extrabold uppercase leading-none -tracking-widest origin-center scale-x-[1.2] transition-colors duration-500 ${styles.textPrimary}`}>
                  AKHIL SHETTY{"\u00A0"}
                </h2>
              </div>

              <div className={`h-0.5 w-full rounded-full transition-colors duration-500 ${styles.dividerLine}`} />

              <div className="flex items-center justify-between px-4 py-2">
                <div className="flex-1 text-left">
                  <span
                    className={`flex items-center gap-1 text-[10px] sm:text-xs shrink-0 whitespace-nowrap transition-colors duration-500 ${styles.textMuted}`}>
                    <span>All rights reserved 2026</span>
                    <FaRegCopyright className="shrink-0" />
                    <span>Akhil Shetty M.</span>
                  </span>
                </div>

                <div className="flex-1 flex items-center justify-center gap-4">
                  <Link
                    href="/privacy"
                    onClick={goToTop}
                    className={`inline-flex items-center gap-1 text-xs font-normal tracking-wider uppercase transition-opacity duration-300 hover:opacity-70 ${styles.textMuted}`}>
                    Privacy Policy <FiShield size={15} />
                  </Link>
                </div>

                <div className="flex-1 text-right flex justify-end">
                  <button
                    onClick={goToTop}
                    className={`flex items-center gap-1.5 text-xs uppercase font-normal whitespace-nowrap hover:opacity-70 transition-colors duration-300 cursor-pointer ${styles.buttonBg}`}>
                    <span>To Top</span>
                    <HiArrowSmUp size={15} className="shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.section>
    );
  };

  const renderTierTwoFooter = () => {
    return (
      <motion.section
        ref={sectionRef}
        className={`relative z-50 w-full overflow-hidden transition-colors duration-500 ${styles.section}`}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            style={{ opacity: glowOpacity }}
            className={`absolute left-1/2 top-10 h-96 w-96 -translate-x-1/2 rounded-full blur-3xl sm:h-184 sm:w-184 lg:h-128 lg:w-lg transition-colors duration-500 ${styles.gridGlow}`}
          />

          <motion.div
            style={{
              opacity: gridOpacity,
              backgroundImage: `linear-gradient(to right, ${styles.gridLines} 1px, transparent 1px), linear-gradient(to bottom, ${styles.gridLines} 1px, transparent 1px)`,
            }}
            className="absolute inset-0 bg-size-[48px_48px] sm:bg-size-[64px_64px]"
          />

          <motion.div
            style={{
              opacity: curtainOpacity,
              backgroundImage: `radial-gradient(circle at top, ${styles.curtain}, transparent 52%)`,
            }}
            className="absolute inset-0"
          />
        </div>

        <motion.div
          style={prefersReducedMotion ? undefined : { y: revealLift, boxShadow: shadowToApply }}
          className={`relative mx-auto w-full overflow-hidden rounded-none z-10 flex flex-col justify-between transition-colors duration-500 ${styles.footerContainer}`}>
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              opacity: topOverlayOpacity,
              backgroundImage: `linear-gradient(to bottom, ${styles.topOverlay}, rgba(255,255,255,0) 45%)`,
            }}
          />

          <motion.div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-x-0 top-0 z-20 h-px transition-colors duration-500 ${styles.topBorder}`}
            style={{ opacity: topBorderOpacity }}
          />

          <div className="relative z-40 w-full grow flex flex-col justify-between">
            <div className="mx-auto flex w-full max-w-[1600px] flex-col justify-between px-4 pt-10 md:pt-16 lg:pt-20">
              <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:h-[60vh] min-h-fit">
                <div className="w-full lg:w-[60%] flex flex-col gap-4">
                  <div
                    className={`flex flex-col items-center justify-center p-4 rounded-md min-h-37 lg:flex-1 transition-colors duration-500 ${styles.panelHeader} ${styles.textAccent}`}>
                    <div className="overflow-hidden w-full text-center">
                      {isTier2 ? (
                        <>
                          <MarqueeLineLow
                            isMobile={isMobile}
                            large={true}
                            text="A DESIGNER & DEVELOPER. CREATIVELY DRIVEN."
                          />
                          <MarqueeLineLow isMobile={isMobile} text="DRIVEN DESIGNER & DEVELOPER." />
                        </>
                      ) : (
                        <>
                          <MarqueeLine large={true} text="A DESIGNER & DEVELOPER. CREATIVELY DRIVEN." />
                          <MarqueeLine
                            isMobile={isMobile}
                            text={isMobile ? "DRIVEN DESIGNER" : "DRIVEN DESIGNER & DEVELOPER."}
                          />
                        </>
                      )}
                    </div>
                  </div>

                  <div
                    className={`relative flex-1 overflow-hidden rounded-md p-4 sm:p-6 transition-colors duration-500 ${styles.cardOuter}`}>
                    <div className="flex h-full w-full flex-col gap-4 justify-between">
                      <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <div
                          className={`flex-1 rounded-md p-4 text-sm sm:text-base transition-colors duration-500 ${styles.cardInner1} ${styles.textSecondary}`}>
                          Engineered enduring digital systems over temporary digital legacies.
                        </div>

                        <div
                          className={`flex-1 rounded-md relative transition-colors duration-500 ${styles.cardInner2} ${isMobile ? "min-h-15" : "min-h-20"}`}>
                          <div className="z-10">
                            <video
                              autoPlay
                              loop
                              muted
                              playsInline
                              width={200}
                              height={80}
                              aria-hidden="true"
                              className={`w-auto object-contain transition-all duration-500 ${styles.imageBlend}`}
                              style={{ width: "auto", height: 80 }}>
                              <source src="/footer/animated_zigzag.mp4" type="video/mp4" />
                            </video>
                          </div>
                        </div>
                      </div>

                      <div className="w-full rounded-md mt-2">
                        <p
                          className={`text-balance text-xs sm:text-[15px] text-justify leading-relaxed transition-colors duration-500 ${styles.textSecondary}`}>
                          I synthesize complex brand visions into enduring digital systems, engineering high-end
                          corporate identities, scalable design frameworks, and premium digital products that bridge the
                          gap between aesthetic rigor and technical performance, while creating cohesive brand
                          ecosystems built for clarity, longevity, and meaningful user impact.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {!isMobile && 
                <div
                  className={`flex h-full w-full flex-col gap-4 p-6 shadow-sm border rounded-md transition-colors duration-500 ${styles.panelBg} ${styles.border} md:w-[40%]`}>
                  <div
                    className={`h-[35%] rounded-md p-4 flex flex-col md:flex-row gap-4 w-full transition-colors duration-500 ${styles.panelHeader}`}>
                    <div className="w-full md:w-[50%] p-3">
                      <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        width={380}
                        height={35}
                        aria-hidden="true"
                        className={`w-full h-auto object-contain transition-all duration-500 ${styles.imageBlend}`}>
                        <source src="/footer/animated_blob_gloop.mp4" type="video/mp4" />
                      </video>
                    </div>

                    <div
                      className={`w-full md:w-[50%] rounded-md border p-3 transition-colors duration-500 flex items-center gap-4 ${styles.panelBg} ${styles.border} ${styles.textPrimary}`}>
                      <div className="flex w-[50%] items-center py-2 justify-start">
                        <FooterAscii className="w-full" />
                      </div>

                      <div className="flex h-full flex-1 items-center justify-center">
                        <div className="flex flex-col justify-center text-justify">
                          <span className="text-[7px] leading-normal opacity-40">
                            Usually somewhere between coffee, code & curiosity.
                            {/* Probably overthinking the details, always curious about what&apos;s */}
                            {/* I like making things that feel simple, sometimes too simple.  */}
                            Still figuring it out {":)"} One thing at a time. Never really done experimenting.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`relative flex h-auto min-h-[65%] flex-col justify-between overflow-hidden rounded-md border p-3 sm:p-5 transition-colors duration-500 ${styles.border}`}>
                    <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 sm:h-32 sm:w-32 rounded-full blur-3xl" />

                    <div className="relative z-10 flex flex-col gap-2 sm:gap-3">
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        {SOCIALS.map((social) => {
                          const Icon = social.icon;

                          return (
                            <Link
                              key={social.label}
                              href={social.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`group relative block overflow-hidden rounded-md px-2 py-2 sm:px-4 sm:py-2 transition-all duration-300 hover:-translate-y-1 ${styles.socialCard}`}>
                              <div className="relative flex items-center gap-2 sm:gap-3">
                                <div
                                  className={`${styles.iconBoxBase} ${styles.iconBox} shrink-0 flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center`}>
                                  <Icon className="text-xs sm:text-base" />
                                </div>

                                <span
                                  className={`min-w-0 truncate text-[9px] sm:text-xs font-bold uppercase tracking-wide sm:tracking-wider transition-colors duration-300 ${styles.textSecondary}`}>
                                  {social.label}
                                </span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    <div className="w-full sm:w-auto flex justify-end">
                      <CustomButton
                        title={`${isMobile ? "Let's Connect" : "Let's Get In Contact"}`}
                        onClick={handleNavigation}
                        width={isMobile ? 200 : 300}
                        height={40}
                      />
                    </div>
                  </div>
                </div>
                }
              </div>
            </div>

            <div className="mx-auto flex max-w-[1600px] flex-col justify-between px-4 sm:px-4">
              <div
                className={`mb-5 flex h-auto min-h-[23vh] w-full flex-col gap-2 rounded-md p-2 transition-colors duration-500 md:h-[17vh] md:flex-row ${styles.wrapperBg}`}>
                <div
                  className={`flex w-full flex-col rounded-md border p-3 shadow-sm transition-colors duration-500 sm:p-4 md:h-full md:w-[20%] ${styles.panelBg} ${styles.border}`}>
                  <p
                    className={`text-[10px] font-semibold uppercase tracking-normal transition-colors duration-500 sm:text-xs ${styles.textMuted}`}>
                    Made in india
                  </p>

                  <div
                    className={`mt-3 flex items-center justify-between text-[9px] uppercase tracking-wider transition-colors duration-500 sm:mt-auto sm:text-[10px] ${styles.textMuted}`}>
                    <span>2026</span>
                    <span>v1.0</span>
                  </div>

                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    width={300}
                    height={100}
                    aria-hidden="true"
                    className={`mt-2 h-auto max-h-10 w-full object-contain transition-all duration-500 sm:max-h-14 md:mt-auto ${styles.imageBlend}`}>
                    <source src="/footer/animated_binary_code.mp4" type="video/mp4" />
                  </video>
                </div>

                <div className="flex w-full flex-col gap-2 md:w-[80%]">
                  <div
                    className={`group relative flex-1 overflow-hidden rounded-md border p-3 shadow-sm transition-colors duration-500 sm:p-2 ${styles.panelBg} ${styles.border}`}>
                    <p
                      className={`text-[11px] leading-relaxed transition-colors duration-500 sm:text-xs md:text-sm ${styles.textSecondary}`}>
                      Think more, design less. Build intentionally. Refactor ruthlessly. Simplify until it breaks. Ship
                      often. Leave the web better than you found it. Build hooks, not walls. For best results, pair with
                      coffee, curiosity, and a dash of skepticism. Measure meticulously, but optimize only when proven
                      necessary. Document the &apos;why,&apos; because the &apos;what&apos; will inevitably change.
                    </p>
                  </div>

                  <div
                    className={`flex w-full flex-col items-stretch justify-between gap-2 overflow-hidden rounded-md border px-3 py-2 shadow-sm transition-colors duration-500 sm:flex-row sm:items-center sm:gap-3 sm:px-4 sm:py-1 ${styles.panelBg} ${styles.borderLight}`}>
                    <span
                      className={`shrink-0 text-[9px] font-semibold uppercase tracking-wider transition-colors duration-500 sm:text-xs md:text-sm ${styles.textSecondary}`}>
                      Independent Developer
                    </span>

                    <div className="flex min-w-0 flex-1 justify-center sm:justify-start">
                      <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        width={100}
                        height={24}
                        aria-hidden="true"
                        className={`h-4 w-auto max-w-full object-contain opacity-80 transition-all duration-500 sm:h-5 ${styles.imageBlend}`}>
                        <source src="/footer/animated_decorative_dashes.mp4" type="video/mp4" />
                      </video>
                    </div>

                    <button
                      onClick={handleNavigation}
                      className={`shrink-0 self-center text-[9px] tracking-wide transition-opacity duration-300 hover:opacity-70 cursor-pointer sm:self-auto sm:text-xs sm:tracking-wider ${styles.buttonBg}`}>
                      Am probably not sleeping, Hit me up ↗
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative w-full">
              <div
                className={`relative w-full overflow-hidden transition-colors duration-500 ${styles.footerBottom} ${isMobile ? "h-10" : "h-28"}`}>
                <h2
                  className={`absolute left-1/2 bottom-[-0.38em] -translate-x-1/2 select-none whitespace-nowrap text-[clamp(1rem,12vw,15rem)] font-extrabold uppercase leading-none -tracking-widest origin-center scale-x-[1.2] transition-colors duration-500 ${styles.textPrimary}`}>
                  AKHIL SHETTY{"\u00A0"}
                </h2>
              </div>

              <div className={`h-0.5 w-full rounded-full transition-colors duration-500 ${styles.dividerLine}`} />

              <div className="flex w-full items-center justify-between px-3 py-2 sm:px-4">
                {!isMobile && (
                  <div className="flex flex-1 items-center justify-start">
                    <span
                      className={`flex items-center gap-1 whitespace-nowrap text-xs font-normal tracking-wider transition-colors duration-500 ${styles.textMuted}`}>
                      <span>All rights reserved 2026</span>
                      <FaRegCopyright className="shrink-0" />
                      <span>Akhil Shetty M.</span>
                    </span>
                  </div>
                )}

                <div className={`flex ${isMobile ? "flex-1 justify-start" : "flex-1 justify-center"} items-center`}>
                  <Link
                    href="/privacy"
                    onClick={goToTop}
                    className={`inline-flex items-center gap-1 text-xs font-normal tracking-wider uppercase transition-opacity duration-300 hover:opacity-70 ${styles.textMuted}`}>
                    Privacy Policy <FiShield size={15} />
                  </Link>
                </div>

                <div className={`flex ${isMobile ? "flex-1 justify-end" : "flex-1 justify-end"} items-center`}>
                  <button
                    onClick={goToTop}
                    className={`flex items-center gap-1.5 whitespace-nowrap text-xs uppercase font-normal tracking-wider transition-opacity duration-300 hover:opacity-70 cursor-pointer ${styles.buttonBg}`}>
                    <span>To Top</span>
                    <HiArrowSmUp size={15} className="shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.section>
    );
  };

  const render = () => {
    const renderFooter = isMobile || isTier2;

    if (!isHydrated) {
      return null;
    }

    return (
      <footer key={renderFooter ? "tier2" : "tier1"}>
        {renderFooter ? renderTierTwoFooter() : renderTierOneFooter()}
      </footer>
    );
  };

  return render();
};

export default memo(Footer);
