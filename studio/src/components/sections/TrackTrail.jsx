"use client";

import Link from "next/link";
import Image from "next/image";
import "@/styles/track_trail.css";
import { FaSalesforce } from "react-icons/fa6";
import { getTrailStyles } from "@/utils/swatch";
import { useTheme } from "@/context/ThemeContext";
import { useDeviceType } from "@/hooks/useDeviceType";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { getTrailhead, seedPortfolioCache } from "@/lib/payload/contentapi";

const BASE_BANNERS = ["/trailhead/champion.svg", "/trailhead/innovator.svg"];

const DEFAULT_BANNERS = Array.from({ length: 4 }, () => BASE_BANNERS).flat();

const EMPTY_TRAILHEAD = {
  rankTitle: "Triple Star Ranger",
  superbadges: 0,
  points: 0,
  badges: 0,
  trails: 0,
};

const TrackTrail = memo(function TrackTrail({ banners = DEFAULT_BANNERS, initialTrailhead }) {
  const { theme } = useTheme();
  const styles = getTrailStyles(theme);
  const { isMobile } = useDeviceType();
  const { isTier2 } = usePerformanceTier();

  const hasInitialTrailhead =
    initialTrailhead !== undefined && initialTrailhead !== null && typeof initialTrailhead === "object";

  const [fetchedData, setFetchedData] = useState(EMPTY_TRAILHEAD);
  const [isFetching, setIsFetching] = useState(!hasInitialTrailhead);

  const data = hasInitialTrailhead
    ? {
        ...EMPTY_TRAILHEAD,
        ...initialTrailhead,
      }
    : fetchedData;

  const isLoading = !hasInitialTrailhead && isFetching;

  useEffect(() => {
    if (hasInitialTrailhead) {
      seedPortfolioCache({
        trailhead: initialTrailhead,
      });

      return undefined;
    }

    const controller = new AbortController();

    const fetchTrailhead = async () => {
      setIsFetching(true);

      try {
        const trailData = await getTrailhead();

        if (controller.signal.aborted) {
          return;
        }

        setFetchedData({
          ...EMPTY_TRAILHEAD,
          ...(trailData || {}),
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("Failed to load Trailhead data:", error);

        setFetchedData(EMPTY_TRAILHEAD);
      } finally {
        if (!controller.signal.aborted) {
          setIsFetching(false);
        }
      }
    };

    fetchTrailhead();

    return () => {
      controller.abort();
    };
  }, [hasInitialTrailhead, initialTrailhead]);

  return (
    <div
      aria-labelledby="trailhead-title"
      className={`w-full px-4 pb-15 md:px-8 lg:px-12 transition-colors duration-500 ${styles.wrapper}`}>
      <div className="mb-3 flex items-center justify-between px-4 sm:px-6 md:px-10">
        <h2
          id="trailhead-title"
          className={`text-xl mt-10 sm:text-2xl md:text-3xl font-black uppercase tracking-tighter md:tracking-[-0.09em] transition-colors duration-500 ${styles.cardTitle}`}>
          /Salesforce
        </h2>

        <div className="flex mt-10 items-center gap-1.5">
          <Link
            href="https://www.salesforce.com/trailblazer/akhilshettym"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit Salesforce Trailhead"
            className={`text-sm sm:text-base font-black tracking-tight md:tracking-[-0.06em] transition-colors duration-500 hover:opacity-75 ${styles.cardTitle}`}>
            .trailhead
          </Link>

          <FaSalesforce size={15} aria-hidden="true" className={styles.cardTitle} />
        </div>
      </div>

      <div
        className={`mx-auto flex w-full max-w-328 flex-col overflow-hidden rounded-md border transition-all duration-500 group lg:flex-row ${styles.container}`}>
        <div
          className={`relative flex min-w-50 shrink-0 flex-col items-center justify-center border-b p-4 transition-colors duration-500 lg:border-b-0 lg:border-r ${styles.rankBox}`}>
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl transition-colors duration-500 ${styles.rankGlow}`}
          />

          <div className="relative z-10 mb-3 h-15 w-15">
            <Image
              src="/trailhead/four_star_ranger.png"
              alt="Four Star Ranger"
              fill
              sizes="60px"
              priority
              className={`object-contain transition-all duration-500 ease-out ${styles.imageFilter}`}
            />
          </div>

          <h3
            className={`relative z-10 text-center text-xs font-black uppercase tracking-normal transition-colors duration-500 ${styles.rankTitle}`}>
            {isLoading ? "Loading..." : data.rankTitle}
          </h3>
        </div>

        <div className="flex flex-1 flex-row flex-wrap items-center justify-around gap-4 px-4 py-6 lg:flex-nowrap lg:gap-2 lg:px-10 lg:py-0">
          <StatItem
            value={data.superbadges}
            label="Superbadges"
            valueClass={styles.statValue}
            labelClass={styles.statLabel}
            isTier2={isTier2}
          />

          <Divider className={styles.divider} />

          <StatItem
            value={data.points}
            label="Total Points"
            valueClass={styles.statValue}
            labelClass={styles.statLabel}
            isTier2={isTier2}
          />

          <Divider className={styles.divider} />

          <StatItem
            value={data.badges}
            label="Badges"
            valueClass={styles.statValue}
            labelClass={styles.statLabel}
            isTier2={isTier2}
          />

          <Divider className={styles.divider} />

          <StatItem
            value={data.trails}
            label="Trails"
            valueClass={styles.statValue}
            labelClass={styles.statLabel}
            isTier2={isTier2}
          />
        </div>

        {!isMobile && (
          <div
            className={`relative flex h-2 w-full shrink-0 items-center overflow-hidden border-t fade-edges transition-colors duration-500 lg:h-auto lg:w-75 lg:border-l lg:border-t-0 ${styles.marqueeBox}`}
            aria-label="Trailhead achievements">
            <div className="animate-sleek-marquee py-3 lg:py-0 motion-reduce:animate-none">
              <BannerSet banners={banners} setId="set1" filterClass={styles.imageFilter} />
              <BannerSet banners={banners} setId="set2" filterClass={styles.imageFilter} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

TrackTrail.displayName = "TrackTrail";

function Divider({ className = "" }) {
  return <div aria-hidden="true" className={`hidden h-10 w-px transition-colors duration-500 lg:block ${className}`} />;
}

const StatItem = memo(function StatItem({ value, label, valueClass = "", labelClass = "", isTier2 = false }) {
  const normalizedValue = formatValue(value);
  const [animation, setAnimation] = useState(null);
  const animationRef = useRef(null);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [normalizedValue]);

  const handleMouseEnter = useCallback(() => {
    if (isTier2 || value === undefined || value === null || normalizedValue.length <= 1 || animationRef.current) {
      return;
    }

    const reversed = normalizedValue.split("").reverse().join("");

    const steps = [];

    for (let i = 0; i < normalizedValue.length; i += 1) {
      steps.push(reversed.slice(i) + reversed.slice(0, i));
    }

    steps.push(normalizedValue);

    let currentStep = 0;

    animationRef.current = setInterval(() => {
      if (currentStep >= steps.length) {
        clearInterval(animationRef.current);
        animationRef.current = null;

        setAnimation(null);

        return;
      }

      setAnimation({
        source: normalizedValue,
        text: steps[currentStep],
      });

      currentStep += 1;
    }, 60);
  }, [isTier2, normalizedValue, value]);

  const displayText = animation?.source === normalizedValue ? animation.text : normalizedValue;

  return (
    <div
      role="group"
      aria-label={`${label}: ${normalizedValue}`}
      onMouseEnter={handleMouseEnter}
      className="flex w-1/3 min-w-20 cursor-pointer select-none flex-col items-center justify-center lg:w-auto">
      <span className={`text-2xl font-black tracking-tighter transition-colors duration-500 lg:text-3xl ${valueClass}`}>
        {displayText}
      </span>

      <span
        className={`mt-1 text-[9px] font-bold uppercase tracking-normal transition-colors duration-500 lg:text-[10px] ${labelClass}`}>
        {label}
      </span>
    </div>
  );
});

StatItem.displayName = "StatItem";

const BannerSet = memo(function BannerSet({ banners, setId, filterClass = "" }) {
  return (
    <div className="flex w-max items-center gap-5 px-4">
      {banners.map((url, index) => (
        <div key={`${setId}-${url}-${index}`} className="relative flex h-16 w-40 shrink-0 items-center justify-center">
          <Image
            src={url}
            alt="Triple Star Ranger"
            aria-hidden="true"
            fill
            sizes="160px"
            className={`cursor-pointer object-contain transition-all duration-300 hover:scale-110 ${filterClass}`}
          />
        </div>
      ))}
    </div>
  );
});

BannerSet.displayName = "BannerSet";

function formatValue(value) {
  if (value === undefined || value === null || value === "") {
    return "0";
  }

  return String(value);
}

export default TrackTrail;
