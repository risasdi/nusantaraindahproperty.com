"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface FadeUpProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "h2" | "article";
}

export default function FadeUp({
  children,
  className = "",
  delay,
  as: Tag = "div",
}: FadeUpProps) {
  const ref = useRef<HTMLDivElement & HTMLHeadingElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            obs.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.15 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const combinedClassName = [
    className,
    "fade-up",
    isVisible ? "is-visible" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag
      ref={ref}
      className={combinedClassName}
      style={delay !== undefined ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </Tag>
  );
}
