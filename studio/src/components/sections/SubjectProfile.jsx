"use client";

import { FADEUP } from "@/utils/basic";
import { useTheme } from "@/context/ThemeContext";
import { IoIdCardOutline } from "react-icons/io5";
import React, { useState, useEffect } from "react";
import { useDeviceType } from "@/hooks/useDeviceType";
import { motion, AnimatePresence } from "framer-motion";
import FlowState from "@/components/animations/FlowState";
import SubjectAscii from "@/components/basic/SubjectAscii";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import { useViewportDetection } from "@/hooks/useViewportDetection";
import { getProfileMarqueeStyles, getProfileStyles } from "@/utils/swatch";
import { fadeInContainer, itemReveal, carouselData, welcomeTexts } from "@/utils/basic";

const ScrollMarquee = ({
  texts = ["DEFAULT TEXT"],
  baseSpeed = 1,
  variant = "large",
  showIcon = false,
  className = "",
  direct = false,
  theme,
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const { isTier2 } = usePerformanceTier();
  const { ref: marqueeRef, isVisible } = useViewportDetection({ threshold: 0.05 });

  useEffect(() => {
    if (texts.length <= 1 || !isVisible) return;
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % texts.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [texts, isVisible]);

  const currentText = texts[currentTextIndex];
  const speed = Math.max(0.5, baseSpeed);
  const duration = 25 / speed;

  const { textColorClass } = getProfileMarqueeStyles(theme);

  return (
    <div
      ref={marqueeRef}
      className={`w-full overflow-hidden whitespace-nowrap flex items-center select-none ${className}`}>
      {isTier2 ? (
        <h2
          className={`font-black uppercase tracking-tight bg-clip-text ${textColorClass} ${variant === "large" ? "text-[clamp(3.5rem,6vw,5.5rem)]" : "text-[clamp(1.1rem,4vw,1.4rem)]"}`}>
          {currentText}
        </h2>
      ) : (
        <motion.div
          className="flex items-center gap-10 will-change-transform"
          animate={isVisible ? { x: direct ? ["0%", "-50%"] : ["-50%", "0%"] } : { x: "0%" }}
          transition={{
            duration: duration,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop",
          }}
          style={{ transformOrigin: "left center" }}>
          <MarqueeContent text={currentText} variant={variant} showIcon={showIcon} theme={theme} />
          <MarqueeContent text={currentText} variant={variant} showIcon={showIcon} theme={theme} />
        </motion.div>
      )}
    </div>
  );
};

const MarqueeContent = ({ text, variant, showIcon, theme }) => {
  const { textColorClass, iconColorClass } = getProfileMarqueeStyles(theme);

  return (
    <div className="flex items-center gap-10 shrink-0">
      <AnimatePresence mode="wait">
        <motion.h2
          key={text}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`font-black uppercase tracking-tight bg-clip-text ${textColorClass} ${variant === "large" ? "text-[clamp(3.5rem,6vw,5.5rem)]" : "text-[clamp(1.1rem,4vw,1.4rem)]"}`}>
          {text}
        </motion.h2>
      </AnimatePresence>
      {showIcon && <IoIdCardOutline size={40} className={iconColorClass} />}
    </div>
  );
};

export default function SubjectProfile() {
  const { theme } = useTheme();
  const { isMobile, isTab } = useDeviceType();
  const [carouselIndex, setCarouselIndex] = useState(0);
  const { ref: sectionRef, isVisible: isSectionVisible } = useViewportDetection({ threshold: 0.05 });

  useEffect(() => {
    if (!isSectionVisible) return;
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % carouselData.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isSectionVisible]);

  const styles = getProfileStyles(theme);

  return (
    <div
      ref={sectionRef}
      className={`relative w-full min-h-screen font-sans py-12 px-4 md:px-12 overflow-hidden ${styles.section}`}>
      <div className="relative z-10">
        <div className="grid grid-cols-1 items-end gap-y-14 md:grid-cols-12 md:gap-x-8">
          <motion.div {...FADEUP} className="md:col-span-8">
            <div className="overflow-hidden">
              <h1
                className={`text-[clamp(3.4em,8vw,5rem)] md:text-[clamp(5rem,9vw,7rem)] font-black leading-[0.82] tracking-tighter md:tracking-[-0.09em] will-change-transform ${styles.h1Main}`}
                style={{ fontFeatureSettings: '"ss01" on, "ss02" on' }}>
                FULL STACK
              </h1>
            </div>
            <div className="-mt-3 overflow-hidden">
              <h1
                className={`text-[clamp(3rem,5vw,3.5rem)] font-black leading-[0.82] tracking-[-0.12em] will-change-transform ${styles.h1Sub}`}
                style={{ fontFeatureSettings: '"ss01" on, "ss02" on' }}>
                DEVELOPER
              </h1>
            </div>
          </motion.div>
          <motion.div
            {...FADEUP}
            transition={{ ...FADEUP.transition, delay: 0.08 }}
            className="flex flex-col items-start justify-end pb-2 text-left md:col-span-4 md:items-end md:text-right">
            <h2
              className={`text-[clamp(2.3rem,4vw,4rem)] font-black leading-[0.9] tracking-[-0.08em] will-change-transform ${styles.h2Sub}`}>
              / FROM <br /> MUMBAI, MH
            </h2>
            <p className={`mt-2 max-w-70 text-[11px] uppercase leading-relaxed tracking-normal ${styles.pSub}`}>
              The art of hacking social
            </p>
          </motion.div>
        </div>
      </div>

      <motion.div {...FADEUP} className="relative z-20 pt-3 pb-3">
        <div className="mx-auto max-w-8xl">
          <div className="relative flex items-center justify-between gap-6">
            <span
              className={`text-[15px] font-black uppercase tracking-tighter md:-tracking-widest ${styles.subProfileText}`}>
              /Subject_Profile
            </span>
            <div
              className={`hidden items-center gap-5 font-mono text-[10px] uppercase tracking-normal md:flex ${styles.coordsGroup}`}>
              <span>12.8761 N</span>
              <span>74.8316 E</span>
            </div>
            <div className="flex items-center gap-4 font-mono">
              <span className={`text-[10px] uppercase tracking-normal ${styles.coordDatePre}`}>@03-29</span>
              <div className="relative h-px w-14 overflow-hidden">
                <div className={`absolute inset-0 ${styles.lineStaticThin}`} />
                <motion.div
                  className={`absolute top-0 h-px w-6 blur-[0.5px] ${styles.lineAnim}`}
                  animate={isSectionVisible ? { x: ["-120%", "250%"] } : { x: "-120%" }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <span className={`text-[10px] uppercase tracking-normal ${styles.coordDate}`}>2026</span>
            </div>
          </div>
          <div className="relative mt-3 h-px overflow-hidden">
            <div className={`absolute inset-0 ${styles.lineStatic}`} />
          </div>
        </div>
      </motion.div>

      <div
        className="absolute inset-0 z-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, ${styles.gridLines} 1px, transparent 1px), linear-gradient(to bottom, ${styles.gridLines} 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <motion.div
        variants={fadeInContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-360 mx-auto relative z-10 flex flex-col gap-10">
        <div className="w-full flex flex-col lg:flex-row gap-8">
          <motion.div
            variants={itemReveal}
            className={`flex-1 lg:flex-[0_0_60%] border p-6 flex flex-col justify-center overflow-hidden relative shadow-sm rounded-2xl group ${styles.cardBg}`}>
            <ScrollMarquee
              theme={theme}
              texts={["ABOUT ME"]}
              baseSpeed={1.5}
              variant="large"
              showIcon={true}
              direct={true}
              className={`border-b ${styles.marqueeBorder}`}
            />

            <ScrollMarquee theme={theme} texts={welcomeTexts} baseSpeed={1.2} variant="small" className="mt-2" />

            <div className="mt-4">
              <p className={`text-lg leading-relaxed font-light text-justify ${styles.textBody}`}>
                I am a multidisciplinary creator{" "}
                <span
                  className={`font-semibold underline decoration-2 underline-offset-4 ${styles.textHighlight} ${styles.underline}`}>
                  engineering high-impact digital experiences
                </span>{" "}
                at the intersection of robust code and beautiful design. My methodology is inherently systematic,
                architectural, and scalable, while intentionally bridging{" "}
                <span className={`font-medium ${styles.textHighlight}`}>
                  user psychology with comprehensive engineering strategy
                </span>
                .
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={itemReveal}
            className={`flex-1 lg:flex-[0_0_40%] border p-6 flex flex-col justify-between shadow-sm rounded-2xl ${styles.cardBg}`}>
            <div
              className={`relative w-full h-48 md:h-40 mb-6 border overflow-hidden rounded-2xl group shadow-inner ${styles.nodeStatus}`}>
              <FlowState
                className="z-0"
                density={16}
                matrixSpeed={0.16}
                matrixOpacity={0.5}
                xScale={1.2}
                yScale={0.4}
                distortion={0.055}
                lineIntensity={0.075}
                lineSpeed={0.45}
                lineOpacity={0.9}
              />

              <div
                className={`absolute top-3 left-3 z-10 backdrop-blur px-2 py-1 text-[10px] font-mono tracking-wider rounded border uppercase ${styles.nodeStatusText}`}>
                live_node_status // active
              </div>
            </div>

            <p className={`text-sm md:text-base leading-relaxed font-light text-justify ${styles.textBody}`}>
              Every project I build intentionally bridges. I build web ecosystems that are visually striking and
              structurally bulletproof. By leveraging contemporary headless stacks, tailored APIs, and purposeful
              interactions, I unlock flawless deployment performance.
            </p>
          </motion.div>
        </div>

        <motion.div
          variants={itemReveal}
          className={`w-full border p-8 md:p-12 relative shadow-xl rounded-xl ${styles.mainCard}`}>
          <div
            className={`absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 -translate-x-3 translate-y-3 ${styles.borderCorner}`}
          />
          <div
            className={`absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 translate-x-3 -translate-y-3 ${styles.borderCorner}`}
          />
          <div className={`gap-12 items-stretch ${isTab ? "" : "grid grid-cols-1 lg:grid-cols-12"}`}>
            <div className="lg:col-span-8 flex flex-col justify-between gap-10">
              <div>
                <h3 className={`text-xl font-light leading-relaxed tracking-tight text-justify ${styles.textH3}`}>
                  I craft technical design solutions that help forward-thinking brands truly differentiate. With over{" "}
                  <span className={`font-semibold px-2 py-0.5 rounded ${styles.textHighlightBg}`}>
                    3-4 years of tech experience
                  </span>
                  , I specialize in designing beautiful software interfaces and transforming them into high-performing
                  reality—spanning frontend architectures, comprehensive backend infrastructures, headless CMS
                  ecosystems, automated CI/CD automation pipelines, and specialized Salesforce CRM logic integrations.
                </h3>
              </div>
              <div
                className={`min-h-30 border-l-4 pl-6 relative flex flex-col justify-center py-2 pr-4 shadow-sm ${styles.workflowBox}`}>
                <div
                  className={`text-[11px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-2 ${styles.workflowLabel}`}>
                  Operational Workflow Ethos
                </div>
                <div className="relative min-h-18 w-full flex items-center">
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={carouselIndex}
                      initial={{ y: 25, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -25, opacity: 0 }}
                      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute w-full">
                      <p className={`text-sm md:text-base font-medium leading-normal ${styles.workflowText}`}>
                        <span className={`font-bold mr-1.5 ${styles.workflowArrow}`}>&gt;</span>
                        {carouselData[carouselIndex % carouselData.length]}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-auto">
                <motion.div
                  whileHover={{ y: -4, boxShadow: "0 12px 30px -10px rgba(0,0,0,0.08)" }}
                  className={`border p-6 flex flex-col justify-between transition-all duration-300 rounded-xl group ${styles.hoverCard}`}>
                  <p className={`text-xs font-medium transition-colors text-justify ${styles.hoverCardText}`}>
                    I design spaces with structural intention, merging the precise creative layouts of
                    <span className={`font-semibold ${styles.textHighlight}`}> Figma</span>, code flexibility of modern
                    frameworks, and advanced scroll magic driven by
                    <span className={`font-semibold ${styles.textHighlight}`}> GSAP / Framer Motion</span>. These are
                    strategic tools configured to capture complete market attention.
                  </p>
                </motion.div>
                <motion.div
                  whileHover={{ y: -4, boxShadow: "0 12px 30px -10px rgba(0,0,0,0.08)" }}
                  className={`border p-6 flex flex-col justify-between transition-all duration-300 rounded-xl group ${styles.hoverCard}`}>
                  <p className={`text-xs font-medium transition-colors text-justify ${styles.hoverCardText}`}>
                    Available for select freelance contracts, engineering high-tier enterprise modules, standalone
                    applications, and automated deployments. I maximize client trust through direct accountability,
                    transparency, and scalable architecture buildouts.
                  </p>
                </motion.div>
              </div>
            </div>

            {!isTab && !isMobile && (
              <div
                className={`relative w-full min-w-0 lg:col-span-4 p-2 group shadow-inner ${styles.imgCardContainer}`}>
                <div
                  className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 rounded-tl -translate-x-0.5 -translate-y-0.5 ${styles.borderCorner}`}
                />
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 rounded-br translate-x-0.5 translate-y-0.5 ${styles.borderCorner}`}
                />

                <div
                  className={`relative w-full ${isMobile ? "min-h-93.75" : "min-h-65"} h-[clamp(260px,42vw,380px)] overflow-hidden rounded-lg`}>
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                    <SubjectAscii />
                  </div>
                </div>

                <div
                  className={`absolute bottom-3 left-1/2 -translate-x-1/2 w-[min(90%,300px)] backdrop-blur-md border p-1 shadow-xl font-mono select-none rounded-lg ${styles.sysPanel}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${styles.sysDot}`} />
                      <p className={`text-[11px] font-bold tracking-wider ${styles.sysHeader}`}>CORE_SYS // ENGR.AV2</p>
                    </div>

                    <span className={`text-[8px] tracking-widest opacity-60 ${styles.sysText}`}>ONLINE</span>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 sm:flex sm:items-center sm:justify-center sm:gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[8px] opacity-50 ${styles.sysText}`}>STATUS</span>
                      <span className={`text-[8px] ${styles.sysHeader}`}>STABLE</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[8px] opacity-50 ${styles.sysText}`}>UPTIME</span>
                      <span className={`text-[8px] ${styles.sysHeader}`}>99.9%</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[8px] opacity-50 ${styles.sysText}`}>LATENCY</span>
                      <span className={`text-[8px] ${styles.sysHeader}`}>24ms</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[8px] opacity-50 ${styles.sysText}`}>LOAD</span>
                    </div>
                  </div>

                  <div className={`mt-2 pt-2 border-t opacity-40 ${styles.sysBorder}`}>
                    <p className={`text-[7px] tracking-[0.18em] ${styles.sysText}`}>
                      LATENCY: OPTIMAL // SIGNAL: ACTIVE
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
