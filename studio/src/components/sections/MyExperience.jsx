"use client";

import "@/styles/my_experience.css";
import { useTheme } from "@/context/ThemeContext";
import { useDeviceType } from "@/hooks/useDeviceType";
import React, { useRef, useState, useEffect } from "react";
import { EDU_FALLBACK_DATA, EXP_FALLBACK_DATA } from "@/utils/basic";
import { getMyExperienceStyles, getMarqueeCardStyle } from "@/utils/swatch";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { getEducations, getExperiences, seedPortfolioCache } from "@/lib/payload/contentapi";

const TILTS = [-2.5, 2, -3];

export default function MyExperience({ initialExperiences, initialEducations }) {
  const { theme } = useTheme();
  const targetRef = useRef(null);
  const containerRef = useRef(null);
  const trackRef = useRef(null);

  const hasInitialExperiences = Array.isArray(initialExperiences);
  const hasInitialEducations = Array.isArray(initialEducations);

  const [expData, setExpData] = useState(() =>
    Array.isArray(initialExperiences) ? initialExperiences : EXP_FALLBACK_DATA,
  );
  const [eduData, setEduData] = useState(() =>
    Array.isArray(initialEducations) ? initialEducations : EDU_FALLBACK_DATA,
  );

  const [scrollRange, setScrollRange] = useState(0);

  const { isMobile, isTab } = useDeviceType();
  const shouldReduceMotion = useReducedMotion();
  const isDark = theme === "dark";
  const isMetal = theme === "metal";
  const useStackedLayout = isMobile || shouldReduceMotion;

  const styles = getMyExperienceStyles(isDark, isMetal);

  useEffect(() => {
    seedPortfolioCache({
      experiences: initialExperiences,
      educations: initialEducations,
    });

    if (hasInitialExperiences && hasInitialEducations) return undefined;

    let isMounted = true;

    const fetchData = async () => {
      try {
        const [experienceData, educationData] = await Promise.all([
          hasInitialExperiences ? initialExperiences : getExperiences(),
          hasInitialEducations ? initialEducations : getEducations(),
        ]);

        if (isMounted) {
          setExpData(Array.isArray(experienceData) ? experienceData : experienceData?.docs || []);
          setEduData(Array.isArray(educationData) ? educationData : educationData?.docs || []);
        }
      } catch (err) {
        console.error("Failed to fetch experience/education data:", err);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [hasInitialEducations, hasInitialExperiences, initialEducations, initialExperiences]);

  useEffect(() => {
    const calculateRange = () => {
      if (!useStackedLayout && trackRef.current && containerRef.current) {
        const totalDistance = trackRef.current.scrollWidth - containerRef.current.clientWidth;
        setScrollRange(Math.max(0, totalDistance));
      } else {
        setScrollRange(0);
      }
    };

    calculateRange();

    const resizeObserver = new ResizeObserver(calculateRange);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    if (trackRef.current) resizeObserver.observe(trackRef.current);

    return () => resizeObserver.disconnect();
  }, [expData, useStackedLayout]);

  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useSpring(useTransform(scrollYProgress, [0, 0.75, 1], [0, -scrollRange, -scrollRange]), {
    stiffness: 48,
    damping: 28,
    mass: 0.9,
  });

  const sectionHeight = useStackedLayout ? "h-auto" : "h-[380vh]";
  const shellHeight = useStackedLayout ? "min-h-screen py-12" : "h-dvh";
  const panelHeight = useStackedLayout ? "min-h-0" : `${isTab ? "h-[800px]" : "h-[480px]"}`;
  const marqueeItems = eduData.length > 0 ? [...eduData, ...eduData, ...eduData, ...eduData] : [];

  return (
    <div ref={targetRef} className={`relative ${sectionHeight} transition-colors duration-500 ${styles.section}`}>
      <div
        className={`${useStackedLayout ? "relative" : "sticky top-0"} flex ${shellHeight} items-center justify-center overflow-hidden px-4 pb-5 sm:px-6 lg:px-10`}>
        <div className="w-full max-w-328 flex flex-col gap-2 relative z-10">
          <div className="flex items-center justify-between px-1">
            <h2
              className={`text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tighter md:tracking-[-0.09em] transition-colors duration-500 ${styles.cardTitle}`}>
              /My_Experience
            </h2>
          </div>

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.18 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className={`w-full ${panelHeight} border-2 p-3 sm:p-4 lg:p-5 flex flex-col gap-3 md:gap-4 relative rounded-xl transition-all duration-500 ${styles.outerBox}`}>
            <div
              ref={containerRef}
              className={`w-full flex-1 border relative rounded-lg transition-colors duration-500 ${styles.innerBox} ${
                useStackedLayout ? "min-h-0 overflow-visible" : "min-h-70 overflow-hidden"
              }`}>
              <motion.div
                style={useStackedLayout ? undefined : { x }}
                className={useStackedLayout ? "w-full" : "w-max h-full flex items-center"}>
                <div
                  ref={trackRef}
                  className={
                    useStackedLayout
                      ? "grid w-full grid-cols-1 gap-5 sm:grid-cols-2"
                      : "flex h-full items-center gap-6 py-6 pl-[28vw] pr-[18vw] md:gap-8 lg:pl-[35vw] lg:pr-[20vw]"
                  }>
                  {expData.map((card, index) => {
                    const cardTilt = card.tilt || TILTS[index % TILTS.length];

                    return (
                      <React.Fragment key={card.id || card._id || index}>
                        <motion.div
                          initial={
                            shouldReduceMotion ? false : { opacity: 0, y: 28, rotate: useStackedLayout ? 0 : cardTilt }
                          }
                          whileInView={
                            shouldReduceMotion
                              ? undefined
                              : { opacity: 1, y: 0, rotate: useStackedLayout ? 0 : cardTilt }
                          }
                          whileHover={useStackedLayout ? undefined : { scale: 1.035, rotate: 0, zIndex: 30 }}
                          viewport={{ once: true, amount: 0.25 }}
                          transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 24,
                            delay: Math.min(index * 0.05, 0.2),
                          }}
                          className={`${isTab ? "max-h-120" : "max-h-65"} max-w-95 border-2 flex flex-col justify-between p-4 sm:p-5 relative rounded-lg transition-colors duration-300 group z-10 ${
                            useStackedLayout
                              ? "w-full"
                              : `w-[70vw] shrink-0 sm:w-90 lg:w-100 ${isTab ? "h-120" : "h-65"}`
                          } ${styles.card}`}>
                          <div className="flex justify-between items-center w-full">
                            <span
                              className={`${isTab ? "text-[16px]" : "text-[8px]"} font-mono uppercase tracking-widest px-2 py-1 rounded border ${styles.badge}`}>
                              {card.type}
                            </span>
                            <span
                              className={`${isTab ? "text-5xl" : "text-4xl"} font-black font-mono transition-colors duration-500 ${styles.cardId}`}>
                              0{index + 1}
                            </span>
                          </div>

                          <div className="my-auto">
                            <div
                              className={`${isTab ? "" : "flex flex-col"} gap-1 text-[12px] tracking-wider uppercase leading-relaxed sm:flex-row sm:items-baseline sm:justify-between ${styles.textMuted}`}>
                              <p className={`font-medium ${isTab ? "text-2xl" : ""}`}>{card.company}</p>
                              <span
                                className={`tracking-normal normal-case opacity-80 ${isTab ? "text-xl" : "text-[10px]"}`}>
                                {card.timeline}
                              </span>
                            </div>
                          </div>

                          <div className="my-auto">
                            <h3
                              className={`${isTab ? "text-2xl" : "text-md"} font-bold uppercase tracking-normal pb-1 border-b-2 ${styles.cardTitle}`}>
                              {card.title}
                            </h3>
                            <p
                              className={`${isTab ? "text-md" : "text-xs"} mt-2 leading-relaxed ${useStackedLayout ? "" : "line-clamp-4"} ${styles.textMuted}`}>
                              {card.description}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2 pt-2">
                            {card.tags?.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className={`${isTab ? "text-[12px]" : "text-[9px]"} font-semibold px-2 py-0.5 rounded ${styles.badge}`}>
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <div className="absolute bottom-2 right-2 w-2 h-2 border-r-2 border-b-2 border-current opacity-40" />
                        </motion.div>

                        {index < expData.length - 1 && (
                          <div
                            className={`${useStackedLayout ? "hidden" : "flex"} w-6 md:w-10 h-60 md:h-80 flex-col justify-center gap-2 shrink-0 pointer-events-none opacity-40`}>
                            <div className={`w-full h-1 ${styles.line}`} />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            <div
              className={`w-full h-20 md:h-22 lg:h-24 border flex items-center shrink-0 rounded-lg overflow-hidden relative transition-colors duration-500 ${styles.marqueeBox}`}>
              <div className="animate-marquee-smooth flex gap-3 md:gap-4 px-2 items-center whitespace-nowrap">
                {marqueeItems.map((item, index) => {
                  const uniqueKey = `${item.id || item._id || index}-${index}`;
                  const cardStyle = getMarqueeCardStyle(item.variant, isDark, isMetal);

                  return (
                    <div
                      key={uniqueKey}
                      className={`w-52 md:w-70 h-18.5 md:h-20 border flex flex-col items-center justify-center px-2 md:px-3 py-1 md:py-2 text-center rounded-md shrink-0 transition-all duration-300 ease-in-out cursor-pointer group ${cardStyle}`}>
                      {item.title && (
                        <span className="text-[9px] md:text-[10px] font-bold tracking-wider uppercase truncate w-full">
                          {item.title}
                        </span>
                      )}

                      {item.college && (
                        <span className="text-[7px] md:text-[8px] font-mono font-medium tracking-wider uppercase truncate w-full opacity-80 transition-opacity duration-300">
                          {item.college}
                        </span>
                      )}

                      {item.major && (
                        <span className="text-[7px] md:text-[8px] font-mono tracking-wider uppercase truncate w-full opacity-70 transition-opacity duration-300">
                          {item.major}
                        </span>
                      )}

                      <div className="flex items-center justify-between w-full mt-1 border-t border-current/20 pt-1 transition-colors duration-300">
                        {item.timeline && (
                          <span className="text-[7px] md:text-[8px] font-mono tracking-wider uppercase opacity-70 transition-opacity duration-300">
                            {item.timeline}
                          </span>
                        )}

                        {item.score && (
                          <span className="text-[7px] md:text-[8px] font-bold uppercase tracking-wider truncate max-w-20 md:max-w-30 text-right">
                            {item.score}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
