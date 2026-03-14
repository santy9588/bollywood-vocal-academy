import { useCallback, useEffect, useRef } from "react";
import { useTrackVisitor } from "./useQueries";

function getOrCreateSessionId(): string {
  const key = "lt_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

export function useVisitorTracking(page: string) {
  const { mutate: trackVisitor } = useTrackVisitor();
  const trackedScrollMilestones = useRef<Set<number>>(new Set());
  const sessionId = useRef(getOrCreateSessionId()).current;

  // Track pageview on mount — intentionally only depends on page
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional single-fire on page change
  useEffect(() => {
    trackVisitor({
      sessionId,
      page,
      eventType: "pageview",
      scrollDepth: 0n,
      timestamp: BigInt(Date.now()),
    });
    // Reset scroll tracking for this page
    trackedScrollMilestones.current = new Set();
  }, [page]);

  // Track scroll milestones
  useEffect(() => {
    const milestones = [25, 50, 75, 100];

    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      for (const milestone of milestones) {
        if (
          scrollPercent >= milestone &&
          !trackedScrollMilestones.current.has(milestone)
        ) {
          trackedScrollMilestones.current.add(milestone);
          trackVisitor({
            sessionId,
            page,
            eventType: `scroll_${milestone}`,
            scrollDepth: BigInt(milestone),
            timestamp: BigInt(Date.now()),
          });
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, sessionId, trackVisitor]);

  const trackClick = useCallback(
    (elementName: string) => {
      trackVisitor({
        sessionId,
        page,
        eventType: `click_${elementName}`,
        scrollDepth: 0n,
        timestamp: BigInt(Date.now()),
      });
    },
    [page, sessionId, trackVisitor],
  );

  return { trackClick, sessionId };
}
