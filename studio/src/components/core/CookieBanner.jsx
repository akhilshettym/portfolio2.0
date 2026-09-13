"use client";

import Link from "next/link";

import { FiShield } from "react-icons/fi";
import { IoSettingsOutline } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { useCookieConsent } from "@/context/CookieContext";

export default function CookieBanner() {
  const { isCookieBannerReady, handleAccept, handleDecline } = useCookieConsent();

  return (
    <AnimatePresence>
      {isCookieBannerReady && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 16, scale: 0.98, filter: "blur(6px)" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-6 md:left-auto md:right-6 md:w-[min(90vw,600px)] z-50 border border-black/15 bg-white/80 backdrop-blur-2xl text-black shadow-[0_16px_50px_rgba(0,0,0,0.14)] p-4 sm:p-5 rounded-none">
          <div className="flex flex-col gap-3.5">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.3 }}
              className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] sm:text-xs text-black/60">
              <h3 className="inline text-sm sm:text-[15px] font-semibold tracking-tight text-black">
                We care about your privacy:
              </h3>

              <span>We use cookies to improve your experience and understand site usage.</span>

              <Link
                href="/privacy"
                className="inline-flex items-center gap-1 text-black font-medium uppercase underline underline-offset-2 decoration-black/25 hover:decoration-black transition-all">
                Privacy Policy
                <FiShield size={12} />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14, duration: 0.3 }}
              className="flex items-center justify-between gap-4 border-t border-black/10 pt-3">
              <p className="flex items-center gap-1 text-[9px] sm:text-[10px] leading-relaxed text-black/40">
                Change your preference anytime from settings.
                <IoSettingsOutline size={12} />
              </p>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={handleDecline}
                  className="px-3 py-1.5 text-[10px] sm:text-[11px] font-medium border border-black/20 bg-transparent text-black rounded-none transition-colors duration-200 hover:bg-black hover:text-white hover:border-black">
                  Decline
                </button>

                <button
                  type="button"
                  onClick={handleAccept}
                  className="px-3 py-1.5 text-[10px] sm:text-[11px] font-medium border border-black bg-black text-white rounded-none transition-colors duration-200 hover:bg-white hover:text-black">
                  Accept
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
