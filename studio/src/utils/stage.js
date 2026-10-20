import { CACHE_TTL_MS } from "@/utils/basic";
import { SCENE_CACHE, LOCATION_MODE } from "@/utils/storage";
import { getMoonVariant, resolveScene } from "@/utils/wx-fx";

const VALID_LOCATION_MODES = ["accurate", "fast", "denied"];

const DEFAULT_SCENE = {
  success: true,
  scene: "morning",
  backgroundKey: "morning_clear",
  cloudKey: "morning_clear",
  sceneCondition: "CLEAR",
  renderMoonPhase: "MOON",
  moonPhase: null,
  weather: null,
};

async function fetchWeather(latitude, longitude) {
  const response = await fetch(`/api/weather?latitude=${latitude}&longitude=${longitude}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Weather fetch failed");
  }

  const data = await response.json();

  return {
    temperature: data.current?.temperature_2m,
    cloudCover: data.current?.cloud_cover,
    weatherCode: data.current?.weather_code,
    isDay: data.current?.is_day === 1,
    windSpeed: data.current?.wind_speed_10m,
    sunrise: data.daily?.sunrise?.[0],
    sunset: data.daily?.sunset?.[0],
  };
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000,
    });
  });
}

async function getLocationFromIP() {
  const response = await fetch("/api/location", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("IP lookup failed");
  }

  const data = await response.json();

  return {
    latitude: data.latitude,
    longitude: data.longitude,
  };
}

async function getCoordinates() {
  const mode = localStorage.getItem(LOCATION_MODE) || "fast";

  if (mode === "denied") {
    return null;
  }

  if (mode === "accurate") {
    try {
      const position = await getCurrentPosition();

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch (error) {
      console.warn("GPS failed. Falling back to IP.", error);
      return await getLocationFromIP();
    }
  }

  return await getLocationFromIP();
}

function readCachedScene() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(SCENE_CACHE);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    if (!parsed?.timestamp || !parsed?.data) {
      return null;
    }

    const age = Date.now() - parsed.timestamp;

    if (age > CACHE_TTL_MS) {
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

function writeCachedScene(data) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(
      SCENE_CACHE,
      JSON.stringify({
        timestamp: Date.now(),
        data,
      }),
    );
  } catch (error) {
    console.error("Failed to cache weather scene", error);
  }
}

export function setLocationMode(mode) {
  if (typeof window === "undefined") {
    return;
  }

  if (!VALID_LOCATION_MODES.includes(mode)) {
    console.warn(`Invalid location mode: ${mode}`);
    return;
  }

  localStorage.setItem(LOCATION_MODE, mode);

  localStorage.removeItem(SCENE_CACHE);
}

export function getLocationMode() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(LOCATION_MODE);
}

export function getWeatherIconData() {
  const fallbackData = {
    temperature: null,
    windSpeed: null,
    sunrise: null,
    sunset: null,
    getMoonPhase: DEFAULT_SCENE.renderMoonPhase,
    getSceneCondition: DEFAULT_SCENE.sceneCondition,
  };

  if (typeof window === "undefined") {
    return fallbackData;
  }

  try {
    const mode = getLocationMode();

    if (mode === "denied") {
      return fallbackData;
    }

    const rawData = localStorage.getItem(SCENE_CACHE);

    if (!rawData) {
      return fallbackData;
    }

    const parsedData = JSON.parse(rawData);
    const innerData = parsedData?.data;
    const weather = innerData?.weather;

    return {
      temperature: weather?.temperature ?? null,
      windSpeed: weather?.windSpeed ?? null,
      sunrise: weather?.sunrise ?? null,
      sunset: weather?.sunset ?? null,
      getMoonPhase: innerData?.renderMoonPhase || DEFAULT_SCENE.renderMoonPhase,
      getSceneCondition: innerData?.sceneCondition || DEFAULT_SCENE.sceneCondition,
    };
  } catch {
    return fallbackData;
  }
}

export async function getWeatherScene({ forceRefresh = false } = {}) {
  try {
    const mode = getLocationMode();

    if (mode === "denied") {
      localStorage.removeItem(SCENE_CACHE);

      return {
        ...DEFAULT_SCENE,
      };
    }

    if (!forceRefresh) {
      const cached = readCachedScene();

      if (cached) {
        return cached;
      }
    }

    const coordinates = await getCoordinates();

    if (!coordinates) {
      localStorage.removeItem(SCENE_CACHE);

      return {
        ...DEFAULT_SCENE,
      };
    }

    const { latitude, longitude } = coordinates;

    const weather = await fetchWeather(latitude, longitude);

    const scene = resolveScene(weather);

    const sceneCondition = scene.condition;

    const renderMoonPhase = getMoonVariant();

    const moonPhase = scene.timeBand === "night" ? getMoonVariant() : null;

    const result = {
      success: true,
      scene: scene.timeBand,
      backgroundKey: scene.backgroundKey,
      cloudKey: scene.cloudKey,
      moonPhase,
      sceneCondition,
      renderMoonPhase,
      weather,
    };

    writeCachedScene(result);

    return result;
  } catch (error) {
    console.error("Weather Scene Error:", error);

    if (getLocationMode() === "denied") {
      localStorage.removeItem(SCENE_CACHE);

      return {
        ...DEFAULT_SCENE,
      };
    }

    const cached = readCachedScene();

    if (cached) {
      return cached;
    }

    return {
      ...DEFAULT_SCENE,
      success: false,
    };
  }
}

export function hasLocationPreference() {
  if (typeof window === "undefined") {
    return false;
  }

  const mode = localStorage.getItem(LOCATION_MODE);

  return VALID_LOCATION_MODES.includes(mode);
}
