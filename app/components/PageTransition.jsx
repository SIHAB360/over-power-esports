"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import logo from "../assets/logo.png";
import styles from "./PageTransition.module.css";

// Same image as the Home page. Each thread is a moving, straight rocket trail.
const TRANSITION_MS = 850;
const ROCKET_COUNT = 30;
const COLORS = [
  "#ff468e", "#b75bff", "#5a80ff", "#27d7ff", "#38f7cb",
  "#ffd17c", "#ff6887", "#7a64ff", "#49e9ff", "#f86de1",
];
const ROCKETS = Array.from({ length: ROCKET_COUNT }, (_, index) => ({
  id: index,
  angle: (360 * index) / ROCKET_COUNT,
  c1: COLORS[index % COLORS.length],
  c2: COLORS[(index + 2) % COLORS.length],
  c3: COLORS[(index + 5) % COLORS.length],
  delay: (index % 5) * 0.012,
}));

export default function PageTransition() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [backward, setBackward] = useState(false);
  const timer = useRef(null);
  const backNavigation = useRef(false);
  const initial = useRef(true);
  const startedBeforeRouteChange = useRef(false);
  const animationStartedAt = useRef(0);

  const play = useCallback((reverse = false) => {
    if (timer.current) window.clearTimeout(timer.current);
    animationStartedAt.current = Date.now();
    setBackward(reverse);
    setVisible(true);
    timer.current = window.setTimeout(() => {
      setVisible(false);
      timer.current = null;
    }, TRANSITION_MS);
  }, []);

  useEffect(() => {
    // Next.js updates usePathname only AFTER route navigation resolves.
    // Start on the original click, so the animation appears immediately.
    const onInternalLinkClick = (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) return;

      const element = event.target instanceof Element ? event.target : null;
      const link = element?.closest("a[href]");
      if (!link || link.hasAttribute("download")) return;
      if (link.target && link.target !== "_self") return;

      let url;
      try {
        url = new URL(link.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;

      // Don't block in-page anchors, scrolling, or the current page.
      if (url.pathname === window.location.pathname &&
          url.search === window.location.search) return;

      startedBeforeRouteChange.current = true;
      play(false);
    };

    // Custom event for pages that navigate through router.push() in buttons.
    const onProgrammaticNavigation = () => {
      startedBeforeRouteChange.current = true;
      play(false);
    };

    document.addEventListener("click", onInternalLinkClick, true);
    window.addEventListener("op:navigation-start", onProgrammaticNavigation);
    return () => {
      document.removeEventListener("click", onInternalLinkClick, true);
      window.removeEventListener("op:navigation-start", onProgrammaticNavigation);
    };
  }, [play]);

  useEffect(() => {
    function onPopState() {
      backNavigation.current = true;
      startedBeforeRouteChange.current = false;
      play(true);
    }
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [play]);

  useEffect(() => {
    // Home's first visit is handled by its own preloader.
    if (initial.current) {
      initial.current = false;
      return;
    }
    if (backNavigation.current) {
      backNavigation.current = false;
      return;
    }
    // Prevent a second (late) overlay when the route actually finishes.
    if (startedBeforeRouteChange.current) {
      startedBeforeRouteChange.current = false;
      return;
    }
    // Avoid restarting an animation already visible.
    if (Date.now() - animationStartedAt.current < TRANSITION_MS) return;
    play(false);
  }, [pathname, play]);

  if (!visible) return null;

  return (
    <div className={[styles.screen, backward ? styles.back : ""].join(" ")} aria-hidden="true">
      <div className={styles.light} />
      <div className={styles.field}>
        {ROCKETS.map((rocket) => (
          <div
            key={rocket.id}
            className={styles.track}
            style={{
              "--angle": rocket.angle + "deg",
              "--c1": rocket.c1,
              "--c2": rocket.c2,
              "--c3": rocket.c3,
              "--delay": rocket.delay + "s",
            }}
          >
            <div className={styles.rocket}>
              <span className={styles.trailGlow} />
              <span className={styles.trail} />
              <span className={styles.head} />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.logoStage}>
        <div className={styles.logoRing} />
        <div className={styles.logoHolder}>
          <Image
            src={logo}
            alt="Over Power Esports logo"
            width={84}
            height={84}
            priority
            className={styles.brandLogo}
          />
        </div>
      </div>
    </div>
  );
}
