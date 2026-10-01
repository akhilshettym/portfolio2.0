"use client";

import { useTheme } from "@/context/ThemeContext";
import { ACH_FALLBACK_DATA } from "@/utils/basic";
import { getCardStackStyles } from "@/utils/swatch";
import { useDeviceType } from "@/hooks/useDeviceType";
import FloatingCard from "@/components/basic/FloatingCard";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import React, { useState, useRef, memo, useEffect } from "react";
import { getAchievements, seedPortfolioCache } from "@/lib/payload/contentapi";
import { motion, useMotionTemplate, useScroll, useSpring, useTransform } from "framer-motion";

function CardStackReveal({ initialAchievements }) {
  const sectionRef = useRef(null);
  const hasInitialAchievements = Array.isArray(initialAchievements);
  const [data, setData] = useState(() =>
    Array.isArray(initialAchievements) ? initialAchievements : ACH_FALLBACK_DATA,
  );
  const [hoveredCard, setHoveredCard] = useState(-1);

  const { theme } = useTheme();
  const { isMobile, isTab } = useDeviceType();
  const { isTier2 } = usePerformanceTier();

  const styles = getCardStackStyles(theme);

  const renderStackedCards = isMobile || isTier2;
  const renderedCards = renderStackedCards ? data.slice(0, Math.min(data.length, 4)) : data;

  const { scrollYProgress } = useScroll({
    target: !renderStackedCards ? sectionRef : undefined,
    offset: ["start start", "end end"],
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: 26,
    damping: 22,
    mass: 1.1,
  });

  const backgroundBlur = useTransform(progress, [0, 0.4, 0.8], renderStackedCards ? [0, 0, 0] : [0, 5, 12]);
  const backgroundFilter = useMotionTemplate`blur(${backgroundBlur}px)`;

  const displayProgress = progress;

  useEffect(() => {
    if (Array.isArray(initialAchievements)) {
      seedPortfolioCache({ achievements: initialAchievements });
    }

    if (hasInitialAchievements) return undefined;

    let isMounted = true;

    const fetchData = async () => {
      const achievementsData = await getAchievements();
      if (isMounted) {
        setData(achievementsData);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [hasInitialAchievements, initialAchievements]);

  return (
    <section
      ref={sectionRef}
      className={`relative w-full transition-colors duration-500 ${styles.section} ${
        renderStackedCards ? "h-auto py-15" : "h-[425vh]"
      }`}>
      <div
        className={`${
          renderStackedCards ? "relative h-auto" : "sticky top-0 h-screen"
        } w-full overflow-visible transition-colors duration-500 ${styles.section}`}>
        <div className={`absolute inset-0 pointer-events-none transition-colors duration-500 ${styles.bgGradient}`} />

        <div
          className={`${
            renderStackedCards
              ? "relative py-5"
              : "absolute inset-0 pointer-events-none flex items-center justify-center z-0"
          }`}>
          <motion.div
            className="flex flex-col items-center gap-3 text-center w-full"
            style={{ filter: renderStackedCards ? "none" : backgroundFilter }}>
            <h2
              className={`text-xl sm:text-2xl md:text-5xl font-black uppercase tracking-tighter md:-tracking-widest transition-colors duration-500 ${styles.title}`}>
              /Achievements
            </h2>
            <p className={`max-w-xl px-6 text-sm leading-6 font-medium transition-colors duration-500 ${styles.desc}`}>
              A visual story of growth, recognition, and consistent progress.
            </p>
          </motion.div>
        </div>

        <div
          className={`relative w-full flex items-center justify-center ${
            renderStackedCards ? "h-auto px-4 mt-8" : "h-full overflow-hidden z-10"
          }`}>
          <div
            className={`w-full max-w-7xl mx-auto ${
              renderStackedCards
                ? `grid gap-6 justify-items-center ${isTab ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"}`
                : "relative h-full"
            }`}>
            {renderedCards.map((card, index) =>
              renderStackedCards ? (
                <div
                  key={`${card.title}-${index}`}
                  className={`w-full max-w-100 flex flex-col justify-between p-6 rounded-lg border transition-all duration-300 transform hover:-translate-y-1 ${styles.cardBg}`}>
                  <div className="mb-4 flex items-start justify-between">
                    <div
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 ${styles.badge}`}>
                      ©0{String(index + 1).padStart(2, "")}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex flex-col space-y-5">
                      <div>
                        <h3
                          className={`text-2xl font-black tracking-tight uppercase mb-2 transition-colors duration-300 ${styles.cardTitle}`}>
                          {card.title}
                        </h3>

                        <p
                          className={`text-xs font-semibold uppercase tracking-wider mb-3 transition-colors duration-300 ${styles.cardCaption} ${
                            isMobile ? "" : "min-h-8"
                          }`}>
                          {card.caption}
                        </p>

                        <p
                          className={`text-sm leading-relaxed text-justify transition-colors duration-300 ${styles.cardDesc} ${
                            isMobile ? "" : "min-h-30"
                          }`}>
                          {card.description}
                        </p>
                      </div>

                      <motion.a
                        href={card.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileTap={{ scale: 0.98 }}
                        whileHover={{ y: -1 }}
                        className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-xs font-semibold tracking-tight transition-all duration-300 ${styles.button}`}>
                        <span> {card.cta} </span>
                        <span aria-hidden="true"> ↗ </span>
                      </motion.a>
                    </div>

                    <div
                      className={`mt-6 pt-4 border-t flex items-center justify-between text-xs font-bold uppercase transition-colors duration-300 ${styles.footerBorder} ${styles.footerLabel}`}>
                      <span>Timeline</span>
                      <span className={`font-black transition-colors duration-300 ${styles.footerYear}`}>
                        {card.year}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <FloatingCard
                  key={`${card.title}-${index}`}
                  card={card}
                  index={index}
                  progress={displayProgress}
                  hoveredCard={hoveredCard}
                  setHoveredCard={setHoveredCard}
                  theme={theme}
                />
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(CardStackReveal);
