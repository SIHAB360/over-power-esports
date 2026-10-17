"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import logo from "../assets/logo.png";

// Keep the same timing as the previous transition.
const TRANSITION_MS = 2300;
const FILAMENT_COUNT = 36;

export default function PageTransition() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [reversing, setReversing] = useState(false);
  const timerRef = useRef(null);
  const backNavigationRef = useRef(false);
  const firstRenderRef = useRef(true);

  const play = useCallback((backward = false) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setReversing(backward);
    setVisible(true);
    timerRef.current = window.setTimeout(() => {
      setVisible(false);
      timerRef.current = null;
    }, TRANSITION_MS);
  }, []);

  useEffect(() => {
    const onPopState = () => {
      backNavigationRef.current = true;
      play(true);
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [play]);

  useEffect(() => {
    // The Home first-entry preloader is independent. Do not overlay it on mount.
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    // Browser back/forward already started the inward animation.
    if (backNavigationRef.current) {
      backNavigationRef.current = false;
      return;
    }
    play(false);
  }, [pathname, play]);

  if (!visible) return null;

  return (
    <div
      className={`op-transition ${reversing ? "op-reverse" : ""}`}
      aria-hidden="true"
    >
      <div className="center-light" />

      {/* All strands start under the center logo, radiating in separate directions. */}
      <div className="filaments">
        {Array.from({ length: FILAMENT_COUNT }, (_, i) => (
          <span
            className="filament-track"
            key={i}
            style={{
              "--angle": `${(i * 360) / FILAMENT_COUNT}deg`,
              "--shift": `${(i % 9) * 31}deg`,
              "--delay": `${(i % 6) * 0.016}s`,
            }}
          >
            <span className="filament-line" />
          </span>
        ))}
      </div>

      <div className="logo-stage">
        <div className="outer-ring" />
        <div className="inner-ring" />
        <div className="logo-holder">
          <Image
            src={logo}
            alt="Over Power Esports"
            width={84}
            height={84}
            priority
            className="op-logo"
          />
        </div>
      </div>

      <style jsx>{`
        .op-transition {
          position: fixed;
          inset: 0;
          z-index: 999999;
          isolation: isolate;
          overflow: hidden;
          display: grid;
          place-items: center;
          pointer-events: all;
          background: radial-gradient(circle at center, #0d0b19 0%, #04040b 34%, #010103 76%);
        }

        .center-light {
          position: absolute;
          z-index: 1;
          width: 215px;
          height: 215px;
          border-radius: 50%;
          pointer-events: none;
          background: conic-gradient(
            #fc488f, #a15bff, #399cff, #4bf7e0,
            #ffe3a1, #fc488f
          );
          opacity: .28;
          filter: blur(49px);
          animation: centerPulse 1.7s ease-in-out infinite alternate;
        }

        .filaments {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
        }

        .filament-track {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 160vmax;
          height: 1px;
          transform: rotate(var(--angle));
          transform-origin: left center;
          pointer-events: none;
        }

        .filament-line {
          display: block;
          width: 100%;
          height: 1px;
          transform: scaleX(0);
          transform-origin: left center;
          opacity: 0;
          background: linear-gradient(
            90deg,
            #ff6baf 0%,
            #ff52d7 14%,
            #a76bff 31%,
            #4c9dff 51%,
            #47ecff 67%,
            #94ffdf 81%,
            #ffd58d 95%,
            #ff6db4 100%
          );
          filter: hue-rotate(var(--shift))
            drop-shadow(0 0 3px rgba(169, 132, 255, .86));
          animation: threadOut 2.18s cubic-bezier(.17, .71, .21, 1)
            var(--delay) both;
        }

        .op-reverse .filament-line {
          animation: threadIn 2.18s cubic-bezier(.31, .02, .74, .45)
            var(--delay) both;
        }

        .logo-stage {
          position: relative;
          z-index: 5;
          display: grid;
          place-items: center;
          width: 132px;
          height: 132px;
          animation: logoEnter .65s cubic-bezier(.15,.78,.27,1) both;
        }

        .logo-holder {
          position: relative;
          z-index: 10;
          width: 84px;
          height: 84px;
          overflow: hidden;
          border-radius: 50%;
          background: #08070e;
          box-shadow:
            0 0 8px rgba(255, 255, 255, .23),
            0 0 24px rgba(132, 83, 255, .47),
            0 0 37px rgba(43, 208, 255, .18);
        }

        .outer-ring {
          position: absolute;
          z-index: 7;
          inset: 5px;
          border-radius: 50%;
          border: 1px solid rgba(146, 114, 255, .48);
          box-shadow:
            0 0 12px rgba(164, 83, 255, .4),
            inset 0 0 12px rgba(73, 195, 255, .16);
          animation: outerPulse 1.7s ease-in-out infinite alternate;
        }

        .inner-ring {
          position: absolute;
          z-index: 8;
          inset: 13px;
          border-radius: 50%;
          border: 2px solid transparent;
          background:
            linear-gradient(#06060c, #06060c) padding-box,
            conic-gradient(
              from 0deg,
              #f955b4, #a363ff, #499eff, #55f3e6,
              #f5d48b, #f955b4
            ) border-box;
          box-shadow: 0 0 16px rgba(147, 102, 255, .4);
          animation: ringSpin 3s linear infinite;
        }

        .op-reverse .inner-ring { animation-direction: reverse; }

        @keyframes threadOut {
          0% { transform: scaleX(0); opacity: 0; }
          9% { opacity: .95; }
          75% { transform: scaleX(1); opacity: 1; }
          100% { transform: scaleX(1); opacity: 0; }
        }

        @keyframes threadIn {
          0% { transform: scaleX(1); opacity: 0; }
          16% { opacity: .98; }
          90% { opacity: .95; }
          100% { transform: scaleX(0); opacity: 0; }
        }

        @keyframes centerPulse {
          from { transform: scale(.88); opacity: .17; }
          to { transform: scale(1.13); opacity: .36; }
        }

        @keyframes outerPulse {
          from { opacity: .6; transform: scale(.98); }
          to { opacity: 1; transform: scale(1.03); }
        }

        @keyframes ringSpin {
          to { transform: rotate(360deg); }
        }

        @keyframes logoEnter {
          from { transform: scale(.66); opacity: .1; }
          to { transform: scale(1); opacity: 1; }
        }

        @media (max-width: 600px) {
          .logo-stage { width: 114px; height: 114px; }
          .logo-holder { width: 74px; height: 74px; }
          .outer-ring { inset: 3px; }
          .inner-ring { inset: 11px; }
          .center-light { width: 170px; height: 170px; filter: blur(38px); }
          .filament-line { height: .85px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .center-light,
          .outer-ring,
          .inner-ring,
          .logo-stage,
          .filament-line { animation: none !important; }
          .filament-line { transform: scaleX(1); opacity: .68; }
        }
      `}</style>
    </div>
  );
}
