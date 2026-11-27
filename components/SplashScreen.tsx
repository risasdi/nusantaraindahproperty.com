"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function SplashScreen() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    document.body.classList.add("splash-active");

    const animateTimer = window.setTimeout(() => {
      setIsAnimating(true);
    }, 500);

    const fadeOutTimer = window.setTimeout(() => {
      setIsFadingOut(true);
    }, 3500);

    const hideTimer = window.setTimeout(() => {
      setIsVisible(false);
      document.body.classList.remove("splash-active");
    }, 4500);

    return () => {
      window.clearTimeout(animateTimer);
      window.clearTimeout(fadeOutTimer);
      window.clearTimeout(hideTimer);
      document.body.classList.remove("splash-active");
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      id="splash-screen"
      className={isAnimating ? "animate" : undefined}
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
