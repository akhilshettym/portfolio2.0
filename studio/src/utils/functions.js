import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { RiTimeZoneLine } from "react-icons/ri";
import { VscRemoteExplorer } from "react-icons/vsc";
import { CHARS, CLAMP, EASEOUTEXPO, ERRORBITS, LERP, SAMPLES } from "@/utils/basic";

export const goToTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
};

export function getCardState(progress, index) {
  const enterStart = 0.08 + index * 0.08;
  const enterEnd = 0.24 + index * 0.08;

  const reverseIndex = 3 - index;
  const exitStart = 0.68 + reverseIndex * 0.05;
  const exitEnd = 0.82 + reverseIndex * 0.05;

  const rawEnter = CLAMP((progress - enterStart) / (enterEnd - enterStart), 0, 1);
  const rawExit = CLAMP((progress - exitStart) / (exitEnd - exitStart), 0, 1);

  const enterT = EASEOUTEXPO(rawEnter);
  const exitT = EASEOUTEXPO(rawExit);

  const positions = [
    { x: -360, y: 0, rotate: -10 },
    { x: -120, y: -10, rotate: -3 },
    { x: 120, y: 10, rotate: -8 },
    { x: 360, y: 0, rotate: 5 },
  ];

  const final = positions[index];
  const x = LERP(0, final.x, enterT);

  const enteredY = LERP(480, final.y, enterT);
  const exitedY = LERP(final.y, final.y - 520, exitT);
  const y = rawExit > 0 ? exitedY : enteredY;

  const scaleIn = LERP(0.82, 1, enterT);
  const scaleOut = LERP(1, 0.92, exitT);
  const scale = scaleIn * scaleOut;

  const opacity = LERP(0, 1, enterT) * LERP(1, 0, exitT);
  const rotate = LERP(0, final.rotate, enterT);
  const blur = rawExit > 0 ? LERP(0, 18, exitT) : LERP(22, 0, enterT);

  return { x, y, scale, opacity, rotate, blur, rawExit };
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function useBodyLock(lock = true) {
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevTouch = document.body.style.touchAction;
    if (lock) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    }
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouch;
    };
  }, [lock]);
}

export function useWheelDeck(onDown, onUp, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;

    const handleWheel = (e) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) < 2) return;
      if (e.deltaY > 0) onDown?.();
      if (e.deltaY < 0) onUp?.();
    };

    let startY = 0;
    const handleTouchStart = (e) => {
      startY = e.touches?.[0]?.clientY ?? 0;
    };
    const handleTouchMove = (e) => {
      e.preventDefault();
      const currentY = e.touches?.[0]?.clientY ?? 0;
      const delta = startY - currentY;
      if (Math.abs(delta) < 12) return;
      if (delta > 0) onDown?.();
      if (delta < 0) onUp?.();
      startY = currentY;
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [onDown, onUp, enabled]);
}

export function CurtainText({ children, delay = 0, className = "" }) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: "108%", opacity: 0 }}
        animate={{ y: "0%", opacity: 1 }}
        transition={{ duration: 0.9, delay, ease: [0.77, 0, 0.175, 1] }}>
        {children}
      </motion.div>
    </div>
  );
}

function GlitchText({ children, className = "" }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="glitch-layer glitch-layer-a"> {children} </span>
      <span className="glitch-layer glitch-layer-b"> {children} </span>
      <span className="relative z-10"> {children} </span>
    </span>
  );
}

export function CodeRain({ active }) {
  const [lines, setLines] = useState([]);

  useEffect(() => {
    if (!active) return undefined;

    const id = setInterval(() => {
      setLines((prev) => {
        const next = [
          ...prev,
          {
            id: crypto.randomUUID(),
            text: SAMPLES[Math.floor(Math.random() * SAMPLES.length)],
            x: Math.random() * 90 + 2,
            y: Math.random() * 100,
            delay: Math.random() * 0.6,
          },
        ];

        return next.slice(-42);
      });
    }, 110);

    return () => clearInterval(id);
  }, [active]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_40%)]" />
      {active &&
        lines.map((line, idx) => (
          <motion.div
            key={line.id}
            initial={{ opacity: 0, y: 22, filter: "blur(8px)" }}
            animate={{ opacity: 0.9, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.22, delay: line.delay }}
            className="absolute font-mono text-[10px] leading-none tracking-[0.28em] text-white/75 md:text-[11px]"
            style={{
              left: `${line.x}%`,
              top: `${line.y}%`,
              transform: `translate(-50%, -50%) rotate(${(idx % 5) - 2}deg)`,
            }}>
            {line.text}
          </motion.div>
        ))}
    </div>
  );
}

export function GlitchField({ active, seed }) {
  const [tick, setTick] = useState(0);

  const glitchPositions = ERRORBITS.map((_, i) => {
    const seedNum = (seed || 1) * (i + 1);

    return {
      xShift: ((seedNum * 13) % 20) - 10,
      yShift: ((seedNum * 7) % 8) - 4,
      useGlitch: seedNum % 4 === 0,
      left: `${5 + ((i * 11) % 80)}%`,
      top: `${10 + ((i * 12) % 75)}%`,
    };
  });

  useEffect(() => {
    if (!active) return;

    const delay = 350 + Math.random() * 400;

    const id = setInterval(() => {
      if (Math.random() > 0.4) {
        setTick((t) => t + 1);
      }
    }, delay);

    return () => clearInterval(id);
  }, [active]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        animate={{ opacity: tick % 7 === 0 ? [0, 0.18, 0] : 0 }}
        transition={{ duration: 0.08 }}
        className="absolute inset-0 bg-white mix-blend-screen"
      />

      <div className="absolute inset-0 opacity-[0.035] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.15)_3px)]" />

      <motion.div
        key={`flash-${seed}-${tick}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.12, 0.04, 0], scale: [1, 1.02, 1] }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15),transparent_45%)] mix-blend-screen"
      />

      {ERRORBITS.map((bit, i) => {
        const config = glitchPositions[i];

        return (
          <motion.div
            key={`${bit}-${tick}-${i}`}
            initial={{ opacity: 0, x: i % 2 ? 120 : -120 }}
            animate={{
              opacity: [0, 0.8, 0.3],
              x: [0, config.xShift, 0],
              y: [0, config.yShift, 0],
            }}
            transition={{ duration: 0.18, delay: i * 0.03, ease: "linear" }}
            className="absolute font-mono text-[10px] uppercase tracking-[0.35em] text-white/70 md:text-[11px]"
            style={{ left: config.left, top: config.top }}>
            {config.useGlitch ? <GlitchText>{bit}</GlitchText> : bit}
          </motion.div>
        );
      })}
    </div>
  );
}

function BottomCurtain({ active }) {
  return (
    <motion.div
      initial={false}
      animate={
        active
          ? { width: "100vw", height: "100vh", borderRadius: 0, x: 0, y: 0 }
          : { width: "92vw", height: "88vh", borderRadius: 32, x: "4vw", y: 0 }
      }
      transition={{ duration: 1.05, ease: [0.77, 0, 0.175, 1] }}
      className="absolute bottom-0 left-0 bg-black"
      style={{ transformOrigin: "bottom center" }}
    />
  );
}

export function SceneShell({ dark, curtain = false, children }) {
  return (
    <div className={`relative h-screen w-full overflow-hidden ${dark ? "bg-black text-white" : "bg-white text-black"}`}>
      {curtain ? <BottomCurtain active /> : null}
      <div className={`absolute inset-0 ${dark ? "bg-black" : "bg-white"}`} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.08),transparent_40%)] opacity-40" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay bg-[linear-gradient(rgba(0,0,0,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.25)_1px,transparent_1px)] bg-size-[100%_100%,100%_100%]" />
      <div className="relative z-10 h-full w-full"> {children} </div>
    </div>
  );
}

export function SceneShell2({ dark, curtain = false, children }) {
  return (
    <div className={`relative h-screen w-full overflow-hidden ${dark ? "bg-black text-white" : "bg-white text-black"}`}>
      {curtain ? <BottomCurtain active /> : null}

      <div className={`absolute inset-0 z-0 ${dark ? "bg-black" : "bg-white"}`} />
      <div className="pointer-events-none absolute inset-0 z-1 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.08),transparent_40%)] opacity-40" />
      <div className="pointer-events-none absolute inset-0 z-2 opacity-[0.08] mix-blend-overlay bg-[linear-gradient(rgba(0,0,0,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.25)_1px,transparent_1px)] bg-size-[100%_100%,100%_100%]" />

      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}

/* GlitchText */
export function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

// ConsoleModal
export const logHero = () => (
  <div className="w-full max-w-4xl rounded-lg border border-emerald-500/20 bg-zinc-950 p-2 font-normal text-[10px] leading-relaxed text-emerald-500/90 shadow-2xl">
    <div className="whitespace-pre-wrap selection:bg-emerald-500 selection:text-zinc-950 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]">
      <span className="text-emerald-500 font-bold">$hero </span>
      {"\n"}root display terminal view matrix main screen... {"\n"}
      ------------------------------------------------{"\n"}
      <span className="text-white">
        Initializing environment subsystem... Here you can configure animated viewport layouts and manipulate real-time
        cloud vectors via the scene controller. Re-trigger the cinematic sequence, or fetch current lunar phases and
        predictive weather metrics.
      </span>
      <p className="text-[8px] text-neutral-500 leading-relaxed text-justify mt-1">
        - Terminate this terminal session to render the interactive app layer.
      </p>
    </div>
  </div>
);

export const logAbout = () => {
  return (
    <div className="w-full max-w-4xl rounded-lg border border-emerald-500/20 bg-zinc-950 p-2 font-normal text-[10px] leading-relaxed text-emerald-500/90 shadow-2xl">
      <div className="whitespace-pre-wrap selection:bg-emerald-500 selection:text-zinc-950 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]">
        <span className="text-emerald-500 font-bold">$about_me</span>
        <span className="text-white">
          <p className="leading-relaxed text-justify">
            {" "}
            I am a{" "}
            <span className="font-semibold">
              multidisciplinary creator engineering high-impact digital experiences
            </span>{" "}
            at the intersection of <span className="font-semibold">robust code and beautiful design</span>. My
            methodology is inherently, while intentionally bridging user psychology with comprehensive engineering
            strategy.{" "}
          </p>
          <p className="mt-1 leading-relaxed text-justify">
            {" "}
            I craft <span className="font-semibold">technical design solutions</span> that help forward-thinking brands
            truly differentiate. With over <span className="font-semibold">3-4 years of tech experience</span>, I
            specialize in designing beautiful software interfaces and transforming them into high-performing
            reality—spanning  <span className="font-semibold">frontend architectures</span>, comprehensive{" "}
            <span className="font-semibold">backend infrastructures</span>,{" "}
            <span className="font-semibold">headless CMS ecosystems</span>, automated{" "}
            <span className="font-semibold">CI/CD automation pipelines</span>, and specialized{" "}
            <span className="font-semibold">Salesforce CRM logic integrations</span>.{" "}
          </p>
          <p className="text-[8px] text-neutral-500 leading-relaxed text-justify mt-1">
            - Exit the terminal to unlock the full visual layout.
          </p>
        </span>
      </div>
    </div>
  );
};

export const logSkills = () => {
  return (
    <div className="w-full max-w-4xl rounded-lg border border-emerald-500/20 bg-zinc-950 p-2 font-normal text-[10px] leading-relaxed text-emerald-500/90 shadow-2xl">
      <div className="whitespace-pre-wrap selection:bg-emerald-500 selection:text-zinc-950 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]">
        <span className="text-emerald-500 font-bold">
          $skils <h3 className="text-neutral-100">Expertise & Capabilities</h3>
        </span>
      </div>

      <div className="mt-2 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
        {[
          { name: "Frontend Development", val: "90%", color: "bg-cyan-500", text: "text-cyan-400" },
          { name: "Backend Engineering", val: "80%", color: "bg-emerald-500", text: "text-emerald-400" },
          { name: "Fullstack Solutions", val: "85%", color: "bg-amber-500", text: "text-amber-400" },
          { name: "Mobile Applications", val: "75%", color: "bg-green-500", text: "text-green-400" },
          { name: "CMS Integration", val: "60%", color: "bg-sky-500", text: "text-sky-400" },
          { name: "Devops & CI/CD", val: "70%", color: "bg-purple-500", text: "text-purple-400" },
          { name: "Core Java", val: "65%", color: "bg-red-500", text: "text-red-400" },
        ].map((s, idx) => (
          <div key={idx}>
            <div className="flex justify-between text-white">
              <span>{s.name}</span>
              <span className={s.text}>{s.val}</span>
            </div>
            <div className="mt-1 h-1 w-full bg-neutral-900 rounded-full overflow-hidden">
              <div className={`h-full ${s.color}`} style={{ width: s.val }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 border-t border-neutral-800 pt-3">
        <p className="leading-relaxed text-neutral-400">
          <span className="text-neutral-200 font-semibold">Tools & Tech:</span> Core Java • JavaScript • Next.js • MySQL
          • TypeScript • Node.js • Express • Material UI • React • HTML/CSS • Figma • Git • GitHub • REST APIs
        </p>
        <p className="text-[8px] text-neutral-500 leading-relaxed text-justify mt-1">
          - Shut down this console window and dive into the full experience.
        </p>
      </div>
    </div>
  );
};

export const logAchievements = () => {
  return (
    <div className="w-full max-w-4xl rounded-lg border border-emerald-500/20 bg-zinc-950 p-2 font-normal text-[10px] leading-relaxed text-emerald-500/90 shadow-2xl">
      <div className="whitespace-pre-wrap selection:bg-emerald-500 selection:text-zinc-950 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]">
        <span className="text-emerald-500 font-bold">$achievements</span>
        <span className="text-emerald-400"> window down to achievements section...</span>
        <span className="text-white">
          <p className="leading-relaxed text-justify">
            Built upon a foundation of academic excellence and verified technical certifications, my journey is driven
            by continuous learning and leadership beyond the classrooms.
          </p>
          <p className="leading-relaxed text-justify">
            These experiences culminate in tangible impact highlights—milestones that showcase my ability to transform
            skills into meaningful, real-world differences.
          </p>
          <p className="text-[8px] text-neutral-500 leading-relaxed text-justify mt-1">
            - Dismiss this viewport to interface with the graphical matrix.
          </p>
        </span>
      </div>
    </div>
  );
};

export const logProjects = () => {
  return (
    <div className="w-full max-w-4xl rounded-lg border border-emerald-500/20 bg-zinc-950 p-2 font-normal text-[10px] leading-relaxed text-emerald-500/90 shadow-2xl">
      <div className="whitespace-pre-wrap selection:bg-emerald-500 selection:text-zinc-950 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]">
        <span className="text-emerald-500 font-bold">$projects/works</span>
        <span className="text-emerald-400"> window down to projects section...</span>
        <span className="text-white">
          <p className="leading-relaxed text-justify">
            A comprehensive index of recent, production-grade architectural executions. These systems bridge technical
            architecture with scalable solutions.
          </p>
          <p className="text-[8px] text-neutral-500 leading-relaxed text-justify mt-1">
            - Terminate this command console instance to unlock and explore the visual portfolio.Option{" "}
          </p>
        </span>
      </div>
    </div>
  );
};

export const logExperience = () => {
  return (
    <div className="w-full max-w-4xl rounded-lg border border-emerald-500/20 bg-zinc-950 p-2 font-normal text-[10px] leading-relaxed text-emerald-500/90 shadow-2xl">
      <div className="whitespace-pre-wrap selection:bg-emerald-500 selection:text-zinc-950 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]">
        <span className="text-emerald-500 font-bold">$experience</span>
        <span className="text-emerald-400"> window down to my experience section...</span>
        <span className="text-white">
          <p className="leading-relaxed text-justify">
            My professional trajectory bridges visual communication with robust technical execution.
          </p>
          <p className="leading-relaxed text-justify">
            I started my career as a graphic design intern, transitioned into an IT engineering internship, and am
            currently accelerating my growth as a technical IT trainee.
          </p>
          <p className="leading-relaxed text-justify">
            This cross-disciplinary foundation enables me to architect scalable solutions that balance backend system
            logic with user-centric digital design.
          </p>
          <p className="text-[8px] text-neutral-500 leading-relaxed text-justify mt-1">
            - Exit this active terminal session to initialize the graphical user interface.
          </p>
        </span>
      </div>
    </div>
  );
};

export const logGithub = () => {
  return (
    <div className="w-full max-w-4xl rounded-lg border border-emerald-500/20 bg-zinc-950 p-2 font-normal text-[10px] leading-relaxed text-emerald-500/90 shadow-2xl">
      <div className="whitespace-pre-wrap selection:bg-emerald-500 selection:text-zinc-950 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]">
        <span className="text-emerald-500 font-bold">$github</span>
        <span className="text-emerald-400"> window down to my github contributions section...</span>
        <span className="text-white">
          <a
            href="https://github.com/akhilshettym"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-500 hover:underline">
            {" "}
            github.com/akhilshettym ↗{" "}
          </a>
          <p className="leading-relaxed text-justify">
            Check out my public development tracks and open-source activities on GitHub. As for my work contributions —
            those are currently hiding in another dimension.
          </p>
          <p className="text-[8px] text-neutral-500 leading-relaxed text-justify mt-1">
            - Dismiss this terminal viewport to view my github activity
          </p>
        </span>
      </div>
    </div>
  );
};

export const logLinkedin = () => {
  return (
    <div className="w-full max-w-4xl rounded-lg border border-emerald-500/20 bg-zinc-950 p-2 font-normal text-[10px] leading-relaxed text-emerald-500/90 shadow-2xl">
      <div className="whitespace-pre-wrap selection:bg-emerald-500 selection:text-zinc-950 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]">
        <span className="text-emerald-500 font-bold">$linkedin</span>
        <span className="text-white">
          <a
            href="https://linkedin.com/in/akhilshettym"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-500 hover:underline">
            {" "}
            linkedin.com/in/akhilshettym ↗{" "}
          </a>
          <p className="leading-relaxed text-justify">
            Scan my professional network layout and career trajectory on LinkedIn. Corporate endorsements and executive
            handshakes are fully synchronized in this dimension.
          </p>
        </span>
      </div>
    </div>
  );
};

export const logInstagram = () => {
  return (
    <div className="w-full max-w-4xl rounded-lg border border-emerald-500/20 bg-zinc-950 p-2 font-normal text-[10px] leading-relaxed text-emerald-500/90 shadow-2xl">
      <div className="whitespace-pre-wrap selection:bg-emerald-500 selection:text-zinc-950 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]">
        <span className="text-emerald-500 font-bold">$instagram</span>
        <span className="text-white">
          <a
            href="https://www.instagram.com/akhil_shetty_m"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-500 hover:underline">
            {" "}
            instagram.com/akhil_shetty_m ↗{" "}
          </a>
          <p className="leading-relaxed text-justify">
            Deconstruct the visual lifestyle layers and creative asset snapshots on Instagram. Behind-the-scenes
            compiling processes and design aesthetics are rendering live.
          </p>
        </span>
      </div>
    </div>
  );
};

export const logMail = () => {
  return (
    <div className="w-full max-w-4xl rounded-lg border border-emerald-500/20 bg-zinc-950 p-2 font-normal text-[10px] leading-relaxed text-emerald-500/90 shadow-2xl">
      <div className="whitespace-pre-wrap selection:bg-emerald-500 selection:text-zinc-950 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]">
        <span className="text-emerald-500 font-bold">$mail</span>
        <span className="text-white">
          <a href="mailto:akhilshettym2003@gmail.com" className="text-cyan-400 hover:underline">
            {" "}
            akhilshettym2003@gmail.com ↗{" "}
          </a>
          <p className="leading-relaxed text-justify">
            Drop me a line or send over your project ideas via email. Don&apos;t worry—your message will bypass the
            security bots and land straight in my main inbox.
          </p>
        </span>
      </div>
    </div>
  );
};
export const logCreate = () => {
  return (
    <div className="w-full max-w-4xl rounded-lg border border-emerald-500/20 bg-zinc-950 p-2 font-normal text-[10px] leading-relaxed text-emerald-500/90 shadow-2xl">
      <div className="whitespace-pre-wrap selection:bg-emerald-500 selection:text-zinc-950 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]">
        <span className="text-emerald-500 font-bold">$connect/create_something</span>
        <span className="text-white">
          <p className="leading-relaxed text-justify">
            Whether you have an exciting project idea, want to collaborate on something cool, or just want to say a
            quick hi, my inbox is always open.
          </p>
          <p className="leading-relaxed text-justify">
            Feel free to drop a message whenever inspiration strikes. No stiff corporate filters here—your note goes
            straight to my main screen.
          </p>
          <p className="text-[8px] text-neutral-500 leading-relaxed text-justify mt-1">
            - Close this console window to view the interface.
          </p>
        </span>
      </div>
    </div>
  );
};

export const logPhilosophy = () => {
  return (
    <div className="w-full max-w-4xl rounded-lg border border-emerald-500/20 bg-zinc-950 p-2 font-normal text-[10px] leading-relaxed text-emerald-500/90 shadow-2xl">
      <div className="whitespace-pre-wrap selection:bg-emerald-500 selection:text-zinc-950 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]">
        <span className="text-emerald-500 font-bold">$my_philosophy</span>
        <span className="text-white">
          <p className="text-slate-200 eading-relaxed text-justify">{`"If it does not remove user overhead, it does not belong in production."`}</p>
          <div className="leading-relaxed text-justify">
            <ul className="space-y-2">
              <li>
                <strong className="text-slate-200">Data Over Guesswork:</strong> Building code based on actual math and
                analytics, not just hunks of wishful thinking.
              </li>
              <li>
                <strong className="text-slate-200">Smart Blueprinting:</strong> Crafting clean, reusable hooks and
                components to cut down build times across every device.
              </li>
              <li>
                <strong className="text-slate-200">Real Impact First:</strong> Focusing heavily on raw technical
                execution and scalability, because pretty styling doesn&apos;t mean much if the app runs slow.
              </li>
            </ul>
          </div>
        </span>
      </div>
    </div>
  );
};

export const logSalesforce = () => {
  return (
    <div className="w-full max-w-4xl rounded-lg border border-emerald-500/20 bg-zinc-950 p-2 font-normal text-[10px] leading-relaxed text-emerald-500/90 shadow-2xl">
      <div className="whitespace-pre-wrap selection:bg-emerald-500 selection:text-zinc-950 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]">
        <span className="text-emerald-500 font-bold">$salesforce_trailhead</span>
        <span className="text-emerald-400"> window down to my salesforce trailhead section...</span>
        <span className="text-white">
          <a
            href="https://www.salesforce.com/trailblazer/akhilshettym"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-500 hover:underline">
            {" "}
            salesforce.com/trailblazer/akhilshettym ↗{" "}
          </a>
          <p className="leading-relaxed text-justify">
            Check out my public learning tracks, earned badges, and rank progression on Trailhead. Keeping my Salesforce
            skills sharp and verified directly on the platform.Option
          </p>
          <p className="text-[8px] text-neutral-500 leading-relaxed text-justify mt-1">
            - Exit the terminal to unlock the full visual layout.
          </p>
        </span>
      </div>
    </div>
  );
};

export const logMySocials = () => {
  return (
    <div className="w-full max-w-4xl rounded-lg border border-emerald-500/20 bg-zinc-950 p-2 font-normal text-[10px] leading-relaxed text-emerald-500/90 shadow-2xl">
      {" "}
      <div className="whitespace-pre-wrap selection:bg-emerald-500 selection:text-zinc-950 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]">
        <span className="text-emerald-500 font-bold">$my_socials</span>
        <span className="text-emerald-400"> window down to my socials section...</span>
        <span className="text-white">
          <p className="leading-relaxed text-justify">
            Here&apos;s my socials just to get an idea. Move your cursor around this section to reveal snapshots of what
            I&apos;ve been up to lately. The mouse trail leaves behind a visual history of my favorite projects and
            moments, so feel free to wander around and explore.
          </p>
          <p className="text-[8px] text-neutral-500 leading-relaxed text-justify mt-1">
            - Shut down this console window and dive into the full experience.
          </p>
        </span>
      </div>
    </div>
  );
};

export const logSocials = () => {
  return (
    <div className="w-full max-w-4xl rounded-lg border border-emerald-500/20 bg-zinc-950 p-2 font-normal text-[10px] leading-relaxed text-emerald-500/90 shadow-2xl">
      <div className="whitespace-pre-wrap selection:bg-emerald-500 selection:text-zinc-950 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]">
        <div>
          <span className="inline-block w-20 text-emerald-500 font-bold">$mail</span>
          <a href="mailto:akhilshettym2003@gmail.com" className="text-cyan-400 hover:underline">
            akhilshettym2003@gmail.com ↗
          </a>
        </div>
        <div>
          <span className="inline-block w-20 text-emerald-500 font-bold">$instagram</span>
          <a
            href="https://www.instagram.com/akhil_shetty_m"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-500 hover:underline">
            instagram.com/akhil_shetty_m ↗
          </a>
        </div>
        <div>
          <span className="inline-block w-20 text-emerald-500 font-bold">$github</span>
          <a
            href="https://github.com/akhilshettym"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-500 hover:underline">
            github.com/akhilshettym ↗
          </a>
        </div>
        <div>
          <span className="inline-block w-20 text-emerald-500 font-bold">$salesforce</span>
          <a
            href="https://www.salesforce.com/trailblazer/akhilshettym"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-500 hover:underline">
            salesforce.com/akhilshettym ↗
          </a>
        </div>
        <div>
          <span className="inline-block w-20 text-emerald-500 font-bold">$linkedin</span>
          <a
            href="https://linkedin.com/in/akhilshettym"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-500 hover:underline">
            linkedin.com/in/akhilshettym ↗
          </a>
        </div>
        <p className="text-[8px] text-neutral-500 leading-relaxed text-justify mt-1">
          - Since your system is currently running in a performance-optimized tier, the standard social view will be
          replaced with this lightweight version to guarantee a fluid interface.
        </p>
      </div>
    </div>
  );
};

export const logSudoHire = () => {
  return (
    <div className="w-full max-w-full bg-black border border-slate-800 rounded-md p-3.5 font-mono text-[11px] leading-relaxed">
      <div className="text-slate-400">
        [sudo] password for visitor: <span className="text-slate-700">********</span>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 mt-1">
        <span className="text-emerald-500 font-medium">✓ System Authentication successful.</span>
      </div>
      <div className="mt-2 border-t border-zinc-900 pt-3 font-mono text-[12px] text-zinc-300">
        <div className="flex items-center gap-2 text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]">
          <span>&gt; Deploying contract payload...</span>
          <span className="font-bold">[████████████████████] 100%</span>
        </div>
        <p className="mt-1 font-semibold text-white">✦ Connection established! Transmission complete.</p>
        <p className="mt-2 text-[11px] text-zinc-500 italic">
          (Or, you know, skip the matrix and just email{" "}
          <a href="mailto:akhilshettym2003@gmail.com" className="text-cyan-400 hover:underline">
            akhilshettym2003@gmail.com
          </a>
          )
        </p>
      </div>
    </div>
  );
};

export const logrmrf = () => {
  return (
    <div className="w-full max-w-4xl rounded-lg border border-emerald-500/20 bg-zinc-950 p-2 font-normal text-[10px] leading-relaxed text-emerald-500/90 shadow-2xl">
      <div className="whitespace-pre-wrap selection:bg-emerald-500 selection:text-zinc-950 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]">
        <span className="text-emerald-500 font-bold">$rm -rf doubts</span>
        <span className="text-white">
          <p className="leading-relaxed text-justify">
            <span className="font-semibold">Removing local/ambiguity... done{"\n"}</span>
            <span className="font-semibold">Removing local/impostor-syndrome... done{"\n"}</span>
            <span className="font-semibold">Removing project/delivery-risk... done{"\n"}</span>
            <span className="font-semibold text-emerald-400">
              ✦ Workspace stack cleared. Ready to start building together.
            </span>
          </p>
        </span>
      </div>
    </div>
  );
};

export const logCoffee = () => {
  return (
    <div className="w-full max-w-4xl rounded-lg border border-emerald-500/20 bg-zinc-950 p-2 font-normal text-[10px] leading-relaxed text-emerald-500/90 shadow-2xl">
      <div className="whitespace-pre-wrap selection:bg-emerald-500 selection:text-zinc-950 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]">
        <span className="text-emerald-500 font-bold">
          {"( ( ) )\n........\n| |] \\ /\n`----´"}
          {"\n"}
        </span>
        <span className="text-white">
          <span>Design fuel level:</span>
          <span className="text-emerald-400">[████████████████░░░░] 80%{"\n"}</span>
          <span>
            Status: <span className="text-emerald-400">Caffeinated and pixel-pushing</span>
            {"\n"}
          </span>
          <span>
            Daily intake: <span className="text-emerald-400">Yes</span>
          </span>
        </span>
      </div>
    </div>
  );
};

export const logCatReadme = () => {
  return (
    <div className="w-full max-w-4xl rounded-lg border border-emerald-500/20 bg-zinc-950 p-2 font-normal text-[10px] leading-relaxed text-emerald-500/90 shadow-2xl">
      <div className="whitespace-pre-wrap selection:bg-emerald-500 selection:text-zinc-950 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]">
        <span className="text-emerald-500 font-bold">$cat readme.md</span>
        <span className="text-white">
          <p className="text-slate-200 font-medium">Welcome to the inner shell layer.</p>
          <p className="leading-relaxed text-justify">
            <span className="font-semibold">
              I believe design isn&apos;t skin-deep decoration; it&apos;s structural optimization. Good code elements
              disappear cleanly into the user experience framework, helping consumers convert decisions instantly.{"\n"}
            </span>
            <span className="font-semibold">
              The web is saturated with concepts that never reach compilation. I focus completely on shipping clean
              production components.{"\n"}
            </span>
          </p>
        </span>
      </div>
    </div>
  );
};

export const logPingAkhil = () => {
  return (
    <div className="w-full max-w-4xl rounded-lg border border-emerald-500/20 bg-zinc-950 p-2 font-normal text-[10px] leading-relaxed text-emerald-500/90 shadow-2xl">
      <div className="whitespace-pre-wrap selection:bg-emerald-500 selection:text-zinc-950 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]">
        <span className="text-emerald-500 font-bold">$ping akhil</span>
        <span className="text-white">
          <p className="text-slate-200 font-medium">ping akhil_shetty_m.mumbai (192.168.1.337): 56 data bytes</p>
          <p className="leading-relaxed text-justify">
            <span className="font-semibold">64 bytes from local.network: icmp_seq=0 ttl=64 time=0.1ms </span>
            <span className="text-emerald-400 ml-2">— Network connection fully established</span>
          </p>
          <p className="leading-relaxed text-justify">
            <span className="font-semibold">64 bytes from local.network: icmp_seq=1 ttl=64 time=0.2ms </span>
            <span className="text-emerald-400 ml-2">— System ready for contract modules</span>
          </p>
          <p className="leading-relaxed text-justify">
            <span className="font-semibold">64 bytes from local.network: icmp_seq=2 ttl=64 time=0.1ms </span>
            <span className="text-emerald-400 ml-2">— Engineering response cycles optimized</span>
          </p>
        </span>
        <div className="mt-2 border-t border-slate-900 text-slate-500">
          <div>--- network statistics ---</div>
          <div className="text-slate-400 mt-0.5">
            3 packets transmitted, 3 received, <span className="text-emerald-500">0% packet loss</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const logSecrets = () => {
  return (
    <div className="w-full max-w-4xl rounded-lg border border-emerald-500/20 bg-zinc-950 p-4 font-mono text-[11px] leading-relaxed text-emerald-400/90 shadow-2xl">
      <div className="mb-3 flex items-center justify-between border-b border-emerald-500/20 pb-2 text-[10px] text-emerald-500/50 select-none">
        <span>SYSTEM_DECRYPT // HIDDEN_ENVIRONMENT_VARIABLES</span>
        <span>TTY3</span>
      </div>
      <div className="whitespace-pre-wrap selection:bg-emerald-500 selection:text-zinc-950 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]">
        <div className="mb-2">
          <span className="text-emerald-500 font-bold">$cat secrets.db</span>
          <span className="text-amber-400 ml-2">shhh... you found the cheat sheet....</span>
        </div>

        <div className="mb-2">
          <h4 className="text-emerald-300 font-bold mb-2 uppercase tracking-wider text-[10px] border-b border-emerald-500/10 pb-0.5 max-w-max">
            {"// Hidden Commands"}
          </h4>
          <div className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-1 text-zinc-400">
            <span className="text-zinc-500 font-bold">sudo hire akhil</span>
            <span>fake contract with progress bar</span>

            <span className="text-zinc-500 font-bold">rm -rf doubts</span>
            <span>remove all your doubts</span>

            <span className="text-zinc-500 font-bold">/coffee</span>
            <span>design fuel status</span>

            <span className="text-zinc-500 font-bold">ls</span>
            <span>skills as Linux files</span>

            <span className="text-zinc-500 font-bold">cat readme.md</span>
            <span>a hidden personal message</span>

            <span className="text-zinc-500 font-bold">ping akhil</span>
            <span>am I available? find out</span>

            <span className="text-zinc-500 font-bold">whoami</span>
            <span>the terminal knows you</span>

            <span className="text-zinc-500 font-bold">exit</span>
            <span>try to leave. I dare you.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const logWhoAmI = () => {
  return (
    <div className="w-full max-w-4xl rounded-lg border border-emerald-500/20 bg-zinc-950 p-2 font-normal text-[10px] leading-relaxed text-emerald-500/90 shadow-2xl">
      <div className="whitespace-pre-wrap selection:bg-emerald-500 selection:text-zinc-950 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]">
        <span className="text-emerald-500 font-bold">$whoami</span>
        <span className="text-white">
          <p className="text-slate-200 font-medium">You&apos;re the person about to hire a great designer.</p>
          <p className="leading-relaxed text-justify">
            <span className="text-slate-500">(Trust the terminal. It knows things.)</span>
          </p>
        </span>
      </div>
    </div>
  );
};

export const logLocation = () => {
  return (
    <div className="w-full max-w-4xl rounded-lg border border-emerald-500/20 bg-zinc-950 p-2 font-normal text-[10px] leading-relaxed text-emerald-500/90 shadow-2xl">
      <div className="whitespace-pre-wrap selection:bg-emerald-500 selection:text-zinc-950 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]">
        <span className="text-emerald-500 font-bold">$location</span>
        <span className="text-white">
          <p className="text-slate-200 font-medium">get coordinates: 64 bits</p>
          <p className="flex items-center gap-1.5 leading-relaxed">
            <span className="text-slate-500">Coordinates:</span>
            <span className="inline-flex items-center gap-1 text-slate-200">
              <FaLocationDot /> Mumbai, Maharashtra, India
            </span>
          </p>

          <p className="flex items-center gap-1.5 leading-relaxed">
            <span className="text-slate-500">Availability:</span>
            <span className="inline-flex items-center gap-1 text-slate-200">
              <VscRemoteExplorer /> Remote Operations World-Wide
            </span>
          </p>

          <p className="flex items-center gap-1.5 leading-relaxed">
            <span className="text-slate-500">Timezone Context:</span>
            <span className="inline-flex items-center gap-1 text-slate-200">
              <RiTimeZoneLine /> GMT +5:30 (IST)
            </span>
          </p>
        </span>
      </div>
    </div>
  );
};

export const logls = () => {
  return (
    <div className="w-full max-w-4xl rounded-lg border border-emerald-500/20 bg-zinc-950 p-2 font-normal text-[10px] leading-relaxed text-emerald-500/90 shadow-2xl">
      <div className="whitespace-pre-wrap selection:bg-emerald-500 selection:text-zinc-950 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]">
        <span className="text-emerald-500 font-bold">$ls</span>
        <span className="text-white">
          <p className="leading-relaxed text-justify">
            <span className="text-slate-500">drwxr-xr-x user staff 128B 19 20:30 design-systems.conf{"\n"}</span>
            <span className="text-slate-500">drwxr-xr-x user staff 256B 23 20:30 frontend-architecture.cfg{"\n"}</span>
            <span className="text-slate-500">-rwxr-xr-x user staff 4.2K 09 20:30 production-scaling.bin{"\n"}</span>
            <span className="text-slate-500">-rw-r--r-- user staff 912B 12 20:30 fullstack-matrix.json{"\n"}</span>
            <span className="text-slate-500">-rw-r--r-- user staff 1.4K 29 20:30 accessibility-wcag.a11y</span>
          </p>
        </span>
      </div>
    </div>
  );
};

export const logPrivacy = () => {
  return (
    <div className="w-full max-w-4xl rounded-lg border border-emerald-500/20 bg-zinc-950 p-2 font-normal text-[10px] leading-relaxed text-emerald-500/90 shadow-2xl">
      <div className="whitespace-pre-wrap selection:bg-emerald-500 selection:text-zinc-950 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]">
        <span className="text-emerald-500 font-bold">$/privacy</span>
        <span className="text-emerald-400"> window down to my privacy policy and cookies section...</span>
        <span className="text-white">
          <p className="leading-relaxed text-justify">
            Full disclosure regarding active data packets, local cookies, and telemetry analytics captured exclusively
            to optimize system performance and refine user interactions
          </p>
          <p className="text-[8px] text-neutral-500 leading-relaxed text-justify mt-1">
            - Dismiss this terminal viewport to view privacy policy
          </p>
        </span>
      </div>
    </div>
  );
};

export const logHelp = () => {
  return (
    <div className="w-full max-w-4xl rounded-lg border border-emerald-500/20 bg-zinc-950 p-4 font-mono text-[11px] leading-relaxed text-emerald-400/90 shadow-2xl">
      <div className="mb-2 flex items-center justify-between border-b border-emerald-500/20 pb-2 text-[10px] text-emerald-500/50 select-none">
        <span>SYSTEM_HELP // COMMAND_INTERFACE_INDEX</span>
        <span>TTY4</span>
      </div>
      <div className="space-y-4 selection:bg-emerald-500 selection:text-zinc-950 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]">
        <div>
          <span className="text-emerald-500 font-bold">$/help</span>
          <span className="text-emerald-500/70 ml-2">system command line interface...</span>
        </div>
        <div>
          <h4 className="text-emerald-500/60 tracking-wider text-[10px] border-b border-emerald-500/10 pb-0.5 max-w-max mb-1">
            {"// navigations"}
          </h4>
          <div className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-0.5 text-zinc-400">
            <span className="text-cyan-400 font-medium">/hero</span>
            <span>Root display terminal view matrix main screen</span>

            <span className="text-cyan-400 font-medium">/about</span>
            <span>Print biographical & focus data metrics</span>

            <span className="text-cyan-400 font-medium">/skills</span>
            <span>Expertise & capabilities</span>

            <span className="text-cyan-400 font-medium">/achievements</span>
            <span>List historic and modern work timelines</span>

            <span className="text-cyan-400 font-medium">/socials</span>
            <span>Social profiles & links</span>

            <span className="text-cyan-400 font-medium">/projects</span>
            <span>Featured projects and deployments</span>

            <span className="text-cyan-400 font-medium">/experience</span>
            <span>My professional trajectories</span>

            <span className="text-cyan-400 font-medium">/github</span>
            <span>My github contributions</span>

            <span className="text-cyan-400 font-medium">/salesforce</span>
            <span>Salesforce skills and learning paths</span>

            <span className="text-cyan-400 font-medium">/philosophy</span>
            <span>My design philosophy</span>

            <span className="text-cyan-400 font-medium">/privacy</span>
            <span>Privacy policy & cookies</span>

            <span className="text-cyan-400 font-medium">/connect</span>
            <span>Get in touch</span>

            <span className="text-cyan-400 font-medium">/hire</span>
            <span>sudo hire akhil</span>

            <span className="text-cyan-400 font-medium">/clear</span>
            <span>Clear the terminal</span>
          </div>
        </div>

        <div>
          <h4 className="text-emerald-500/60 uppercase tracking-wider text-[10px] border-b border-emerald-500/10 pb-0.5 max-w-max mb-1.5">
            {"// Quick Info"}
          </h4>
          <div className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-0.5 text-zinc-400">
            <span className="text-cyan-400 font-medium">/linkedin</span>
            <span>LinkedIn profile</span>

            <span className="text-cyan-400 font-medium">/instagram</span>
            <span>Instagram profile</span>

            <span className="text-cyan-400 font-medium">/mail</span>
            <span>Email address</span>

            <span className="text-cyan-400 font-medium">/location</span>
            <span>Where I&apos;m based</span>
          </div>
        </div>

        <div className="space-y-1 pt-2 border-t border-emerald-500/10 text-[10px] text-zinc-500">
          <p>
            <span className="text-emerald-500/50 font-bold">aliases:</span> sudo hire akhil, /work, whoami, /hire, ping
            akhil, rm -rf doubts, close.
          </p>
          <p className="italic">
            Tip: Use ↑↓ arrows for command history ...and a few others, if you know where to look.
          </p>
          <p className="text-amber-500/70 font-semibold mt-1">
            Type <span className="underline hover:text-amber-400 cursor-pointer">/secrets</span> if you like finding
            hidden things.
          </p>
        </div>
      </div>
    </div>
  );
};
