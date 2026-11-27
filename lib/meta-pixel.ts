export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
    __metaPixelInitialized?: boolean;
  }
}

interface QueuedPixelEvent {
  eventName: string;
  params?: Record<string, unknown>;
}

const MAX_QUEUED_EVENTS = 20;
const pendingEvents: QueuedPixelEvent[] = [];

export function isMetaPixelEnabled(): boolean {
  return Boolean(META_PIXEL_ID);
}

export function flushPendingMetaPixelEvents(): void {
  if (
    typeof window === "undefined" ||
    !META_PIXEL_ID ||
    typeof window.fbq !== "function"
  ) {
    return;
  }

  while (pendingEvents.length > 0) {
    const next = pendingEvents.shift();
    if (!next) continue;
    if (next.params) {
      window.fbq("track", next.eventName, next.params);
    } else {
      window.fbq("track", next.eventName);
    }
  }
}

export function pageview(): void {
  if (typeof window === "undefined" || !META_PIXEL_ID) return;
  if (typeof window.fbq !== "function") return;

  window.fbq("track", "PageView");
}

export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === "undefined" || !META_PIXEL_ID) return;

  if (typeof window.fbq === "function") {
    if (params) {
      window.fbq("track", eventName, params);
    } else {
      window.fbq("track", eventName);
    }
    return;
  }

  // Queue early client events (such as ViewContent on initial page load)
  // until afterInteractive script attaches window.fbq.
  if (pendingEvents.length < MAX_QUEUED_EVENTS) {
    pendingEvents.push({ eventName, params });
  }
}
