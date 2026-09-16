"use client";

import "@/styles/emergency_cta.css";
import { goToTop } from "@/utils/functions";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { getEmergencyStyles } from "@/utils/swatch";
import { useDeviceType } from "@/hooks/useDeviceType";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";

export default function EmergencyCTA() {
  const router = useRouter();
  const { theme } = useTheme();
  const { isMobile } = useDeviceType();
  const { isTier2 } = usePerformanceTier();

  const styles = getEmergencyStyles(theme);

  const handleRedirection = () => {
    router.push("/work");
    goToTop();
  };

  const renderMobile = () => {
    return (
      <section className="relative z-40">
        <div
          className={`relative flex flex-row items-center overflow-hidden w-full px-10 transition-colors duration-500 ${styles.bg}`}>
          <div className="flex-1 rounded-lg text-sm px-4 overflow-hidden min-w-0 flex items-center">
            <button onClick={handleRedirection} className="group block w-full cursor-pointer">
              {isTier2 ? (
                <div className="flex whitespace-nowrap">
                  <span
                    className={`text-sm uppercase tracking-normal font-medium transition-colors duration-300 group-hover:underline decoration-2 underline-offset-4 pointer-events-none ${styles.text}`}>
                    PLEASE GO BACK AND VIEW ALL PROJECTS
                  </span>
                </div>
              ) : (
                <div className="animate-marquee flex whitespace-nowrap">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <span
                      key={i}
                      className={`mx-8 text-sm uppercase tracking-normal font-medium transition-colors duration-300 group-hover:underline decoration-2 underline-offset-4 pointer-events-none ${styles.text}`}>
                      IN CASE OF EMERGENCY. PLEASE GO BACK AND VIEW ALL PROJECTS
                    </span>
                  ))}
                </div>
              )}
            </button>
          </div>
        </div>
      </section>
    );
  };

  const renderDesktop = () => {
    return (
      <section className="relative z-40">
        <div
          className={`flex flex-row items-center overflow-hidden w-full px-10 transition-colors duration-500 ${styles.bg}`}>
          <div className="flex-1 rounded-lg text-sm px-4 flex items-center justify-start min-w-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              width={200}
              height={56}
              aria-hidden="true"
              className={`w-auto h-auto z-10 object-contain transition-all duration-500 ${styles.image}`}>
              <source src="/footer/animated_qr_border.mp4" type="video/mp4" />
            </video>
          </div>

          <div className="flex-1 rounded-lg text-sm px-4 overflow-hidden min-w-0 flex items-center">
            <button onClick={handleRedirection} className="group block w-full cursor-pointer">
              {isTier2 ? (
                <div className="flex whitespace-nowrap">
                  <span
                    className={`mx-8 text-xs md:text-sm uppercase tracking-normal font-medium transition-colors duration-300 group-hover:underline decoration-2 underline-offset-4 pointer-events-none ${styles.text}`}>
                    PLEASE GO BACK AND VIEW ALL PROJECTS
                  </span>
                </div>
              ) : (
                <div className="animate-marquee flex whitespace-nowrap">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <span
                      key={i}
                      className={`mx-8 text-xs md:text-sm uppercase tracking-normal font-medium transition-colors duration-300 group-hover:underline decoration-2 underline-offset-4 pointer-events-none ${styles.text}`}>
                      IN CASE OF EMERGENCY. PLEASE GO BACK AND VIEW ALL PROJECTS
                    </span>
                  ))}
                </div>
              )}
            </button>
          </div>

          <div className="flex-1 rounded-lg text-sm px-4 flex items-center justify-end min-w-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              width={200}
              height={56}
              aria-hidden="true"
              className={`w-auto h-auto z-10 object-contain transition-all duration-500 ${styles.image}`}>
              <source src="/footer/animated_qr_border.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>
    );
  };

  return isMobile ? renderMobile() : renderDesktop();
}
