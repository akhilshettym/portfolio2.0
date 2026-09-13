"use client";

import { PERF_TIER } from "@/utils/storage";
import { IoIosNuclear } from "react-icons/io";
import React, { useState } from "react";
import { useDeviceType } from "@/hooks/useDeviceType";
import { motion, AnimatePresence } from "framer-motion";
import { useCookieConsent } from "@/context/CookieContext";

const TierSwitcher = () => {
  const { isMobile } = useDeviceType();
  const { showBanner, setShowBanner } = useCookieConsent();

  const [sysTier] = useState(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem(PERF_TIER);
  });

  const shouldRender = sysTier === "tier_2" && showBanner;

  const handleSettle = () => {
    setShowBanner(false);
  };

  const handlePeek = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(PERF_TIER, "tier_1");
      window.location.reload();
    }
  };

  return (
    <AnimatePresence>
      {shouldRender && (
        <div className="fixed top-32 left-0 w-full flex justify-center items-center z-9999 pointer-events-none px-4">
          <motion.div
            initial={{
              y: -200,
              width: "36px",
              height: "36px",
              opacity: 0,
              borderRadius: "9999px",
            }}
            animate={{
              y: 0,
              width: "100%",
              height: "auto",
              opacity: 1,
              borderRadius: "9999px",
            }}
            exit={{
              y: -100,
              scale: 0.5,
              opacity: 0,
              transition: { duration: 0.25, ease: "easeIn" },
            }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 130,
              mass: 0.8,
            }}
            className="pointer-events-auto shadow-2xl border border-white/50 max-w-4xl rounded-full backdrop-blur-sm bg-white/20 px-6 py-3 overflow-visible">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, delay: 0.15 }}
              className="flex flex-row items-center justify-between gap-6 w-full">
              {" "}
              <div className="flex items-center text-black min-w-0">
                {" "}
                <p className="text-xs sm:text-sm font-medium tracking-normal inline-flex items-center gap-1.5 text-justify">
                  {" "}
                  <span>
                    {isMobile
                      ? "System currently running in Efficiency mode. Switch to Performance mode?"
                      : "Your machine is running in Efficiency mode. Do you want to spin up to performance mode?"}{" "}
                  </span>
                  {!isMobile && (
                    <span className="relative inline-flex items-center group cursor-pointer">
                      <IoIosNuclear className="text-sm sm:text-base text-black/70 group-hover:text-black transition-colors duration-200" />

                      <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:flex flex-col items-center pointer-events-none z-10000">
                        <span className="w-2 h-2 bg-white/80 backdrop-blur-md border-t border-l border-white/60 rotate-45 -mb-1 z-10" />

                        <span className="bg-white/80 backdrop-blur-md text-black text-[11px] font-normal italic px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl border border-white/60">
                          Warning: May cause your fans to sound like a jet taking off
                        </span>
                      </span>
                    </span>
                  )}
                </p>
              </div>
              <div className="flex flex-row items-center gap-2.5 shrink-0">
                <button
                  onClick={handleSettle}
                  className="text-xs font-semibold px-4 py-1.5 rounded-full bg-white text-black border border-black/20 hover:bg-black hover:text-white transition-colors duration-200">
                  Settle
                </button>

                <button
                  onClick={handlePeek}
                  className="text-xs font-semibold px-4.5 py-1.5 rounded-full bg-black text-white border border-black hover:bg-white hover:text-black transition-colors duration-200">
                  Peek
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TierSwitcher;
