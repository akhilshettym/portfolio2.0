"use client";

import "@/styles/navbar.css";
import Link from "next/link";
import { pushToDataLayer } from "@/lib/gtm";
import { usePathname } from "next/navigation";
import { SiGnometerminal } from "react-icons/si";
import { useTheme } from "@/context/ThemeContext";
import ConsoleModal from "../modals/ConsoleModal";
import { getNavbarStyles } from "@/utils/swatch";
import NavbarLogo from "@/components/basic/NavbarLogo";
import ModeSwitch from "@/components/basic/ModeSwitch";
import { useEffect, useState, useRef, memo } from "react";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function randomChar() {
  return chars[Math.floor(Math.random() * chars.length)];
}

function scrambleTo(setText, finalText) {
  let frame = 0;
  const original = finalText.split("");

  const interval = setInterval(() => {
    const newText = original.map((_char, i) => (i < frame ? original[i] : randomChar())).join("");

    setText(newText);
    frame++;

    if (frame > original.length) {
      clearInterval(interval);
      setText(finalText);
    }
  }, 30);
}

function GlitchNavItem({ href, label, active, delay = 0, theme }) {
  const ref = useRef(null);
  const resetRef = useRef(null);
  const [text, setText] = useState(label);
  const [width, setWidth] = useState(null);

  useEffect(() => {
    if (ref.current) {
      setWidth(ref.current.offsetWidth);
    }

    const t = setTimeout(() => {
      scrambleTo(setText, label);
    }, delay);

    return () => clearTimeout(t);
  }, [label, delay]);

  const handleEnter = () => {
    clearTimeout(resetRef.current);
    scrambleTo(setText, label);
  };

  const handleLeave = () => {
    resetRef.current = setTimeout(() => {
      setText(label);
    }, 120);
  };

  const isDark = theme === "dark";
  const isMetal = theme === "metal";

  const activeClass = isMetal ? "bg-red-500 text-black" : isDark ? "bg-white text-black" : "bg-black text-white";

  const inactiveClass = isMetal
    ? "bg-red-500/10 text-red-500/80 hover:bg-red-500 hover:text-black"
    : isDark
      ? "bg-white/10 text-gray-300 hover:bg-white hover:text-black"
      : "bg-black/5 text-gray-700 hover:bg-black hover:text-white";

  return (
    <Link
      href={href}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className={`px-2 py-2 text-[11px] font-bold uppercase tracking-tight transition text-center inline-flex justify-center items-center min-w-10 ${
        active ? activeClass : inactiveClass
      }`}
      style={width ? { width: Math.max(width, 60) } : {}}>
      <span ref={ref} className="whitespace-nowrap">
        {" "}
        {text}{" "}
      </span>
    </Link>
  );
}

const Navbar = () => {
  const { theme } = useTheme();
  const pathname = usePathname();
  const [time, setTime] = useState("");
  const { isTier2 } = usePerformanceTier();
  const [consoleOpen, setConsoleOpen] = useState(false);

  const {
    isDark,
    isMetal,
    headerBgClass,
    textColorClass,
    textMutedClass,
    mobileNavActiveClass,
    mobileNavInactiveClass,
    consoleSlideClass,
    marqueeFadeLeft,
    marqueeFadeRight,
    marqueeDiv1,
    marqueeDiv2,
    terminalBgClass,
    terminalHoverClass,
  } = getNavbarStyles(theme);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      );
    };

    updateTime();

    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const [ipParts, setIpParts] = useState([192, 168, 34, 120]);

  const clamp = (num) => Math.max(0, Math.min(255, num));

  useEffect(() => {
    let lastScrollUpdate = 0;
    const SCROLL_THROTTLE = 100;

    const handleScroll = () => {
      const now = Date.now();

      if (now - lastScrollUpdate < SCROLL_THROTTLE) {
        return;
      }

      lastScrollUpdate = now;

      const scrollY = window.scrollY;

      setIpParts((prev) => {
        const next = [...prev];

        next[0] = clamp((192 + Math.floor(scrollY * 0.01)) % 256);
        next[1] = clamp((168 + Math.floor(scrollY * 0.02)) % 256);
        next[2] = clamp((34 + Math.floor(scrollY * 0.03)) % 256);

        return next;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let lastMouseUpdate = 0;
    const MOUSE_THROTTLE = 50;

    const handleMouseMove = (e) => {
      const now = Date.now();

      if (now - lastMouseUpdate < MOUSE_THROTTLE) {
        return;
      }

      lastMouseUpdate = now;

      const xRatio = e.clientX / window.innerWidth;

      setIpParts((prev) => {
        const next = [...prev];

        next[3] = clamp(Math.floor(xRatio * 255));

        return next;
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const ip = ipParts.join(".");

  const handleConsoleOpen = () => {
    setConsoleOpen((prev) => !prev);
    pushToDataLayer("terminal_triggered", { terminal_triggered: "command" });
  };

  const navItems = [
    { label: "INFO", href: "/" },
    { label: "WORK", href: "/work" },
    { label: "START", href: "/start" },
  ];

  return (
    <>
      <div
        className={`fixed top-0 left-0 z-50 w-full border-b backdrop-blur-md transition-colors duration-300 ${headerBgClass} ${textColorClass}`}>
        <div className="w-full px-3 py-6 sm:hidden">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Link href="/" className="relative h-10 w-10 shrink-0 block">
                <NavbarLogo />
              </Link>

              <nav aria-label="Mobile Navigation" className="flex min-w-0 gap-1 overflow-hidden">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`shrink-0 px-2 py-1.5 text-[9px] font-bold uppercase tracking-wide transition ${
                      pathname === item.href ? mobileNavActiveClass : mobileNavInactiveClass
                    }`}>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div className="shrink-0">
                <ModeSwitch />
              </div>

              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
                <div
                  className={`absolute right-full top-1/2 flex -translate-y-1/2 items-center overflow-hidden transition-all duration-300 ease-out ${
                    consoleOpen ? "mr-2 w-22 opacity-100" : "mr-0 w-0 opacity-0"
                  } ${consoleSlideClass}`}>
                  <div className="flex items-center whitespace-nowrap px-2 py-1 text-[9px]">
                    <span className="mr-1">{">_"}</span>
                    <span>console</span>
                    <span className="ml-1 animate-blink">|</span>
                  </div>
                </div>

                <div
                  onClick={handleConsoleOpen}
                  className={`relative z-40 flex aspect-square w-10 cursor-pointer items-center justify-center overflow-hidden transition-all duration-300 ${terminalBgClass} ${terminalHoverClass}`}>
                  <SiGnometerminal
                    size="100%"
                    className={`h-full w-full transition-all duration-300 ${consoleOpen ? "rotate-90 scale-70" : ""}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden w-full px-10 pt-6 pb-6 sm:block">
          <div className="flex items-center">
            <div className="flex shrink-0 items-center gap-3">
              <div className="opacity-0 animate-[navbar-enter_0.65s_cubic-bezier(0.16,1,0.3,1)_0.1s_forwards]">
                <Link href="/" className="relative flex h-12 w-12 items-center justify-center">
                  <div className="relative h-full w-full overflow-hidden rounded-md">
                    <NavbarLogo />
                  </div>
                </Link>
              </div>

              <nav
                aria-label="Desktop Navigation"
                className="flex gap-1 opacity-0 animate-[navbar-enter_0.6s_ease-out_0.2s_forwards]">
                {navItems.map((item, i) => (
                  <GlitchNavItem
                    key={item.label}
                    href={item.href}
                    label={item.label}
                    active={pathname === item.href}
                    delay={200 + i * 120}
                    theme={theme}
                  />
                ))}
              </nav>
            </div>

            <div
              className={`relative mx-6 hidden w-230 overflow-hidden border-l opacity-0 animate-[navbar-enter_0.6s_ease-out_0.3s_forwards] sm:block ${
                isDark || isMetal ? "border-white/20" : "border-black/20"
              }`}>
              <div
                className={`pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-linear-to-r to-transparent ${marqueeFadeLeft}`}
              />

              <div
                className={`pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-linear-to-l to-transparent ${marqueeFadeRight}`}
              />

              <div className="absolute right-0 top-0 z-20 flex h-full">
                <div className={`w-0.5 ${marqueeDiv1}`} />
                <div className={`w-1.25 ${marqueeDiv2}`} />
              </div>

              <div className="relative w-full overflow-hidden">
                {isTier2 ? (
                  <></>
                ) : (
                  <div className="flex w-max animate-marquee">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="flex whitespace-nowrap py-2 text-[12px] uppercase tracking-tight">
                        <span className="mx-6">Full Stack Developer — 4+ Years Building Production Systems</span>
                        <span className="mx-6">MERN Stack Architecture & Implementation</span>
                        <span className="mx-6">Scalable Backend Systems & API Design</span>
                        <span className="mx-6">Dockerized Workflows & Containerization</span>
                        <span className="mx-6">Performance Optimization & Reliability</span>
                        <span className="mx-6">End-to-End Feature Ownership</span>
                        <span className="mx-6">Clean UI Systems & Interaction Design</span>
                        <span className="mx-6">Shipping Fast, Stable Code</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mr-5 mt-2">
              <ModeSwitch />
            </div>

            <div className="relative ml-auto flex min-w-40 shrink-0 items-center justify-end gap-3 opacity-0 animate-[navbar-enter_0.6s_ease-out_0.4s_forwards]">
              <button
                onClick={handleConsoleOpen}
                className={`absolute right-0 top-0 z-50 flex h-full items-center overflow-hidden px-4 text-[11px] transition-all duration-300 ease-out ${
                  consoleOpen ? "w-60 opacity-100" : "pointer-events-none w-0 opacity-0"
                } ${consoleSlideClass}`}>
                <span className="mr-2">{">_"}</span>
                <span className="whitespace-nowrap uppercase tracking-wide">console</span>
                <span className="ml-1 animate-blink">|</span>
                <span className="ml-2 whitespace-nowrap uppercase tracking-wide opacity-60">run command</span>
              </button>

              <div
                className={`hidden w-full text-right text-[10px] uppercase leading-tight tracking-widest transition-opacity duration-300 sm:block ${
                  consoleOpen ? "opacity-0" : "opacity-100"
                }`}>
                <div className="font-bold">
                  AKHIL SHETTY M <span className="font-light">, IN</span>
                </div>

                <div>{time || "—:—:— --"}</div>

                {!isTier2 && (
                  <div key={ip} className={`text-[8px] font-semibold uppercase tracking-[0.2em] ${textMutedClass}`}>
                    connection
                    <span className="inline-block w-25 text-right"> {ip}</span>
                  </div>
                )}
              </div>

              <div
                onClick={handleConsoleOpen}
                className={`relative z-40 flex aspect-square w-10 cursor-pointer items-center justify-center overflow-hidden transition-all duration-300 ${terminalBgClass} ${terminalHoverClass}`}>
                <SiGnometerminal
                  size="100%"
                  className={`h-full w-full transition-all duration-300 ${consoleOpen ? "rotate-90 scale-70" : ""}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConsoleModal isOpen={consoleOpen} onClose={() => setConsoleOpen(false)} />
    </>
  );
};

export default memo(Navbar);
