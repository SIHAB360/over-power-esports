"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import logo from "../assets/logo.png";

const TRANSITION_DURATION = 2300;
const RAY_COUNT = 32;
const RAY_PATH =
  "M 500 500 C 550 420, 590 580, 650 500 S 760 420, 820 500 S 910 580, 1000 500";

export default function PageTransition() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [reverse, setReverse] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      setReverse(true);
      setShow(true);

      window.setTimeout(() => {
        setShow(false);
      }, TRANSITION_DURATION);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (!window.history.state) return;

    setReverse(false);
    setShow(true);

    const timer = window.setTimeout(() => {
      setShow(false);
    }, TRANSITION_DURATION);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (!show) return null;

  return (
    <div className={`transition ${reverse ? "reverse" : ""}`} aria-hidden="true">
      <div className="ambient ambient-pink" />
      <div className="ambient ambient-violet" />
      <div className="ambient ambient-cyan" />
      <div className="background-glow" />

      <div className="threads">
        <svg
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
          role="presentation"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="op-energy-gradient"
              x1="500"
              y1="500"
              x2="1000"
              y2="500"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#ff3c78" stopOpacity="1" />
              <stop offset="17%" stopColor="#ff4fd8" />
              <stop offset="36%" stopColor="#a15bff" />
              <stop offset="55%" stopColor="#43a5ff" />
              <stop offset="70%" stopColor="#39e8ff" />
              <stop offset="86%" stopColor="#b0fff4" />
              <stop offset="96%" stopColor="#ffd078" />
              <stop offset="100%" stopColor="#ff4c9a" stopOpacity="0" />
            </linearGradient>

            <filter
              id="op-ray-blur"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation="3.5" result="softGlow" />
              <feMerge>
                <feMergeNode in="softGlow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {Array.from({ length: RAY_COUNT }).map((_, index) => (
            <g
              key={index}
              className="energy-ray"
              transform={`rotate(${(360 / RAY_COUNT) * index} 500 500)`}
              style={{
                "--delay": `${index * 0.0035}s`,
                "--hue": `${(index * 19) % 360}deg`,
              }}
            >
              <path
                className="ray-halo"
                d={RAY_PATH}
                pathLength={1}
                stroke="url(#op-energy-gradient)"
                filter="url(#op-ray-blur)"
              />
              <path
                className="ray-core"
                d={RAY_PATH}
                pathLength={1}
                stroke="url(#op-energy-gradient)"
              />
            </g>
          ))}
        </svg>
      </div>

      <div className="energy-flash" />

      <div className="orb">
        <div className="ring" />
        <div className="logo-holder">
          <Image
            src={logo}
            alt="OP Logo"
            width={84}
            height={84}
            className="logo"
            priority
          />
        </div>
      </div>

      <style jsx>{`
        .transition {
          position: fixed;
          inset: 0;
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          isolation: isolate;
          background:
            radial-gradient(ellipse at 18% 18%, rgba(255, 38, 112, 0.13), transparent 34%),
            radial-gradient(ellipse at 82% 20%, rgba(115, 45, 255, 0.15), transparent 37%),
            radial-gradient(ellipse at 55% 88%, rgba(28, 205, 255, 0.11), transparent 42%),
            #020207;
        }

        .ambient {
          position: absolute;
          width: min(58vw, 680px);
          height: min(58vw, 680px);
          border-radius: 50%;
          filter: blur(78px);
          mix-blend-mode: screen;
          pointer-events: none;
          opacity: 0.52;
          animation: ambientDrift 3.2s ease-in-out infinite alternate;
        }

        .ambient-pink {
          top: -32%;
          left: -16%;
          background: radial-gradient(circle, rgba(255, 35, 112, 0.48), transparent 68%);
        }

        .ambient-violet {
          top: -24%;
          right: -20%;
          background: radial-gradient(circle, rgba(132, 42, 255, 0.48), transparent 68%);
          animation-delay: -1.1s;
        }

        .ambient-cyan {
          bottom: -42%;
          left: 24%;
          background: radial-gradient(circle, rgba(30, 198, 255, 0.35), transparent 68%);
          animation-delay: -1.8s;
        }

        .background-glow {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: conic-gradient(
            from 0deg,
            rgba(255, 45, 125, 0.32),
            rgba(149, 63, 255, 0.3),
            rgba(43, 213, 255, 0.28),
            rgba(255, 211, 112, 0.22),
            rgba(255, 45, 125, 0.32)
          );
          filter: blur(64px);
          opacity: 0.58;
          animation: glowPulse 2.4s ease-in-out infinite alternate;
          pointer-events: none;
        }

        .threads {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
        }

        .threads svg {
          display: block;
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .energy-ray {
          opacity: 0;
          filter: hue-rotate(var(--hue));
          animation: rayFade 2.1s ease var(--delay) both;
        }

        .ray-halo,
        .ray-core {
          fill: none;
          stroke-linecap: round;
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: rayDraw 2.1s cubic-bezier(0.16, 0.72, 0.25, 1) var(--delay) both;
        }

        .ray-halo {
          stroke-width: 8;
          opacity: 0.5;
          filter: blur(2px) drop-shadow(0 0 12px rgba(255, 67, 193, 0.75));
        }

        .ray-core {
          stroke-width: 1.65;
          opacity: 1;
          filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.95))
            drop-shadow(0 0 12px rgba(81, 208, 255, 0.7));
        }

        .energy-flash {
          position: absolute;
          z-index: 3;
          width: 190px;
          height: 190px;
          border-radius: 50%;
          background: conic-gradient(
            from 0deg,
            transparent,
            rgba(255, 55, 151, 0.42),
            transparent 28%,
            rgba(131, 70, 255, 0.48),
            transparent 58%,
            rgba(43, 220, 255, 0.42),
            transparent 82%,
            rgba(255, 204, 112, 0.3),
            transparent
          );
          filter: blur(28px);
          opacity: 0.72;
          pointer-events: none;
          animation: corePulse 1.25s ease-in-out infinite alternate;
        }

        .orb {
          position: relative;
          z-index: 5;
          display: flex;
          width: 136px;
          height: 136px;
          align-items: center;
          justify-content: center;
          animation: logoAppear 0.85s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .logo-holder {
          position: relative;
          z-index: 10;
          width: 84px;
          height: 84px;
          overflow: hidden;
          border-radius: 50%;
          background: #05050b;
          box-shadow:
            0 0 12px rgba(255, 255, 255, 0.52),
            0 0 24px rgba(255, 48, 132, 0.82),
            0 0 42px rgba(142, 71, 255, 0.62),
            0 0 60px rgba(51, 211, 255, 0.28);
        }

        .logo {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .ring {
          position: absolute;
          inset: 8px;
          z-index: 8;
          border: 2px solid transparent;
          border-radius: 50%;
          background:
            linear-gradient(#05050b, #05050b) padding-box,
            conic-gradient(
              from 0deg,
              #ff3b87,
              #a14dff,
              #42baff,
              #66fff0,
              #fff4cf,
              #ff7a45,
              #ff3b87
            ) border-box;
          box-shadow:
            0 0 14px rgba(255, 50, 140, 0.85),
            0 0 28px rgba(145, 67, 255, 0.52),
            0 0 38px rgba(56, 218, 255, 0.32);
          animation: rotate 2.1s linear infinite;
        }

        .reverse .energy-ray {
          animation: rayFadeBack 2.1s ease both;
        }

        .reverse .ray-halo,
        .reverse .ray-core {
          animation: rayRetract 2.1s cubic-bezier(0.55, 0, 0.8, 0.35) both;
        }

        .reverse .orb {
          animation: logoDisappear 0.65s ease-in both;
        }

        .reverse .ring {
          animation-direction: reverse;
        }

        @keyframes rayDraw {
          0% {
            stroke-dashoffset: 1;
            opacity: 0;
          }
          13% {
            opacity: 1;
          }
          68% {
            stroke-dashoffset: 0.2;
            opacity: 0.95;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0;
          }
        }

        @keyframes rayRetract {
          0% {
            stroke-dashoffset: 0;
            opacity: 0.95;
          }
          25% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 1;
            opacity: 0;
          }
        }

        @keyframes rayFade {
          0% {
            opacity: 0;
          }
          12% {
            opacity: 1;
          }
          74% {
            opacity: 0.95;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes rayFadeBack {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes rotate {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes logoAppear {
          0% {
            transform: scale(0.56);
            opacity: 0;
          }
          72% {
            transform: scale(1.045);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes logoDisappear {
          to {
            transform: scale(0.72);
            opacity: 0.35;
          }
        }

        @keyframes glowPulse {
          from {
            transform: scale(0.88) rotate(0deg);
            opacity: 0.38;
          }
          to {
            transform: scale(1.12) rotate(24deg);
            opacity: 0.72;
          }
        }

        @keyframes corePulse {
          from {
            transform: scale(0.82) rotate(0deg);
            opacity: 0.4;
          }
          to {
            transform: scale(1.16) rotate(24deg);
            opacity: 0.85;
          }
        }

        @keyframes ambientDrift {
          from {
            transform: translate3d(-2%, -1%, 0) scale(0.92);
          }
          to {
            transform: translate3d(3%, 2%, 0) scale(1.08);
          }
        }

        @media (max-width: 600px) {
          .orb {
            width: 120px;
            height: 120px;
          }

          .logo-holder {
            width: 74px;
            height: 74px;
          }

          .ring {
            inset: 8px;
          }

          .ambient {
            width: 82vw;
            height: 82vw;
            filter: blur(58px);
          }

          .background-glow {
            width: 230px;
            height: 230px;
            filter: blur(54px);
          }

          .energy-flash {
            width: 150px;
            height: 150px;
          }

          .ray-halo {
            stroke-width: 10;
          }

          .ray-core {
            stroke-width: 2;
          }
        }
      `}</style>
    </div>
  );
}
