"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const SPLASH_SESSION_KEY = "nip_splash_seen_v1";

type SplashStage = "idle" | "showing" | "animating" | "fading" | "done";

export default function SplashScreen() {
  const [stage, setStage] = useState<SplashStage>("idle");

  useEffect(() => {
    const hasHash = Boolean(window.location.hash && window.location.hash !== "#");

    let alreadySeen = false;
    try {
      alreadySeen = window.sessionStorage.getItem(SPLASH_SESSION_KEY) === "1";
    } catch {
      alreadySeen = false;
    }

    // Never show splash if already seen this session or if arriving via a URL hash (e.g. /#catalog, /#contact)
    if (hasHash || alreadySeen) {
      document.body.classList.remove("splash-active");
      if (hasHash) {
        const targetId = window.location.hash.slice(1);
        const targetEl = targetId ? document.getElementById(targetId) : null;
        if (targetEl) {
          requestAnimationFrame(() => {
            targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        }
      }
      return;
    }

    document.body.classList.add("splash-active");

    const showFrame = window.requestAnimationFrame(() => {
      setStage("showing");
    });

    const animateTimer = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem(SPLASH_SESSION_KEY, "1");
      } catch {
        // Ignore storage errors in private browsing modes
      }
      setStage("animating");
    }, 350);

    const fadeOutTimer = window.setTimeout(() => {
      setStage("fading");
      document.body.classList.remove("splash-active");
    }, 2350);

    const hideTimer = window.setTimeout(() => {
      setStage("done");
    }, 3150);

    return () => {
      window.cancelAnimationFrame(showFrame);
      window.clearTimeout(animateTimer);
      window.clearTimeout(fadeOutTimer);
      window.clearTimeout(hideTimer);
      document.body.classList.remove("splash-active");
    };
  }, []);

  if (stage === "idle" || stage === "done") return null;

  const isAnimating = stage === "animating" || stage === "fading";
  const isFadingOut = stage === "fading";

  return (
    <div
      id="splash-screen"
      aria-hidden="true"
      className={
        `${isAnimating ? "animate" : ""}${isFadingOut ? " pointer-events-none" : ""}`.trim() ||
        undefined
      }
      style={{ opacity: isFadingOut ? 0 : 1 }}
    >
      <div className="splash-logo-container">
        <Image
          src="/images/logo/logo-10.png"
          alt="Nusantara Indah Property"
          width={512}
          height={512}
          priority
          className="splash-logo-img"
        />
        <div className="splash-logo-text">
          <div className="splash-text-top">NUSANTARA</div>
          <div className="splash-text-bottom">INDAH PROPERTY</div>
        </div>
      </div>
    </div>
  );
}
