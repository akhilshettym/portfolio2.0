"use client";

import Link from "next/link";
import { MONTHS } from "@/utils/basic";
import { FaGitAlt } from "react-icons/fa";
import { FaGithub } from "react-icons/fa6";
import { CACHE_BASE } from "@/utils/storage";
import { GiRaiseZombie } from "react-icons/gi";
import { DiCoffeescript } from "react-icons/di";
import { CACHE_DURATION_MS } from "@/utils/cache";
import { useTheme } from "@/context/ThemeContext";
import { getGraphQlStyles } from "@/utils/swatch";
import { useDeviceType } from "@/hooks/useDeviceType";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import { motion, animate, AnimatePresence, useMotionValue } from "framer-motion";
import { memo, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

const GithubGraphQl = ({ username = "akhilshettym", forceTriggerAnimation }) => {
  const { theme } = useTheme();
  const { isMobile } = useDeviceType();
  const { isTier2 } = usePerformanceTier();

  const [total, setTotal] = useState(0);
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isVisibleState, setIsVisibleState] = useState(false);
  const [hasEnteredViewportState, setHasEnteredViewportState] = useState(false);

  const isVisible = forceTriggerAnimation || isVisibleState;
  const hasEnteredViewport = forceTriggerAnimation || hasEnteredViewportState;

  const motionTotal = useMotionValue(0);

  const panelRef = useRef(null);
  const [aiDisplay, setAiDisplay] = useState("100M+");
  const [coffeeDisplay, setCoffeeDisplay] = useState("2.9k+");
  const [commitDisplay, setCommitDisplay] = useState("0");
  const [aiNotif, setAiNotif] = useState(null);
  const [coffeeNotif, setCoffeeNotif] = useState(null);
  const [commitNotif, setCommitNotif] = useState(null);

  const mounted = useIsMounted();

  const { isDark, isMetal, styles, themeColors } = getGraphQlStyles(theme);

  const range = useMemo(() => {
    if (!mounted) return { from: "", to: "" };

    const currentDate = new Date();
    const end = new Date(currentDate);
    const start = new Date(currentDate);

    if (isMobile) {
      start.setDate(start.getDate() - 100);
    } else {
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      start.setMonth(start.getMonth() - 11);
      start.setDate(1);
    }

    return {
      from: start.toISOString(),
      to: end.toISOString(),
    };
  }, [mounted, isMobile]);

  useEffect(() => {
    if (!mounted || !range.from) return undefined;

    let active = true;
    const abortController = new AbortController();

    const fromDateOnly = range.from.substring(0, 10);
    const toDateOnly = range.to.substring(0, 10);
    const cacheKey = `${CACHE_BASE}:${username}:${fromDateOnly}:${toDateOnly}`;

    const processPayload = (calendarData) => {
      if (calendarData) {
        setWeeks(calendarData.weeks || []);
        setTotal(calendarData.totalContributions || 0);
      }
    };

    const runDataRetrieval = async () => {
      try {
        const diskRecord = localStorage.getItem(cacheKey);
        if (diskRecord) {
          try {
            const parsed = JSON.parse(diskRecord);
            const now = Date.now();

            if (parsed && parsed.timestamp && now - parsed.timestamp < CACHE_DURATION_MS) {
              processPayload(parsed.data);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.warn("Stale disk storage verification fault, clearing cache key...", e);
            localStorage.removeItem(cacheKey);
          }
        }

        const params = new URLSearchParams({ username, from: range.from, to: range.to });
        const response = await fetch(`/api/github?${params.toString()}`, {
          signal: abortController.signal,
          next: { revalidate: 86400 },
        });

        if (!response.ok) {
          throw new Error(`GitHub Engine Response Status: ${response.status}`);
        }

        const responseData = await response.json();
        if (!active || !responseData) return;

        const calendar = responseData?.data?.user?.contributionsCollection?.contributionCalendar;

        if (calendar) {
          const recordToCache = {
            timestamp: Date.now(),
            data: calendar,
          };
          localStorage.setItem(cacheKey, JSON.stringify(recordToCache));
          processPayload(calendar);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("GitHub primary data synchronization pipeline error:", err.message);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    runDataRetrieval();

    return () => {
      active = false;
      abortController.abort();
    };
  }, [username, range, mounted]);

  useEffect(() => {
    if (isTier2 || loading || !hasEnteredViewport) {
      return undefined;
    }

    motionTotal.set(0);
    const controls = animate(motionTotal, total, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (latest) => {
        setCommitDisplay(Math.round(latest).toString());
      },
    });
    return () => controls.stop();
  }, [total, motionTotal, isTier2, loading, hasEnteredViewport]);

  const displayedCommitCount = isTier2 ? total.toString() : commitDisplay;

  const monthLabels = useMemo(() => {
    if (!mounted) return [];
    const labels = [];
    const renderedMonths = new Set();

    weeks.forEach((week, index) => {
      const contributionDays = week.contributionDays;
      if (!contributionDays?.length) return;

      const visibleDay = contributionDays.find((day) => {
        const date = new Date(day.date);
        return date >= new Date(range.from) && date <= new Date(range.to);
      });

      if (!visibleDay) return;

      const d = new Date(visibleDay.date);
      const month = d.getMonth();
      const year = d.getFullYear();
      const key = `${month}-${year}`;

      if (!renderedMonths.has(key)) {
        renderedMonths.add(key);
        labels.push({ index, label: MONTHS[month] });
      }
    });

    return labels;
  }, [weeks, range, mounted]);

  const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

  const triggerGlitch = (finalText, setter) => {
    if (isTier2) {
      setter(finalText);
      return;
    }

    let iteration = 0;
    const interval = setInterval(() => {
      const glitched = finalText
        .split("")
        .map((char, index) => {
          if (char === "." || char === "+") return char;
          if (index < iteration) return finalText[index];
          return randomChars[Math.floor(Math.random() * randomChars.length)];
        })
        .join("");
      setter(glitched);
      iteration += 1 / 2.5;

      if (iteration >= finalText.length) {
        setter(finalText);
        clearInterval(interval);
      }
    }, 35);
  };

  useEffect(() => {
    if (forceTriggerAnimation || !panelRef.current) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisibleState(true);
          setHasEnteredViewportState(true);
        } else {
          setIsVisibleState(false);
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(panelRef.current);

    return () => observer.disconnect();
  }, [mounted, forceTriggerAnimation]);

  useEffect(() => {
    if (!isVisible || isTier2) return undefined;

    const createNotification = (setter, max) => {
      const value = Math.floor(Math.random() * max) + 1;
      setter({ id: Date.now() + Math.random(), value });

      setTimeout(() => {
        setter(null);
      }, 500);
    };

    const aiInterval = setInterval(() => {
      createNotification(setAiNotif, 100);
    }, 5000);

    const coffeeInterval = setInterval(() => {
      createNotification(setCoffeeNotif, 10);
    }, 3500);

    const commitInterval = setInterval(() => {
      createNotification(setCommitNotif, 10);
    }, 3000);

    return () => {
      clearInterval(aiInterval);
      clearInterval(coffeeInterval);
      clearInterval(commitInterval);
    };
  }, [isTier2, isVisible]);

  if (!mounted) {
    return (
      <div className="w-full min-h-60 flex items-center justify-center bg-transparent">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
      </div>
    );
  }

  const renderMobile = () => {
    return (
      <div className="mb-5 grid grid-cols-3 gap-4 uppercase">
        <div className="flex flex-col items-center justify-center py-5 text-center">
          <div className="relative inline-flex items-center justify-center">
            <AnimatePresence>
              {aiNotif && (
                <motion.div
                  key={aiNotif.id}
                  initial={{ opacity: 0, y: 8, scale: 0.8 }}
                  animate={{ opacity: 1, y: -12, scale: 1 }}
                  exit={{ opacity: 0, y: -24, scale: 1.5 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className={`absolute top-0 -right-7 text-[10px] font-semibold ${styles.textPrimary}`}>
                  +{aiNotif.value}
                </motion.div>
              )}
            </AnimatePresence>
            <motion.p
              onHoverStart={() => triggerGlitch("100M+", setAiDisplay)}
              className={`cursor-default text-[15px] font-black tracking-tight ${styles.textSecondary}`}>
              {aiDisplay}
            </motion.p>
          </div>
          <p className={`flex items-center mt-1 text-[10px] font-bold tracking-tight ${styles.textMuted}`}>
            AI tokens used
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-5 text-center">
          <div className="relative inline-flex items-center justify-center">
            <AnimatePresence>
              {coffeeNotif && (
                <motion.div
                  key={coffeeNotif.id}
                  initial={{ opacity: 0, y: 8, scale: 0.8 }}
                  animate={{ opacity: 1, y: -12, scale: 1 }}
                  exit={{ opacity: 0, y: -24, scale: 1.5 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className={`absolute top-0 -right-7 text-[10px] font-semibold ${styles.textFaded}`}>
                  +{coffeeNotif.value}
                </motion.div>
              )}
            </AnimatePresence>
            <motion.p
              onHoverStart={() => triggerGlitch("2.9k+", setCoffeeDisplay)}
              className={`cursor-default text-[15px] font-black tracking-tight ${styles.textSecondary}`}>
              {coffeeDisplay}
            </motion.p>
          </div>
          <p className={`flex items-center mt-1 text-[10px] font-bold tracking-tight ${styles.textMuted}`}>
            Coffees drank
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-5 text-center">
          <div className="relative inline-flex items-center justify-center">
            <AnimatePresence>
              {commitNotif && (
                <motion.div
                  key={commitNotif.id}
                  initial={{ opacity: 0, y: 8, scale: 0.8 }}
                  animate={{ opacity: 1, y: -12, scale: 1 }}
                  exit={{ opacity: 0, y: -24, scale: 1.5 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className={`absolute top-0 -right-7 text-[11px] font-semibold ${styles.textFaded}`}>
                  +{commitNotif.value}
                </motion.div>
              )}
            </AnimatePresence>
            <motion.p
              onHoverStart={() => triggerGlitch(total.toString(), setCommitDisplay)}
              className={`cursor-default text-[15px] font-black tracking-tight ${styles.textPrimary}`}>
              {displayedCommitCount}
            </motion.p>
          </div>
          <p className={`flex items-center mt-1 text-[10px] font-bold tracking-wider ${styles.textMuted}`}>
            Code Commits
          </p>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: 35, filter: "blur(8px)" }}
      animate={hasEnteredViewport ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: isTier2 ? 0.2 : 0.75, ease: [0.22, 1, 0.36, 1] }}
      className={`w-full p-6 md:px-20 pb-15 transition-colors duration-500 ${styles.container}`}>
      {isMobile ? (
        renderMobile()
      ) : (
        <div className="mb-5 grid grid-cols-1 sm:grid-cols-3 gap-4 uppercase">
          <div className="flex flex-col items-center justify-center px-5 py-5 text-center">
            <div className="relative inline-flex items-center justify-center">
              <AnimatePresence>
                {aiNotif && (
                  <motion.div
                    key={aiNotif.id}
                    initial={{ opacity: 0, y: 8, scale: 0.8 }}
                    animate={{ opacity: 1, y: -12, scale: 1 }}
                    exit={{ opacity: 0, y: -24, scale: 1.5 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className={`absolute top-0 -right-9 text-[11px] font-semibold ${styles.textPrimary}`}>
                    +{aiNotif.value}
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.p
                onHoverStart={() => triggerGlitch("100M+", setAiDisplay)}
                className={`cursor-default text-[26px] font-black tracking-tight ${styles.textSecondary}`}>
                {aiDisplay}
              </motion.p>
            </div>
            <p className={`flex items-center mt-2 text-xs font-bold tracking-wider ${styles.textMuted}`}>
              <span className="mr-1.5">
                <GiRaiseZombie size={18} />
              </span>
              AI tokens used
            </p>
          </div>

          <div className="flex flex-col items-center justify-center px-5 py-5 text-center">
            <div className="relative inline-flex items-center justify-center">
              <AnimatePresence>
                {coffeeNotif && (
                  <motion.div
                    key={coffeeNotif.id}
                    initial={{ opacity: 0, y: 8, scale: 0.8 }}
                    animate={{ opacity: 1, y: -12, scale: 1 }}
                    exit={{ opacity: 0, y: -24, scale: 1.5 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className={`absolute top-0 -right-9 text-[11px] font-semibold ${styles.textFaded}`}>
                    +{coffeeNotif.value}
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.p
                onHoverStart={() => triggerGlitch("2.9k+", setCoffeeDisplay)}
                className={`cursor-default text-[26px] font-black tracking-tight ${styles.textSecondary}`}>
                {coffeeDisplay}
              </motion.p>
            </div>
            <p className={`flex items-center mt-2 text-xs font-bold tracking-wider ${styles.textFaded}`}>
              <span className={`mr-1.5 ${isDark ? "text-white/60" : isMetal ? "text-red-700" : "text-gray-600"}`}>
                <DiCoffeescript size={18} />
              </span>
              Coffees drank
            </p>
          </div>

          <div className="flex flex-col items-center justify-center px-5 py-5 text-center">
            <div className="relative inline-flex items-center justify-center">
              <AnimatePresence>
                {commitNotif && (
                  <motion.div
                    key={commitNotif.id}
                    initial={{ opacity: 0, y: 8, scale: 0.8 }}
                    animate={{ opacity: 1, y: -12, scale: 1 }}
                    exit={{ opacity: 0, y: -24, scale: 1.5 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className={`absolute top-0 -right-9 text-[11px] font-semibold ${styles.textFaded}`}>
                    +{commitNotif.value}
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.p
                onHoverStart={() => triggerGlitch(total.toString(), setCommitDisplay)}
                className={`cursor-default text-[26px] font-black tracking-tight ${styles.textPrimary}`}>
                {displayedCommitCount}
              </motion.p>
            </div>
            <p className={`flex items-center mt-2 text-xs font-bold tracking-wider ${styles.textMuted}`}>
              <span className="mr-1.5">
                <FaGitAlt size={18} />
              </span>
              Code Commits
            </p>
          </div>
        </div>
      )}

      <div className="mb-5 text-center">
        <h2 className={`text-xl md:text-2xl font-black tracking-tight uppercase ${styles.textSecondary}`}>
          My Personal GitHub Activity
        </h2>
        <p className={`mt-1 text-xs italic font-medium ${styles.textFaded}`}>
          (Work commits are hiding in another dimension)
        </p>
      </div>

      <div className={`min-h-60 w-full rounded-xl p-4 md:p-6 shadow-sm transition-colors duration-500 ${styles.card}`}>
        {loading ? (
          <div className="flex h-65 items-center justify-center">
            <div className="flex items-center gap-3">
              <div className={`${styles.spinnerBase} ${styles.spinnerColor}`} />
              <p className={`text-sm font-medium ${styles.textMuted}`}>Loading contributions...</p>
            </div>
          </div>
        ) : (
          <>
            {weeks.length > 0 && (
              <div
                className={`mb-3 ml-8 grid text-[10px] font-bold uppercase tracking-wider ${styles.textFaded} ${isMobile ? "max-w-85 mx-auto" : ""}`}
                style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}>
                {monthLabels.map((month) => (
                  <div key={month.index} style={{ gridColumnStart: month.index + 1 }}>
                    {month.label}
                  </div>
                ))}
              </div>
            )}

            <div className="flex w-full justify-center md:justify-start">
              <div
                className={`mr-3 flex flex-col justify-between py-1 text-[10px] font-bold uppercase ${styles.textFaded}`}>
                <span> Mon </span>
                <span> Wed </span>
                <span> Fri </span>
              </div>

              {weeks.length > 0 ? (
                <div
                  className={`grid flex-1 gap-1 overflow-hidden ${isMobile ? "max-w-85" : ""}`}
                  style={{
                    gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
                  }}>
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="grid grid-rows-7 gap-1">
                      {week.contributionDays.map((day, dayIndex) => {
                        const count = day.contributionCount;
                        let backgroundColor = themeColors[0];

                        if (count > 0 && count <= 2) backgroundColor = themeColors[1];
                        if (count > 2 && count <= 5) backgroundColor = themeColors[2];
                        if (count > 5 && count <= 10) backgroundColor = themeColors[3];
                        if (count > 10) backgroundColor = themeColors[4];

                        const staggerDelay = isTier2 ? 0 : weekIndex * 0.012 + dayIndex * 0.002;
                        const borderColor = isDark
                          ? "border-white/5"
                          : isMetal
                            ? "border-red-500/10"
                            : "border-black/5";

                        return (
                          <motion.div
                            key={day.date}
                            initial={isTier2 ? false : { opacity: 0, scale: 0.1, rotateY: 90 }}
                            animate={hasEnteredViewport ? { opacity: 1, scale: 1, rotateY: 0 } : {}}
                            transition={
                              isTier2
                                ? { duration: 0 }
                                : {
                                    type: "spring",
                                    stiffness: 100,
                                    damping: 14,
                                    delay: staggerDelay,
                                    duration: 0.4,
                                  }
                            }
                            whileHover={
                              isTier2
                                ? undefined
                                : {
                                    scale: 1.25,
                                    zIndex: 10,
                                    transition: { duration: 0.1 },
                                  }
                            }
                            title={`${day.contributionCount} contributions on ${day.date}`}
                            className={`aspect-square w-full rounded-xs transition-all cursor-crosshair border ${borderColor}`}
                            style={{ backgroundColor }}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className={`flex-1 flex items-center justify-center py-12 text-sm font-medium text-center ${styles.textFaded}`}>
                  No tracking log history discovered within this date range scope boundary.
                </div>
              )}
            </div>

            <div
              className={`mt-6 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider ${styles.textFaded}`}>
              <div className="flex items-center gap-2">
                <span>Less</span>

                <div className="flex gap-1">
                  {themeColors.map((color) => (
                    <div
                      key={color}
                      className={`h-3 w-3 rounded-xs border ${
                        isDark ? "border-white/5" : isMetal ? "border-red-500/10" : "border-black/5"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <span>More</span>
              </div>

              <Link
                href="https://github.com/akhilshettym"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1.5 transition-colors duration-300 hover:opacity-100"
                aria-label="Visit my GitHub profile">
                <span className="lowercase">akhilshettym</span>
                <FaGithub size={15} />
              </Link>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default memo(GithubGraphQl);
