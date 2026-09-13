"use client";

import { useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { FiShield } from "react-icons/fi";
import { pushToDataLayer } from "@/lib/gtm";
import { useRouter } from "next/navigation";
import ModeSwitch from "../basic/ModeSwitch";
import { IoMdNuclear } from "react-icons/io";
import { WiMoonAltFull } from "react-icons/wi";
import { SiRevealdotjs } from "react-icons/si";
import { TiWeatherSunny } from "react-icons/ti";
import { AiOutlineClear } from "react-icons/ai";
import { useTheme } from "@/context/ThemeContext";
import { getWeatherIconData } from "@/utils/stage";
import { GiRabbit, GiTortoise } from "react-icons/gi";
import { MOON_MAP, WEATHER_MAP } from "@/utils/basic";
import { useDeviceType } from "@/hooks/useDeviceType";
import { getControlModalStyles } from "@/utils/swatch";
import { AnimatePresence, motion } from "framer-motion";
import { HiMiniPause, HiMiniPlay } from "react-icons/hi2";
import { ASSET_CACHE, LOCATION_MODE, SCENE_CACHE } from "@/utils/storage";

export default function ControlModal({ open, onClose, paused, isTier2, handleCloudControl, handleRestartIntroScene }) {
  const router = useRouter();
  const { theme } = useTheme();
  const { isMobile } = useDeviceType();

  const weatherData = getWeatherIconData();
  const moonPhase = weatherData?.getMoonPhase;
  const sceneCondition = weatherData?.getSceneCondition;

  const WeatherGlyph = WEATHER_MAP[sceneCondition]?.icon || TiWeatherSunny;
  const MoonGlyph = MOON_MAP[moonPhase]?.icon || WiMoonAltFull;
  const weatherLabel = WEATHER_MAP[sceneCondition]?.label || "Weather";
  const moonLabel = MOON_MAP[moonPhase]?.label || "Moon";
  const normalizedTheme = String(theme || "light").toLowerCase();

  const handleNavigation = () => {
    router.push("/privacy");
  };

  const handleResetScene = () => {
    try {
      localStorage.removeItem(SCENE_CACHE);
      localStorage.removeItem(ASSET_CACHE);
      localStorage.removeItem(LOCATION_MODE);

      const defaultAssets = {
        background: "morning_clear",
        clouds: "morning_clear",
      };

      localStorage.setItem(LOCATION_MODE, "denied");
      localStorage.setItem(ASSET_CACHE, JSON.stringify(defaultAssets));

      window.location.reload();
    } catch {
      console.error("data flush failed");
    }
  };

  const handlePurgeStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();

      pushToDataLayer("storage_purged", { storage_purged: "purged" });

      setTimeout(() => {
        window.location.reload();
      }, 150);
    } catch (error) {
      console.error("Storage purge failed", error);
    }
  };

  const handleTierSwitch = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("sys_tier");
      localStorage.setItem("sys_tier", "tier_1");
      window.location.reload();
    }
  };

  const themeStyles = getControlModalStyles;
  const styles = themeStyles[normalizedTheme] || themeStyles.light;

  const cloudsValue = isTier2 ? "Disabled" : paused ? "Paused" : "Running";
  const cloudsIcon = isTier2 ? <HiMiniPlay size={15} /> : paused ? <HiMiniPlay size={15} /> : <HiMiniPause size={15} />;
  const cloudsDescription = isTier2
    ? "Unavailable on this device due to system constraints."
    : paused
      ? "Resume the moving atmospheric cloud layer."
      : "Pause the moving atmospheric cloud layer.";

  const limpIcon = isTier2 ? <GiTortoise size={15} /> : <GiRabbit size={15} />;
  const limpLabel = isTier2 ? "Efficiency Mode" : "Performance Mode";
  const limpDescription = isTier2
    ? "Visuals automatically dialed back to ensure smooth operation on this device."
    : "Running optimally with uncompromised visual fidelity and high frame rates.";

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
          className={`pointer-events-auto fixed inset-0 z-100000 flex items-center justify-center p-4 backdrop-blur-xs ${styles.overlay}`}>
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
            onMouseDown={(event) => event.stopPropagation()}
            className={`flex w-full max-w-xl flex-col border backdrop-blur-2xl ${styles.modal}`}>
            <div className={`shrink-0 flex items-start justify-between border-b px-5 py-3 ${styles.header}`}>
              <div>
                <h2 className={`text-sm font-bold uppercase tracking-tighter ${styles.title}`}>Site Controls</h2>
                <p className={`max-w-xs text-[10px] leading-4 ${styles.description}`}>
                  Manage active connections, environments, and data states.
                </p>
              </div>

              {!isMobile && (
                <div className="ml-35 mt-1.5 hidden sm:block">
                  <ModeSwitch />
                </div>
              )}

              <button
                type="button"
                aria-label="Close site controls"
                onClick={onClose}
                className={`flex h-8 w-8 items-center justify-center border transition-colors ${styles.close}`}>
                <IoClose size={15} />
              </button>
            </div>

            <div className={`border-b px-2 py-2 sm:px-3 ${styles.divider}`}>
              <h3 className={`px-2 pb-2 text-[10px] font-bold uppercase tracking-widest ${styles.title}`}>
                Environment Data
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <ControlCard
                  status="static"
                  icon={<MoonGlyph size={15} />}
                  value={moonLabel}
                  description="Live lunar phase tracking based on current astronomical data."
                  actionLabel="PHASE"
                  styles={styles}
                />
                <ControlCard
                  status="static"
                  icon={<WeatherGlyph size={15} />}
                  value={weatherLabel}
                  description="Synchronized in real-time with your local atmospheric conditions."
                  actionLabel="LIVE"
                  styles={styles}
                />
                <ControlCard
                  status="static"
                  icon={limpIcon}
                  value={limpLabel}
                  description={limpDescription}
                  actionLabel="STATUS"
                  styles={styles}
                />
              </div>
            </div>

            <div className="px-2 py-2 sm:px-3">
              <h3 className={`px-2 pb-2 text-[10px] font-bold uppercase tracking-widest ${styles.title}`}>
                Active Controls
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <ControlCard
                  status={isTier2 ? "disabled" : "active"}
                  icon={cloudsIcon}
                  value={cloudsValue}
                  description={cloudsDescription}
                  actionLabel="CONTROL"
                  disabled={isTier2}
                  onClick={handleCloudControl}
                  styles={styles}
                />
                <ControlCard
                  status="active"
                  icon={<SiRevealdotjs size={12} />}
                  value="Run intro"
                  description="Trigger a full cinematic replay of the opening scene animation."
                  actionLabel="REPLAY"
                  onClick={handleRestartIntroScene}
                  styles={styles}
                />
                <ControlCard
                  status="active"
                  icon={<AiOutlineClear size={15} />}
                  value="Erase data"
                  description="Wipe custom scene preferences to restore the default layout state."
                  actionLabel="WIPE"
                  onClick={handleResetScene}
                  styles={styles}
                />
                <ControlCard
                  status="active"
                  icon={<IoMdNuclear size={15} />}
                  value="Purge Storage"
                  description="Purge all local, session storage and analytics data, followed by a hard reset."
                  actionLabel="PURGE"
                  onClick={handlePurgeStorage}
                  styles={styles}
                />
                <ControlCard
                  status={!isTier2 ? "disabled" : "active"}
                  icon={<GiRabbit size={15} />}
                  value="Perf Mode"
                  description="Spin up the machine to performance mode for maximum visual fidelity."
                  actionLabel="BOOST"
                  disabled={!isTier2}
                  onClick={handleTierSwitch}
                  styles={styles}
                />
                <ControlCard
                  status="active"
                  icon={<FiShield size={15} />}
                  value="Privacy Policy"
                  description="Discover how I collect, manage, and secure the data you share with me."
                  actionLabel="OPEN"
                  onClick={handleNavigation}
                  styles={styles}
                />
              </div>
            </div>

            <div className={`shrink-0 flex items-center justify-end border-t px-5 py-2.5 ${styles.divider}`}>
              <div className={`hidden sm:flex items-center gap-2 text-[10px] ${styles.footer}`}>
                <span>Press</span>
                <span className={`border px-1.5 py-0.5 text-[9px] font-semibold uppercase ${styles.key}`}>esc</span>
                <span>to close</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ControlCard({ icon, value, description, actionLabel, disabled = false, onClick, styles, status }) {
  const isInteractive = status !== "static";
  const Component = isInteractive ? "button" : "div";

  const dotColor = status === "active" ? "bg-emerald-500" : status === "disabled" ? "bg-amber-500" : "bg-slate-500";

  return (
    <Component
      type={isInteractive ? "button" : undefined}
      disabled={disabled}
      onClick={(event) => {
        if (!isInteractive || disabled) return;
        event.stopPropagation();
        onClick();
      }}
      className={`group relative flex flex-col justify-between border p-3 text-left transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40
    ${isInteractive ? `min-h-24 cursor-pointer ${styles.card}` : `min-h-20 sm:min-h-16 cursor-default ${styles.cardStatic}`}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center border transition-transform duration-300
          ${isInteractive && !disabled ? "group-hover:-rotate-3 group-hover:scale-105" : ""} ${styles.cardIcon}`}>
            {icon}
          </span>
          <span
            className={`wrap-break-word text-[10px] font-bold uppercase tracking-wide ${styles.cardValue || styles.title}`}>
            {value}
          </span>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={`w-1.5 h-1.5 rounded-full shadow-sm ${dotColor}`} />
          {actionLabel && (
            <span
              className={`text-[9px] font-bold tracking-widest transition-opacity duration-200
          ${isInteractive && !disabled ? "opacity-0 group-hover:opacity-100" : "opacity-60"} ${styles.cardText}`}>
              {actionLabel}
            </span>
          )}
        </div>
      </div>

      <div className={`mt-2 ${!isInteractive ? "block sm:hidden" : ""}`}>
        <div className={`text-[10px] leading-normal ${styles.cardText}`}>{description}</div>
      </div>

      {!isInteractive && (
        <span
          className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden sm:group-hover:flex flex-col items-center pointer-events-none z-100`}>
          <span className={`w-2 h-2 rotate-45 -mb-1 border-t border-l ${styles.modal} ${styles.border || ""}`}></span>
          <span
            className={`text-[10px] p-2 rounded shadow-xl border whitespace-normal w-40 text-center ${styles.modal} ${styles.cardText}`}>
            {description}
          </span>
        </span>
      )}
    </Component>
  );
}
