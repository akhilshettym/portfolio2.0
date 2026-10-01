import { cache } from "react";
import { ACH_FALLBACK_DATA, EDU_FALLBACK_DATA, EXP_FALLBACK_DATA, WORKS_FALLBACK_DATA } from "@/utils/basic";

const PORTFOLIO_FETCH_TIMEOUT_MS = 20000;
const PORTFOLIO_REVALIDATE_SECONDS = 86400;
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://shetty-portfolio-gateway.onrender.com";

const endpointUrl = (endpoint) => new URL(endpoint, BASE_URL).toString();

const fetchEndpoint = cache(async (endpoint) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PORTFOLIO_FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(endpointUrl(endpoint), {
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
      next: {
        revalidate: PORTFOLIO_REVALIDATE_SECONDS,
        tags: ["portfolio"],
      },
    });

    if (!res.ok) {
      if (res.status !== 404) {
        console.warn(`Portfolio endpoint unavailable: ${endpoint} (${res.status})`);
      }
      return null;
    }

    const json = await res.json();
    return json?.data ?? null;
  } catch (error) {
    if (error?.name === "AbortError") {
      return null;
    }
    console.error(`Error fetching ${endpoint}:`, error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
});

export const getPortfolioData = cache(async () => {
  const data = await fetchEndpoint("/api/user/portfolio-content");
  return data && typeof data === "object" ? data : {};
});

export const getAchievements = cache(async () => {
  const data = await getPortfolioData();
  return Array.isArray(data?.achievements) ? data.achievements : ACH_FALLBACK_DATA;
});

export const getEducations = cache(async () => {
  const data = await getPortfolioData();
  return Array.isArray(data?.educations) ? data.educations : EDU_FALLBACK_DATA;
});

export const getExperiences = cache(async () => {
  const data = await fetchEndpoint("/api/user/experiences");
  return Array.isArray(data) ? data : EXP_FALLBACK_DATA;
});

export const getTrailhead = cache(async () => {
  const data = await fetchEndpoint("/api/user/trailhead");
  return data && typeof data === "object" ? data : {};
});

export const getWorks = cache(async () => {
  const data = await fetchEndpoint("/api/user/works");
  return Array.isArray(data) ? data : WORKS_FALLBACK_DATA;
});

export const getInfoPageContent = cache(async () => {
  const achievements = await getAchievements();
  return { achievements };
});

export const getWorkPageContent = cache(async () => {
  const [portfolioData, experiences, trailhead, works] = await Promise.all([
    getPortfolioData(),
    getExperiences(),
    getTrailhead(),
    getWorks(),
  ]);

  return {
    educations:
      Array.isArray(portfolioData?.educations) && portfolioData.educations.length > 0
        ? portfolioData.educations
        : EDU_FALLBACK_DATA,
    experiences,
    trailhead,
    works,
  };
});
