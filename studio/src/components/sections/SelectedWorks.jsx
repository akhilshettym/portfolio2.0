"use client";

import Link from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useTheme } from "@/context/ThemeContext";
import { useDeviceType } from "@/hooks/useDeviceType";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import { FaArrowUpRightFromSquare, FaXmark } from "react-icons/fa6";
import { getWorks, seedPortfolioCache } from "@/lib/payload/contentapi";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getWorkFloatStyles, getWorkMobile, getWorkStyles } from "@/utils/swatch";
import { CARD_WIDTH, CARD_HEIGHT, CTA_WIDTH, CTA_HEIGHT, EDGE_PADDING } from "@/utils/basic";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function getCardPosition() {
  if (typeof window === "undefined") return { x: 0, y: 0 };
  return {
    x: (window.innerWidth - CARD_WIDTH) / 2,
    y: (window.innerHeight - CARD_HEIGHT) / 2,
  };
}

function getButtonPosition(clientX, clientY) {
  if (typeof window === "undefined") return { x: 0, y: 0 };
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let x = clientX - CTA_WIDTH / 2;
  let y = clientY - CTA_HEIGHT / 2;
  x = clamp(x, EDGE_PADDING, vw - CTA_WIDTH - EDGE_PADDING);
  y = clamp(y, EDGE_PADDING, vh - CTA_HEIGHT - EDGE_PADDING);

  return { x, y };
}

function getFallbackPointerPoint() {
  if (typeof window === "undefined") return { x: 0, y: 0 };
  return {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };
}

function subscribeNoop() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

function MobileProjectModal({ project, onClose, isCompactDevice, isLargeDevice, theme, id }) {
  const skipImage = isCompactDevice || isLargeDevice;

  const isNewProject = !project.description || project.description.trim().toLowerCase() === "new project";
  const hasDetails = !isNewProject;
  const hasImage = Boolean(project.image) && !skipImage;

  const { modalBg, overlayBg, borderClass, textMuted, textBody, tagClass, closeBtn, ctaBtn } = getWorkMobile(theme);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className={`absolute inset-0 backdrop-blur-sm ${overlayBg}`}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`relative z-10 flex w-full flex-col overflow-hidden rounded-lg shadow-2xl transition-colors duration-300 ${modalBg} ${
          isCompactDevice
            ? "max-h-[65vh] top-10 max-w-xl"
            : isLargeDevice
              ? "max-h-[75vh] top-15 max-w-2xl"
              : "max-h-[85vh] max-w-md"
        }`}>
        <div className={`flex items-center justify-between border-b p-4 ${borderClass}`}>
          <div className="flex flex-col">
            <span className={`text-[10px] uppercase tracking-[0.25em] ${textMuted}`}>Selected Work</span>
          </div>
          <button
            onClick={onClose}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${closeBtn}`}>
            <FaXmark size={16} />
          </button>
        </div>

        <div className={`flex-1 p-5 ${skipImage ? "" : "overflow-y-auto"}`}>
          {hasDetails ? (
            <div className="flex flex-col gap-5">
              {hasImage && (
                <div className={`relative aspect-video w-full overflow-hidden rounded-xl border ${borderClass}`}>
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 768px"
                    className="object-cover"
                  />
                </div>
              )}

              <div>
                <h3 className="text-2xl font-medium">{project.title}</h3>
                <p className={`mt-3 text-sm leading-relaxed ${textBody}`}>{project.description}</p>
              </div>

              {project.stack && project.stack.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {project.stack.map((item) => (
                    <span key={item} className={`rounded-full border px-3 py-1.5 text-xs ${tagClass}`}>
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center">
              <h3 className="text-2xl font-medium">COMING SOON</h3>
              <p className={`mt-2 text-sm ${textMuted}`}>Project details will be revealed soon.</p>
            </div>
          )}
        </div>

        {hasDetails && project.url && (
          <div className={`border-t p-4 ${borderClass}`}>
            <Link
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex w-full items-center justify-center gap-2 rounded-md py-3.5 text-sm font-semibold transition-transform active:scale-[0.98] ${ctaBtn}`}>
              Visit Live Site
              <FaArrowUpRightFromSquare size={14} />
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function FloatingProjectPreview({ project, cardAnchor, buttonAnchor, onHold, onRelease, theme }) {
  const cardX = useMotionValue(cardAnchor.x);
  const cardY = useMotionValue(cardAnchor.y);
  const buttonX = useMotionValue(buttonAnchor.x);
  const buttonY = useMotionValue(buttonAnchor.y);

  const springCardX = useSpring(cardX, { stiffness: 180, damping: 24, mass: 0.9 });
  const springCardY = useSpring(cardY, { stiffness: 180, damping: 24, mass: 0.9 });
  const springButtonX = useSpring(buttonX, { stiffness: 320, damping: 30, mass: 0.55 });
  const springButtonY = useSpring(buttonY, { stiffness: 320, damping: 30, mass: 0.55 });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const parallaxX = useSpring(mouseX, { stiffness: 120, damping: 20 });
  const parallaxY = useSpring(mouseY, { stiffness: 120, damping: 20 });

  const driftX = useTransform(parallaxX, [-1, 1], [-14, 14]);
  const driftY = useTransform(parallaxY, [-1, 1], [-10, 10]);
  const rotateY = useTransform(parallaxX, [-1, 1], [-3.2, 3.2]);
  const rotateX = useTransform(parallaxY, [-1, 1], [3.2, -3.2]);
  const imageX = useTransform(parallaxX, [-1, 1], [-28, 28]);
  const imageY = useTransform(parallaxY, [-1, 1], [-18, 18]);

  useEffect(() => {
    cardX.set(cardAnchor.x);
    cardY.set(cardAnchor.y);
    buttonX.set(buttonAnchor.x);
    buttonY.set(buttonAnchor.y);
  }, [cardAnchor.x, cardAnchor.y, buttonAnchor.x, buttonAnchor.y, cardX, cardY, buttonX, buttonY]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const dx = (e.clientX - centerX) / centerX;
      const dy = (e.clientY - centerY) / centerY;
      mouseX.set(clamp(dx, -1, 1));
      mouseY.set(clamp(dy, -1, 1));
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const isNewProject = !project.description || project.description.trim().toLowerCase() === "new project";
  const hasDetails = !isNewProject;
  const hasImage = Boolean(project.image);

  const { cardBgClass, gradientOverlay, accentGlow, patternOverlay, textBody, tagClass, btnClass } =
    getWorkFloatStyles(theme);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.88, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.92, filter: "blur(8px)" }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none fixed left-0 top-0 z-50 hidden lg:block"
        style={{
          x: springCardX,
          y: springCardY,
          perspective: 1400,
          transformStyle: "preserve-3d",
        }}>
        <motion.div
          style={{ x: driftX, y: driftY, rotateX, rotateY, transformStyle: "preserve-3d" }}
          whileHover={{ scale: 1.01 }}
          className="relative">
          <div
            className="absolute -inset-6 rounded-[36px] blur-2xl"
            style={{
              backgroundImage: `radial-gradient(circle at center, ${accentGlow}, transparent 70%)`,
            }}
          />

          <motion.div
            initial={{ y: 6 }}
            animate={{ y: [0, -6, 0] }}
            transition={{ y: { duration: 4.8, repeat: Infinity, ease: "easeInOut" } }}
            className={`relative h-130 w-212.5 overflow-hidden border shadow-[0_60px_140px_rgba(0,0,0,0.42)] ${cardBgClass}`}>
            {hasDetails ? (
              <>
                {hasImage && (
                  <>
                    <motion.div className="absolute inset-0" style={{ x: imageX, y: imageY, scale: 1.08 }}>
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 768px"
                        className="object-cover"
                      />
                    </motion.div>
                    <div className={`absolute inset-0 ${gradientOverlay}`} />
                    <div className={`absolute inset-0 ${patternOverlay}`} />
                  </>
                )}

                <div className="absolute inset-0 flex flex-col justify-between p-7 z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.25em] opacity-70">Selected Work</span>
                  </div>

                  <div>
                    <h3 className="text-3xl font-medium">{project.title}</h3>
                    <p className={`mt-4 max-w-145 text-sm leading-relaxed ${textBody}`}>{project.description}</p>
                    {project.stack && project.stack.length > 0 && (
                      <div className="mt-6 flex flex-wrap gap-2">
                        {project.stack.map((item) => (
                          <span
                            key={item}
                            className={`rounded-full border px-3 py-1.5 text-xs backdrop-blur-md ${tagClass}`}>
                            {item}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <p className="text-xs uppercase tracking-[0.3em] opacity-40">Selected Work</p>
                  <h3 className="mt-5 text-4xl font-medium">COMING SOON</h3>
                  <p className="mt-4 opacity-60">Project details will be revealed soon.</p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>

      {hasDetails && project.url && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed left-0 top-0 z-60 hidden lg:block"
          style={{ x: springButtonX, y: springButtonY }}>
          <div onPointerEnter={onHold} onPointerLeave={onRelease} className="pointer-events-auto">
            <Link
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex h-13 items-center gap-2 rounded-full border-2 px-5 py-3 text-sm font-semibold shadow-[0_20px_40px_rgba(0,0,0,0.2)] transition-transform duration-300 hover:scale-[1.04] active:scale-[0.98] ${btnClass}`}>
              Visit Live Site
              <FaArrowUpRightFromSquare size={16} />
            </Link>
          </div>
        </motion.div>
      )}
    </>
  );
}

export default function SelectedWorks({ initialProjects }) {
  const { theme } = useTheme();
  const { isMobile, isCompactDevice, isLargeDevice } = useDeviceType();
  const { isTier2 } = usePerformanceTier();

  const renderPopupModal = isMobile || isTier2;

  const hasInitialProjects = Array.isArray(initialProjects);
  const [projects, setProjects] = useState(() => (hasInitialProjects ? initialProjects : []));
  const [isLoading, setIsLoading] = useState(() => !hasInitialProjects);

  const [activeProject, setActiveProject] = useState(null);
  const [mobileModalProject, setMobileModalProject] = useState(null);

  const isPortalReady = useSyncExternalStore(subscribeNoop, getClientSnapshot, getServerSnapshot);

  const [cardAnchor, setCardAnchor] = useState({ x: 0, y: 0 });
  const [buttonAnchor, setButtonAnchor] = useState({ x: 0, y: 0 });
  const clearTimerRef = useRef(null);

  const { isDark, isMetal, sectionBg, headerText, borderColor, defaultBg, defaultText, activeBg, activeText } =
    getWorkStyles(theme);

  const cancelClear = () => {
    if (clearTimerRef.current) {
      window.clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }
  };

  const scheduleClear = () => {
    cancelClear();
    clearTimerRef.current = window.setTimeout(() => {
      setActiveProject(null);
    }, 180);
  };

  const handleEnter = (index, event) => {
    if (renderPopupModal) return;
    cancelClear();

    const hasPointerCoords = typeof event?.clientX === "number" && typeof event?.clientY === "number";
    const point = hasPointerCoords ? { x: event.clientX, y: event.clientY } : getFallbackPointerPoint();

    setActiveProject(index);
    setCardAnchor(getCardPosition());
    setButtonAnchor(getButtonPosition(point.x, point.y));
  };

  const handleMove = (event) => {
    if (renderPopupModal || typeof event?.clientX !== "number" || typeof event?.clientY !== "number") return;
    setButtonAnchor(getButtonPosition(event.clientX, event.clientY));
  };

  const handleLeave = () => {
    if (renderPopupModal) return;
    scheduleClear();
  };

  const handleRowClick = (project) => {
    if (renderPopupModal) {
      setMobileModalProject(project);
    }
  };

  useEffect(() => {
    if (mobileModalProject) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileModalProject]);

  useEffect(() => {
    return () => {
      if (clearTimerRef.current) window.clearTimeout(clearTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (hasInitialProjects) {
      seedPortfolioCache({ works: initialProjects });
      return undefined;
    }

    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const works = await getWorks();
        if (isMounted) {
          setProjects(works || []);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [hasInitialProjects, initialProjects]);

  return (
    <div className={`relative w-full overflow-hidden transition-colors px-5 duration-500 ${sectionBg}`}>
      <div className={`mx-auto max-w-[1600px] py-10 ${isMobile ? "" : "px-10"}`}>
        <div className="mb-5">
          <div className="relative px-10 py-2 text-xs tracking-widest">
            <div className="pointer-events-auto absolute left-2 top-1/2 -translate-y-1/2">©001</div>
          </div>

          <div className="overflow-hidden">
            <h1
              className={`inline-block origin-left text-[clamp(2.3em,4.5vw,4rem)] md:text-[clamp(4rem,8vw,4.5rem)] font-black leading-[0.7] tracking-[-0.09em] will-change-transform ${isMetal ? "text-red-500" : isDark ? "text-white" : "text-black"}`}
              style={{
                fontFeatureSettings: '"ss01" on, "ss02" on',
                transform: "scaleX(1.5)",
              }}>
              SELECTED/
            </h1>
          </div>

          <div className="-mt-3 overflow-hidden">
            <h1
              className={`flex w-full items-baseline justify-between whitespace-nowrap text-[clamp(3rem,5vw,3rem)] md:text-[clamp(4rem,5vw,2rem)] font-black leading-[0.82] tracking-[-0.09em] will-change-transform ${headerText}`}
              style={{ fontFeatureSettings: '"ss01" on, "ss02" on' }}>
              <span>. WORKS</span>
              <span className="ml-auto mr-5 text-sm tracking-normal"> 24-26 </span>
            </h1>
          </div>
        </div>

        <div className="relative">
          {isLoading ? (
            <div className={`py-10 text-center ${defaultText}`}>Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className={`py-10 text-center ${defaultText}`}>No projects available.</div>
          ) : (
            projects.map((project, index) => {
              const isActive = activeProject === index;
              const isNewProject = !project.description || project.description.trim().toLowerCase() === "new project";

              return (
                <motion.div
                  key={project.id || project._id || index}
                  role="button"
                  tabIndex={0}
                  onPointerEnter={(e) => handleEnter(index, e)}
                  onPointerMove={handleMove}
                  onPointerLeave={handleLeave}
                  onClick={() => handleRowClick(project)}
                  onFocus={(e) => handleEnter(index, e)}
                  onBlur={handleLeave}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      renderPopupModal ? handleRowClick(project) : handleEnter(index, e);
                    }
                  }}
                  animate={{
                    backgroundColor: isActive ? activeBg : defaultBg,
                    color: isActive ? activeText : defaultText,
                  }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className={`group relative cursor-pointer border-t outline-none select-none ${borderColor}`}>
                  <div className={`grid grid-cols-12 gap-6 ${renderPopupModal ? "py-5" : "px-10 py-5"}`}>
                    <div className="col-span-12 md:col-span-5">
                      <h3 className="text-2xl font-medium md:text-4xl"> {project.title} </h3>
                      <p className="mt-2 text-sm opacity-70"> {project.tagline} </p>
                    </div>

                    {!isMobile && (
                      <div className="flex items-center justify-between md:justify-end h-full">
                        <div className="relative w-28 h-15 md:w-46 md:h-18 overflow-hidden rounded border border-current/20 bg-neutral-500/5 aspect-video shrink-0">
                          {project.image ? (
                            <Image src={project.image} alt={project.title} fill unoptimized className="object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center p-2 text-center">
                              <h1 className="text-sm font-normal uppercase tracking-wider text-neutral-400 md:text-xs">
                                {isNewProject ? "Coming Soon" : "No Image"}
                              </h1>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="hidden md:block md:col-span-2" />

                    <div className="col-span-6 md:col-span-2">
                      <p className="mb-2 text-xs uppercase opacity-60"> When </p>
                      <p className="text-lg"> {project.when} </p>
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <p className="mb-2 text-xs uppercase opacity-60"> Category </p>
                      <p className="text-lg"> {project.type} </p>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
          <div className={`border-t ${borderColor}`} />
        </div>
      </div>

      {isPortalReady &&
        createPortal(
          <>
            <AnimatePresence mode="sync" initial={false}>
              {!renderPopupModal && activeProject !== null && projects[activeProject] && (
                <FloatingProjectPreview
                  key={projects[activeProject].id}
                  project={projects[activeProject]}
                  cardAnchor={cardAnchor}
                  buttonAnchor={buttonAnchor}
                  onHold={cancelClear}
                  onRelease={scheduleClear}
                  theme={theme}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {renderPopupModal && mobileModalProject !== null && (
                <MobileProjectModal
                  project={mobileModalProject}
                  onClose={() => setMobileModalProject(null)}
                  isCompactDevice={isCompactDevice}
                  isLargeDevice={isLargeDevice}
                  theme={theme}
                />
              )}
            </AnimatePresence>
          </>,
          document.body,
        )}
    </div>
  );
}
