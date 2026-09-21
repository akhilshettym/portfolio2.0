import { FaFileAlt } from "react-icons/fa";
import { IoIosMail } from "react-icons/io";
import { SiLeetcode } from "react-icons/si";
import { BsPassportFill } from "react-icons/bs";
import { FaInstagram, FaGithub, FaLinkedin, FaSalesforce } from "react-icons/fa6";
import {
  TiWeatherCloudy,
  TiWeatherNight,
  TiWeatherPartlySunny,
  TiWeatherShower,
  TiWeatherStormy,
  TiWeatherSunny,
} from "react-icons/ti";
import {
  WiMoonAltNew,
  WiMoonAltWaxingCrescent3,
  WiMoonAltFirstQuarter,
  WiMoonAltFull,
  WiMoonAltWaxingGibbous3,
  WiMoonAltWaningGibbous3,
  WiMoonAltThirdQuarter,
  WiMoonAltWaningCrescent3,
} from "react-icons/wi";

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const WORDS = [
  "CORE JAVA",
  "DATA STRUCTURES",
  "MERN STACK",
  "VERSION CONTROL",
  "SALESFORCE",
  "API INTEGRATIONS",
  "FRAMEWORKS",
  "ARCHITECTURES",
  "DEPLOYMENT",
];

export const DEV_TICKERS_TIER = [
  "BUILD STATUS — STABLE + ",
  "API RESPONSE 124ms + ",
  "DEPLOYMENT SYNCHRONIZED + ",
  "CACHE HIT RATE 92% + ",
  "EDGE FUNCTIONS ACTIVE + ",
  "AUTH SERVICE HEALTHY + ",
  "CI/CD PIPELINE PASSING + ",
  "REQUEST LOAD NORMAL + ",
  "SCALABLE SYSTEM DESIGN + ",
  "THREE.JS RENDER LOOP ACTIVE + ",
  "NEXT.JS APP ROUTER READY + ",
  "PRODUCTION BUILD OPTIMIZED + ",
  "INTERACTIVE UI SYSTEMS + ",
  "REAL-TIME MOTION ENGINE + ",
  "DATABASE CONNECTION SECURE + ",
  "PERFORMANCE SCORE — HIGH + ",
  "TYPE-SAFE APPLICATION LAYER + ",
  "FULL STACK ARCHITECTURE + ",
  "SYSTEM LATENCY WITHIN RANGE + ",
  "SHIPPING RELIABLE EXPERIENCES + ",
];

export const DEV_TICKERS = [
  "BUILD STATUS — STABLE",
  "API RESPONSE 124ms",
  "DEPLOYMENT SYNCHRONIZED",
  "CACHE HIT RATE 92%",
  "EDGE FUNCTIONS ACTIVE",
  "AUTH SERVICE HEALTHY",
  "CI/CD PIPELINE PASSING",
  "REQUEST LOAD NORMAL",
  "SCALABLE SYSTEM DESIGN",
  "THREE.JS RENDER LOOP ACTIVE",
  "NEXT.JS APP ROUTER READY",
  "PRODUCTION BUILD OPTIMIZED",
  "INTERACTIVE UI SYSTEMS",
  "REAL-TIME MOTION ENGINE",
  "DATABASE CONNECTION SECURE",
  "PERFORMANCE SCORE — HIGH",
  "TYPE-SAFE APPLICATION LAYER",
  "FULL STACK ARCHITECTURE",
  "SYSTEM LATENCY WITHIN RANGE",
  "SHIPPING RELIABLE EXPERIENCES",
];

export const TEXTURE_PATHS = [
  "animate",
  "css",
  "docker",
  "expressjs",
  "figma",
  "firebase",
  "git",
  "github",
  "html",
  "java",
  "javascript",
  "jest",
  "kubernetes",
  "nextjs",
  "nodejs",
  "reactjs",
  "salesforce",
  "sql",
  "tailwind",
  "tedx",
  "threejs",
  "vscode",
  "redux",
];

export const FADEUP = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  viewport: { once: true, amount: 0.15 },
};

export const CLAMP = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

export const LERP = (from, to, t) => {
  return from + (to - from) * t;
};

export const EASEOUTEXPO = (t) => {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

export const WEATHER_CODES = {
  CLEAR: [0, 1, 2, 3],
  MIST: [45, 48],
  RAIN: [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82],
  SNOW: [71, 73, 75, 77, 85, 86],
  STORM: [95, 96, 99],
};

export const CACHE_TTL_MS = 15 * 60 * 1000;

export const RADII = [
  1, 0.6, 0.8, 0.4, 0.9, 0.7, 0.9, 0.3, 0.2, 0.5, 0.6, 0.4, 0.5, 0.6, 0.7, 0.3, 0.4, 0.8, 0.7, 0.5, 0.4, 0.6, 0.35,
  0.38, 0.9, 0.3, 0.6, 0.4, 0.2, 0.35, 0.5, 0.15, 0.2, 0.25, 0.4, 0.8, 0.76, 0.8, 1, 0.8, 0.7, 0.8, 0.3, 0.5, 0.6, 0.55,
  0.42, 0.75, 0.66, 0.6, 0.7, 0.5, 0.6, 0.35, 0.35, 0.35, 0.8, 0.6, 0.7, 0.8, 0.4, 0.89, 0.3, 0.3, 0.6, 0.4, 0.2, 0.52,
  0.5, 0.15, 0.2, 0.25, 0.4, 0.8, 0.76, 0.8, 1, 0.8, 0.7, 0.8, 0.3, 0.5, 0.6, 0.8, 0.7, 0.75, 0.66, 0.6, 0.7, 0.5, 0.6,
  0.35, 0.35, 0.35, 0.8, 0.6, 0.7, 0.8, 0.4, 0.89, 0.3,
];

export const POSITIONS = [
  { x: 0, y: 0, z: 0 },
  { x: 1.2, y: 0.9, z: -0.5 },
  { x: 1.8, y: -0.3, z: 0 },
  { x: -1, y: -1, z: 0 },
  { x: -1, y: 1.62, z: 0 },
  { x: -1.65, y: 0, z: -0.4 },
  { x: -2.13, y: -1.54, z: -0.4 },
  { x: 0.8, y: 0.94, z: 0.3 },
  { x: 0.5, y: -1, z: 1.2 },
  { x: -0.16, y: -1.2, z: 0.9 },

  { x: 1.5, y: 1.2, z: 0.8 },
  { x: 0.5, y: -1.58, z: 1.4 },
  { x: -1.5, y: 1, z: 1.15 },
  { x: -1.5, y: -1.5, z: 0.99 },
  { x: -1.5, y: -1.5, z: -1.9 },
  { x: 1.85, y: 0.8, z: 0.05 },
  { x: 1.5, y: -1.2, z: -0.75 },
  { x: 0.9, y: -1.62, z: 0.22 },
  { x: 0.45, y: 2, z: 0.65 },
  { x: 2.5, y: 1.22, z: -0.2 },

  { x: 2.35, y: 0.7, z: 0.55 },
  { x: -1.8, y: -0.35, z: 0.85 },
  { x: -1.02, y: 0.2, z: 0.9 },
  { x: 0.2, y: 1, z: 1 },
  { x: -2.88, y: 0.7, z: 1 },

  { x: -2, y: -0.95, z: 1.5 },
  { x: -2.3, y: 2.4, z: -0.1 },
  { x: -2.5, y: 1.9, z: 1.2 },
  { x: -1.8, y: 0.37, z: 1.2 },
  { x: -2.4, y: 1.42, z: 0.05 },

  { x: -2.72, y: -0.9, z: 1.1 },
  { x: -1.8, y: -1.34, z: 1.67 },
  { x: -1.6, y: 1.66, z: 0.91 },
  { x: -2.8, y: 1.58, z: 1.69 },
  { x: -2.97, y: 2.3, z: 0.65 },

  { x: 1.1, y: -0.2, z: -1.45 },
  { x: -4, y: 1.78, z: 0.38 },
  { x: 0.12, y: 1.4, z: -1.29 },
  { x: -1.64, y: 1.4, z: -1.79 },
  { x: -3.5, y: -0.58, z: 0.1 },

  { x: -0.1, y: -1, z: -2 },
  { x: -4.5, y: 0.55, z: -0.5 },
  { x: -3.87, y: 0, z: 1 },
  { x: -4.6, y: -0.1, z: 0.65 },
  { x: -3, y: 1.5, z: -0.7 },

  { x: -0.5, y: 0.2, z: -1.5 },
  { x: -1.3, y: -0.45, z: -1.5 },
  { x: -3.35, y: 0.25, z: -1.5 },
  { x: -4.76, y: -1.26, z: 0.4 },
  { x: -4.32, y: 0.85, z: 1.4 },

  { x: -3.5, y: -1.82, z: 0.9 },
  { x: -3.6, y: -0.6, z: 1.46 },
  { x: -4.55, y: -1.5, z: 1.63 },
  { x: -3.8, y: -1.15, z: 2.1 },
  { x: -2.9, y: -0.25, z: 1.86 },

  { x: -2.2, y: -0.4, z: 1.86 },
  { x: -5.1, y: -0.24, z: 1.86 },
  { x: -5.27, y: 1.24, z: 0.76 },
  { x: -5.27, y: 2, z: -0.4 },
  { x: -6.4, y: 0.4, z: 1 },

  { x: -5.15, y: 0.95, z: 2 },
  { x: -6.2, y: 0.5, z: -0.8 },
  { x: -4, y: 0.08, z: 1.8 },

  { x: 2, y: -0.95, z: 1.5 },
  { x: 2.3, y: 2.4, z: -0.1 },
  { x: 2.5, y: 1.9, z: 1.2 },
  { x: 1.8, y: 0.37, z: 1.2 },
  { x: 3.24, y: 0.6, z: 1.05 },

  { x: 2.72, y: -0.9, z: 1.1 },
  { x: 1.8, y: -1.34, z: 1.67 },
  { x: 1.6, y: 1.99, z: 0.91 },
  { x: 2.8, y: 1.58, z: 1.69 },
  { x: 2.97, y: 2.3, z: 0.65 },

  { x: -1.3, y: -0.2, z: -2.5 },
  { x: 4, y: 1.78, z: 0.38 },
  { x: 1.72, y: 1.4, z: -1.29 },
  { x: 2.5, y: -1.2, z: -2 },
  { x: 3.5, y: -0.58, z: 0.1 },

  { x: 0.1, y: 0.4, z: -2.42 },
  { x: 4.5, y: 0.55, z: -0.5 },
  { x: 3.87, y: 0, z: 1 },
  { x: 4.6, y: -0.1, z: 0.65 },
  { x: 3, y: 1.5, z: -0.7 },

  { x: 2.3, y: 0.6, z: -2.6 },
  { x: 4, y: 1.5, z: -1.6 },
  { x: 3.35, y: 0.25, z: -1.5 },
  { x: 4.76, y: -1.26, z: 0.4 },
  { x: 4.32, y: 0.85, z: 1.4 },

  { x: 3.5, y: -1.82, z: 0.9 },
  { x: 3.6, y: -0.6, z: 1.46 },
  { x: 4.55, y: -1.5, z: 1.63 },
  { x: 3.8, y: -1.15, z: 2.1 },
  { x: 2.9, y: -0.25, z: 1.86 },

  { x: 2.2, y: -0.4, z: 1.86 },
  { x: 5.1, y: -0.24, z: 1.86 },
  { x: 5.27, y: 1.24, z: 0.76 },
  { x: 5.27, y: 2, z: -0.4 },
  { x: 6.4, y: 0.4, z: 1 },

  { x: 5.15, y: 0.95, z: 2 },
  { x: 6.2, y: 0.5, z: -0.8 },
  { x: 4, y: 0.08, z: 1.8 },
];

/* CinematicIntro */
export const TOTAL_SCENES = 14;

export const DARK_START_SCENE = 6;

export const INTROLINES = ["Asking questions is important...", "Right ?...", "So let's start with one."];

export const BUILDINGLINES = [
  "Building isn't hard.",
  "Knowing what to build is.",
  "Knowing WHY to build it...",
  "is even harder.",
];

export const PROBLEMQUESTIONS = [
  "I don't start with code.",
  "I start with questions.",
  "Who uses it?",
  "Why does it exist?",
  "What breaks if it fails?",
  "How will it scale?",
  "How will it survive?",
  "Code is the last step.",
];

export const AICLAIMS = ["YES.", "AI can write code.", "AI can refactor code.", "AI can deploy code."];

export const BUSINESSQUESTIONS = [
  "Can it understand your business?",
  "Can it protect your data?",
  "Can it see what isn't obvious?",
  "Can it predict what breaks six months later?",
];

export const VULNERABILITIES = [
  "Data corruption.",
  "Race condition in production.",
  "Privilege escalation.",
  "Memory leak after 3 months.",
  "User data leak.",
  "Multi-tenant data exposure.",
  "Distributed cache inconsistency.",
  "Deadlock under peak traffic.",
  "Event ordering failure.",
  "And more...",
];

export const PHILOSOPHY = [
  "I don't build websites.",
  "I build experiences.",
  "I don't write code.",
  "I design systems.",
  "I don't chase trends.",
  "I solve problems.",
  "Reliability comes from consistency",
  "Consistency comes from clarity",
];

export const REWINDLINES = [
  "I solve problems.",
  "I don't chase trends.",
  "I design systems.",
  "I don't write code.",
  "I build experiences.",
  "I don't build websites.",
  "Experience prevents disasters.",
  "Intelligence generates code.",
  "Distributed cache inconsistency.",
  "Race condition in production.",
  "Silent data corruption.",
  "Can it predict what breaks six months later?",
  "Can it protect your data?",
  "Can it understand your business?",
  "I specialize in tools.",
  "Great software isn't written.",
  "It's discovered.",
  "Code is the last step.",
  "Why does it exist?",
  "Who uses it?",
  "Knowing WHY to build it...",
  "Knowing what to build is.",
  "My name is AKHIL.",
];

export const HISTORYBANDS = [
  {
    year: "2018",
    text: "Learning. Experimenting. Breaking things. Building taste. Asking why. Shipping small.Learning. Experimenting. Breaking things.",
    dir: "left",
  },
  {
    year: "2020",
    text: "Building. Failing. Building again. Learning resilience. Reading systems. Staying curious.Building. Failing. Building again.",
    dir: "right",
  },
  {
    year: "2022",
    text: "Understanding systems. Not just code. Thinking in flows. Constraints. Tradeoffs. Outcomes.Understanding systems. Not just code.",
    dir: "left",
  },
  {
    year: "2024",
    text: "Engineering products. Solving real problems. Designing trust. Making things work beautifully.Engineering products. Solving real problems.",
    dir: "right",
  },
];

export const SAMPLES = [
  "const trust = await verify(user, data);",
  "if (!permission) throw new Error('403');",
  "query = sanitize(input);",
  "cache.invalidate('session:' + id);",
  "await deploy(build());",
  "for (let i = 0; i < n; i++) optimize();",
  "server.on('error', recover);",
  "try { render() } catch (e) { alert(e) }",
  "db.transaction(async (tx) => await tx.commit());",
  "security.scan();",
];

export const ERRORBITS = [
  "RACE CONDITION DETECTED",
  "UNEXPECTED STATE MUTATION",
  "PERMISSION ESCALATION",
  "STALE CACHE WRITE",
  "MEMORY LEAK",
  "EVENT LOOP BLOCKED",
  "DANGLING REFERENCE",
  "SILENT DATA CORRUPTION",
  "INCONSISTENT REPLICA",
];

/* GlitchText */
export const CHARS = "!<>-_\\/[]{}—=+*^?#________ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/* WeatherIcon */
export const WEATHER_MAP = {
  clear: {
    icon: TiWeatherSunny,
    label: "Clear Sky",
  },

  cloudy: {
    icon: TiWeatherCloudy,
    label: "Cloudy",
  },

  rain: {
    icon: TiWeatherShower,
    label: "Rain",
  },

  storm: {
    icon: TiWeatherStormy,
    label: "Thunderstorm",
  },

  sunset: {
    icon: TiWeatherPartlySunny,
    label: "Sunset",
  },

  night: {
    icon: TiWeatherNight,
    label: "Night",
  },
};

export const MOON_MAP = {
  NEW_MOON: {
    icon: WiMoonAltNew,
    label: "New Moon",
  },

  WAXING_CRESCENT: {
    icon: WiMoonAltWaxingCrescent3,
    label: "Waxing Crescent",
  },

  FIRST_QUARTER: {
    icon: WiMoonAltFirstQuarter,
    label: "First Quarter",
  },

  WAXING_GIBBOUS: {
    icon: WiMoonAltWaxingGibbous3,
    label: "Waxing Gibbous",
  },

  FULL_MOON: {
    icon: WiMoonAltFull,
    label: "Full Moon",
  },

  WANING_GIBBOUS: {
    icon: WiMoonAltWaningGibbous3,
    label: "Waning Gibbous",
  },

  THIRD_QUARTER: {
    icon: WiMoonAltThirdQuarter,
    label: "Third Quarter",
  },

  WANING_CRESCENT: {
    icon: WiMoonAltWaningCrescent3,
    label: "Waning Crescent",
  },
};

/* Footer */
export const SOCIALS = [
  {
    icon: FaGithub,
    label: "GitHub",
    href: "https://github.com/akhilshettym",
  },
  {
    icon: FaLinkedin,
    label: "LinkedIn",
    href: "https://linkedin.com/in/akhilshettym",
  },
  {
    icon: FaSalesforce,
    label: "Salesforce",
    href: "https://www.salesforce.com/trailblazer/akhilshettym",
  },
  {
    icon: FaInstagram,
    label: "Instagram",
    href: "https://www.instagram.com/akhil_shetty_m",
  },
  {
    icon: BsPassportFill,
    label: "portfolio",
    href: "https://akhilshettym.vercel.app",
  },
  {
    icon: IoIosMail,
    label: "Email",
    href: "mailto:your.email@example.com",
  },
  // {
  //   icon: SiLeetcode,
  //   label: "LeetCode",
  //   href: "https://leetcode.com/u/akhil_shetty_m",
  // },
  // {
  //   icon: FaFileAlt,
  //   label: "Resume",
  //   href: "#",
  // },
];

export const CARD_WIDTH = 850;
export const CARD_HEIGHT = 520;
export const CTA_WIDTH = 175;
export const CTA_HEIGHT = 52;
export const EDGE_PADDING = 24;

/* BubbleScene */
export const BUBBLE_TEXT_GROUPS = [
  {
    index: "01",
    summary:
      "Engineering responsive interface layers optimized for sub-millisecond execution, fluid transitions, and deterministic state synchronization.",
  },
  {
    index: "02",
    summary:
      "Architecting resilient distributed systems, data processing layers, and scalable APIs that maintain consistency under peak traffic volumes.",
  },
  {
    index: "03",
    summary:
      "Enforcing rigorous deployment criteria, continuous observability pipelines, and fallback strategies designed to withstand real-world enterprise workloads.",
  },
];

export const TECH_STACK = [
  "reactjs & nextjs",
  "threejs & webgl",
  "expressjs & nodejs",
  "github & git",
  "docker & CI/CD",
  "mongodb & redux",
  "salesforce & sql",
];

/* CreateSomething */
export const SERVICES = [
  { id: "frontend", label: "Frontend Development" },
  { id: "backend", label: "Backend Engineering" },
  { id: "fullstack", label: "Fullstack Solutions" },
  { id: "mobile_app", label: "Mobile Applications" },
  { id: "cms", label: "CMS Integration" },
  { id: "ci_cd", label: "DevOps & CI/CD" },
  { id: "other", label: "Other Systems" },
];

export const BUDGET_OPTIONS = [
  { id: "under_1k", label: "Under $1,000" },
  { id: "1k_5k", label: "$1,000 - $5,000" },
  { id: "5k_10k", label: "$5,000 - $10,000" },
  { id: "10k_plus", label: "$10,000+" },
  { id: "not_sure", label: "Not Sure / Deciding" },
];

export const CLOUD_SHADER = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,

  fragmentShader: `
    uniform sampler2D map;
    uniform vec3 fogColor;
    uniform float fogNear;
    uniform float fogFar;
    varying vec2 vUv;

    void main() {
      float depth = gl_FragCoord.z / gl_FragCoord.w;
      float fogFactor = smoothstep(fogNear, fogFar, depth);

      gl_FragColor = texture2D(map, vUv);
      gl_FragColor.w *= pow(gl_FragCoord.z, 20.0);
      gl_FragColor = mix(gl_FragColor, vec4(fogColor, gl_FragColor.w), fogFactor);
    }`,
};

export const HERO_SHADER = {
  simulationVertexShader: `
  varying vec2 vUv;
  void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
  }
  `,

  simulationFragmentShader: `
uniform sampler2D textureA;
uniform sampler2D textTexture;
uniform vec2 mouse;
uniform vec2 resolution;
uniform float time;
uniform int frame;

varying vec2 vUv;

const float delta = 1.15;

void main() {
    vec2 uv = vUv;

    if (frame == 0) {
        gl_FragColor = vec4(0.0);
        return;
    }

    vec4 data = texture2D(textureA, uv);

    float pressure = data.x;
    float pVel = data.y;

    vec2 texelSize = 1.0 / resolution;

    float p_right = texture2D(
        textureA,
        uv + vec2(texelSize.x, 0.0)
    ).x;

    float p_left = texture2D(
        textureA,
        uv - vec2(texelSize.x, 0.0)
    ).x;

    float p_up = texture2D(
        textureA,
        uv + vec2(0.0, texelSize.y)
    ).x;

    float p_down = texture2D(
        textureA,
        uv - vec2(0.0, texelSize.y)
    ).x;

    if (uv.x <= texelSize.x) p_left = p_right;
    if (uv.x >= 1.0 - texelSize.x) p_right = p_left;
    if (uv.y <= texelSize.y) p_down = p_up;
    if (uv.y >= 1.0 - texelSize.y) p_up = p_down;

    // Fluid pressure propagation
    pVel += delta *
        (-2.0 * pressure + p_right + p_left) / 4.0;

    pVel += delta *
        (-2.0 * pressure + p_up + p_down) / 4.0;

    pressure += delta * pVel;

    // Gentle damping
    pVel -= 0.0045 * delta * pressure;

    pVel *= 0.94;
    pressure *= 0.955;

    vec2 mouseUV = mouse / resolution;

    if (mouse.x > 0.0) {

        // Larger, softer interaction area
        float radius = 0.105;

        float dist = distance(
            uv,
            mouseUV
        );

        if (dist < radius) {

            float isText =
                texture2D(textTexture, uv).r;

            // Strong interaction on the letters
            float textInfluence =
                mix(
                    0.015,
                    5.8,
                    isText
                );

            // Smooth falloff
            float falloff =
                1.0 -
                smoothstep(
                    0.0,
                    radius,
                    dist
                );

            pressure +=
                textInfluence *
                falloff;

            // Extra velocity gives a more watery kick
            pVel +=
                textInfluence *
                falloff *
                0.16;
        }
    }

    gl_FragColor = vec4(
        pressure,
        pVel,
        (p_right - p_left) * 0.5,
        (p_up - p_down) * 0.5
    );
}
`,

  renderVertexShader: `
  varying vec2 vUv;
  void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
  }
  `,

  renderFragmentShader: `
uniform sampler2D textureA;
uniform sampler2D textureB;

varying vec2 vUv;

void main() {
    vec4 data = texture2D(textureA, vUv);

    float pressure = data.x;
    float velocity = data.y;

    // Stronger liquid displacement
    vec2 distortion = data.zw * 0.38;

    // Main text
    float textMask = texture2D(
        textureB,
        clamp(vUv + distortion, 0.0, 1.0)
    ).r;

    // Additional samples create a subtle glass/refraction edge
    float edgeMask = texture2D(
        textureB,
        clamp(vUv + distortion * 1.8, 0.0, 1.0)
    ).r;

    float energy =
        abs(pressure) * 2.0 +
        abs(velocity) * 0.8 +
        length(distortion) * 2.5;

    // Nothing visible until the cursor disturbs the fluid
    float reveal = smoothstep(
        0.008,
        0.075,
        energy
    );

    // Soft glass-like edge
    float glassEdge =
        max(
            0.0,
            edgeMask - textMask * 0.65
        );

    // Bright white / translucent glass
    vec3 glassColor = vec3(1.0);

    // Slightly brighter where distortion is strongest
    float glow = smoothstep(
        0.025,
        0.22,
        abs(pressure)
    );

    glassColor += vec3(glow * 0.12);

    float alpha =
        textMask *
        reveal *
        0.88;

    // Faint refracted edge
    alpha +=
        glassEdge *
        reveal *
        0.28;

    gl_FragColor = vec4(
        glassColor,
        alpha
    );
}
`,
};

/* SubjectProfile */
export const fadeInContainer = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.15,
    },
  },
};

export const itemReveal = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export const carouselData = [
  "I build fast, smooth websites where performance is baked in from the start — delivering excellent results.",
  "I write clean, well-structured, and maintainable code focused on clarity, scalability, and long-term reliability.",
  "I design intuitive, consistent, and responsive interfaces that feel natural across all devices and screen sizes.",
  "Strong technical SEO, accessibility, and modern best practices are built in from day one — not added later.",
  "From concept to launch, I ensure clear communication, thoughtful planning, and reliable, rigorously tested delivery.",
];

export const welcomeTexts = [
  "HELLO, GLAD YOU'RE HERE.",
  "WELCOME TO MY CREATIVE SPACE.",
  "LET'S CREATE SOMETHING REMARKABLE.",
  "CRAFTING DIGITAL EXPERIENCES FOR YOU.",
  "READY TO BRING IDEAS TO LIFE?",
];

/* Loader.jsx */
export const GREETINGS = [
  "Hello", // English
  "こんにちは", // Japanese
  "Bonjour", // French
  "Hola", // Spanish
  "Ciao", // Italian
  "你好", // Mandarin
  "Olá", // Portuguese
  "Привет", // Russian
  "مرحباً", // Arabic
  "안녕하세요", // Korean
  "Γεια σας", // Greek
  "สวัสดี", // Thai
  "Ahoj", // Czech
  "Xin chào", // Vietnamese
  "नमस्ते", // Hindi
  "ನಮಸ್ಕಾರ", // Kannada
];

/* MyExperience.jsx */
export const DUMMY_CARDS = [
  {
    id: 1,
    title: "Junior Graphic Designer Intern",
    company: "Karanji Infotech Pvt. Ltd.",
    timeline: "6th Nov - 5th Dec 2023",
    type: "Experience",
    description: "Designed high-impact marketing visuals, social graphics, and promotional brochures collaboratively.",
    tags: ["adobe animate", "blender"],
    tilt: -2.5,
  },
  {
    id: 2,
    title: "Information Technology Intern",
    company: "Global Industrial Pvt. Ltd.",
    timeline: "3rd Feb - 16th Jun 2025",
    type: "Experience",
    description: "Mastered core web technologies and modern frameworks to build responsive user interfaces.",
    tags: ["html", "css", "js", "react", "git"],
    tilt: 3,
  },
  {
    id: 3,
    title: "Information Technology Trainee",
    company: "Global Industrial Pvt. Ltd.",
    timeline: "17th Jun - Present",
    type: "Experience",
    description: "Optimized performance while expanding into backend arch., SSR, and API integration.",
    tags: ["next", "node", "express", "mongodb", "jest"],
    tilt: -1.5,
  },
];

export const EDUCATION_CARDS = [
  {
    id: 1,
    title: "Secondary Schooling (10th)",
    college: "Canara High School, Mangaluru",
    major: "General",
    score: "87.84%",
    timeline: "2018 - 2019",
    variant: "standard",
  },
  {
    id: 2,
    title: "Pre-University",
    college: "Boscoss Pre-University College, Mangaluru",
    major: "Physics, Chemistry, Math, Biology (PCMB)",
    score: "95.17%",
    timeline: "2019 - 2021",
    variant: "standard",
  },
  {
    id: 3,
    title: "Bachelor of Engineering",
    college: "St. Joseph Engineering College, Mangaluru",
    major: "Computer Science and Engineering",
    score: "8.76 CGPA",
    timeline: "2021 - 2025",
    variant: "standard",
  },
  {
    id: 4,
    title: "IUCEE Annual Student Expo 2025",
    college: "VNRVJIET, Hyderabad",
    major: "Cloud-Based Smart Baby Monitoring System",
    score: "Rep. SJEC at ICTIEE 2025",
    timeline: "7th-8th Jan, 2025",
    variant: "inverted",
  },
  {
    id: 5,
    title: "TEDX SJEC",
    college: "St. Joseph Engineering College, Mangaluru",
    major: "Stage and Venue Committee Head",
    score: "Design and Build",
    timeline: "14th Dec, 2024",
    variant: "inverted",
  },
];

export const DEFAULT_TRAIL_DATA = {
  rankImg: "/trailhead/double-star-ranger.svg",
  rankTitle: "Double Star Ranger",
  points: "1,31,675",
  superbadges: "14",
  badges: "257",
  trails: "24",
};

/* Flow State */
export const FLOW_STATE = {
  vertexShader: `
  attribute vec3 position;

  void main() {
    gl_Position = vec4(position, 1.0);
  }
`,

  fragmentShaderTier1: `
  precision highp float;

  uniform vec2 resolution;
  uniform float time;

  uniform float density;
  uniform float matrixSpeed;
  uniform float matrixOpacity;

  uniform float xScale;
  uniform float yScale;
  uniform float distortion;
  uniform float lineIntensity;
  uniform float lineSpeed;
  uniform float lineOpacity;

  float hash(float n) {
    return fract(
      sin(n) * 43758.5453123
    );
  }

  float hash21(vec2 p) {
    return fract(
      sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123
    );
  }

  float glyph(vec2 uv, float seed) {
    vec2 cell = floor(uv);
    vec2 local = fract(uv);

    float randomValue = hash21(cell + seed);
    float mode = floor(randomValue * 6.0);

    float value = 0.0;

    if (mode < 1.0) {
      value = step(0.20, local.y) * step(local.y, 0.34) * step(0.12, local.x) * step(local.x, 0.88);
    }

    else if (mode < 2.0) {
      value = step(0.20, local.x) * step(local.x, 0.34) * step(0.10, local.y) * step(local.y, 0.90);
    }

    else if (mode < 3.0) {
      float vertical = step(0.18, local.x) * step(local.x, 0.34) * step(0.10, local.y) * step(local.y, 0.90);
      float horizontal = step(0.10, local.x) * step(local.x, 0.88) * step(0.66, local.y) * step(local.y, 0.84);
      value = max(vertical, horizontal);
    }

    else if (mode < 4.0) {
      float left = step(0.18, local.x) * step(local.x, 0.30);
      float right = step(0.70, local.x) * step(local.x, 0.82);
      float horizontal = step(0.20, local.y) * step(local.y, 0.34);
      value = max(left, max(right, horizontal)
      );
    }

    else if (mode < 5.0) {
      value = step(0.35, local.x) * step(local.x, 0.65) * step(0.35, local.y) * step(local.y, 0.65);
    }

    else {
      value = step(0.70, fract(local.x + local.y));
    }

    return value;
  }

  float codeColumn(vec2 uv, float column, float seed) {
    float columnRandom = hash(column + seed);

    float columnSpeed = matrixSpeed * mix( 0.55, 1.35, columnRandom);
    float stream = uv.y + time * columnSpeed;
    float characterY = stream * mix( 8.0, 16.0, hash(column + 21.4));
    float characterIndex = floor(characterY);

    vec2 glyphUV = vec2(fract(uv.x * 1.3), fract(characterY));

    float character = glyph( vec2(glyphUV.x * 3.0, glyphUV.y * 1.4), characterIndex + seed);
    float visible = step(0.22, hash(characterIndex + column * 17.31 + seed));

    character *= visible;

    float wrapped = fract(stream * 0.11);
    float head = smoothstep(0.0, 0.18, wrapped);
    float tail = 1.0 - smoothstep(0.70, 1.0, wrapped);

    float streamFade = head * tail;

    float brightCharacter = step(0.90, hash(characterIndex + column * 9.17));

    return character * streamFade * mix(0.20, 1.0, brightCharacter);
  }

  vec3 flowingLine(vec2 p) {
    float d = length(p) * distortion;
    float rx = p.x * (1.0 + d);
    float gx = p.x;
    float bx = p.x * (1.0 - d);

    float waveR = sin((rx + time * lineSpeed) * xScale) * yScale;
    float waveG = sin((gx + time * lineSpeed) * xScale) * yScale;
    float waveB = sin((bx + time * lineSpeed) * xScale) * yScale;

    float lineR = lineIntensity / max(abs(p.y + waveR), 0.008);
    float lineG = lineIntensity / max(abs(p.y + waveG), 0.008);
    float lineB = lineIntensity / max(abs(p.y + waveB), 0.008);

    return vec3(lineR, lineG, lineB);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    float matrixColumns = density * resolution.x / 100.0;
    float columnPosition = uv.x * matrixColumns;
    float column = floor(columnPosition);
    float localX = fract(columnPosition);
    float columnSeed = hash(column * 12.731);
    float columnMask = smoothstep(0.08, 0.20, localX) * (1.0 - smoothstep(0.72, 0.92, localX));

    float matrix = codeColumn(uv, column, columnSeed);

    matrix *= columnMask;
    float scanline = 0.94 + 0.06 * sin(gl_FragCoord.y * 0.15);

    matrix *= scanline;

    vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);

    vec3 line = flowingLine(p);

    vec3 background = vec3(0.004, 0.006, 0.008);
    vec3 matrixColor = vec3(0.10, 0.55, 0.38);

    vec3 matrixLayer = matrixColor * matrix * matrixOpacity;
    vec3 color = background + matrixLayer;

    color += line * lineOpacity;

    gl_FragColor = vec4(color, 1.0);
  }
`,

  fragmentShaderTier2: `
  precision mediump float;

  uniform vec2 resolution;
  uniform float time;

  uniform float density;
  uniform float matrixSpeed;
  uniform float matrixOpacity;

  uniform float xScale;
  uniform float yScale;
  uniform float lineIntensity;
  uniform float lineSpeed;
  uniform float lineOpacity;

  float hash(vec2 p) {
    return fract(
      sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123
    );
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    float columns = max(density * 0.55, 4.0);
    float x = uv.x * columns;
    float column = floor(x);
    float localX = fract(x);

    float streamSpeed = matrixSpeed * mix(0.7, 1.1, hash(vec2(column, 4.17)));
    float stream = uv.y + time * streamSpeed;
    float cellY = floor(stream * 9.0);

    float character = step(0.58, hash(vec2(column, cellY)));

    float columnMask = smoothstep( 0.15, 0.30, localX) * (1.0 - smoothstep(0.70, 0.85, localX));
    float streamFade = smoothstep(0.0, 0.15, fract(stream)) * (1.0 - smoothstep(0.78, 1.0, fract(stream)));
    float matrix = character * columnMask * streamFade * matrixOpacity;

    vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);

    float wave =sin((p.x + time * lineSpeed) * xScale) * yScale;

    float distanceToWave = abs(p.y + wave);
    float line = lineIntensity / max(distanceToWave, 0.025);
    line = min(line, 1.0);
    vec3 background = vec3(0.004, 0.006, 0.008);
    vec3 matrixColor = vec3(0.10, 0.40, 0.30);
    vec3 color = background + matrixColor * matrix;
    color += vec3(line) * lineOpacity;
    gl_FragColor = vec4(color, 1.0);
  }`,
};

/* Scene Controls */
export const CONTROL_RADIUS = 80;

export const SCENE_CONTROLS = [
  {
    id: "clouds",
    angle: 78,
    labelPlacement: "bottom",
    delay: 0.01,
  },
  {
    id: "intro",
    angle: 120,
    labelPlacement: "bottom",
    delay: 0.04,
  },
  {
    id: "weather",
    angle: 160,
    labelPlacement: "left",
    delay: 0.07,
  },
  {
    id: "moon",
    angle: 198,
    labelPlacement: "left",
    delay: 0.1,
  },
];

export const CONTROL_TRANSITION = {
  type: "spring",
  stiffness: 380,
  damping: 26,
  mass: 0.8,
};

export const REVEAL_TRANSITION = {
  duration: 0.8,
  ease: [0.22, 1, 0.36, 1],
};
