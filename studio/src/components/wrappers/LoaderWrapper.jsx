"use client";

import "@/styles/intro_entrance.css";
import { INTRO_SEEN } from "@/utils/storage";
import Loader from "@/components/animations/Loader";
import PageReveal from "@/components/animations/PageReveal";
import { createContext, useEffect, useRef, useState } from "react";
import CinematicIntro from "@/components/animations/CinematicIntro";

export const LoadingContext = createContext();

export default function LoaderWrapper({ children }) {
  const [loading, setLoading] = useState(true);
  const [hasSeenIntro, setHasSeenIntro] = useState(null);
  const [showIntro, setShowIntro] = useState(false);
  const [revealActive, setRevealActive] = useState(false);
  const [navReady, setNavReady] = useState(false);
  const [shouldMountChildren, setShouldMountChildren] = useState(false);

  const revealTimerRef = useRef(null);
  const restartTimerRef = useRef(null);
  const introCompletedRef = useRef(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const seen = window.localStorage.getItem(INTRO_SEEN) === "true";
      setHasSeenIntro(seen);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const startReveal = () => {
    setRevealActive(true);

    window.clearTimeout(revealTimerRef.current);
    revealTimerRef.current = window.setTimeout(() => {
      setNavReady(true);
    }, 1800);
  };

  useEffect(() => {
    if (loading || hasSeenIntro === null) return;

    const frame = window.requestAnimationFrame(() => {
      if (hasSeenIntro) {
        startReveal();
      } else {
        setShowIntro(true);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [loading, hasSeenIntro]);

  useEffect(() => {
    return () => {
      window.clearTimeout(revealTimerRef.current);
      window.clearTimeout(restartTimerRef.current);
    };
  }, []);

  const handleIntroComplete = () => {
    if (introCompletedRef.current) return;

    introCompletedRef.current = true;
    window.localStorage.setItem(INTRO_SEEN, "true");
    setHasSeenIntro(true);
    setShowIntro(false);
    window.requestAnimationFrame(() => {
      setShouldMountChildren(true);
      startReveal();
    });
  };

  const triggerIntroRestart = () => {
    introCompletedRef.current = false;
    window.localStorage.removeItem(INTRO_SEEN);
    setRevealActive(false);
    setNavReady(false);

    window.clearTimeout(restartTimerRef.current);
    restartTimerRef.current = window.setTimeout(() => {
      setShouldMountChildren(false);
      setHasSeenIntro(false);
    }, 500);
  };

  return (
    <LoadingContext.Provider value={{ isLoading: loading, navReady, triggerIntroRestart }}>
      {loading && <Loader onFinish={() => setLoading(false)} />}

      {!loading && showIntro && <CinematicIntro onComplete={handleIntroComplete} />}

      <PageReveal active={revealActive}>
        <div className={`relative transition-opacity duration-500 ${revealActive ? "opacity-100" : "opacity-0"}`}>
          {(shouldMountChildren || hasSeenIntro) && children}
        </div>
      </PageReveal>
    </LoadingContext.Provider>
  );
}
