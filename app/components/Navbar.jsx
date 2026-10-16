"use client";

import { useEffect, useState } from "react";
import SideMenu from "./SideMenu";

const navItems = [
  { name: "HOME", target: "home" },
  { name: "ROSTER", target: "players" },
  { name: "LEADERSHIP", target: "leadership" },
  { name: "SCHEDULE", target: "tournaments" },
  { name: "ACHIEVEMENTS", target: "achievements" },
  { name: "CONTACT", target: "opx-connect" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    const sections = navItems
      .map((item) => document.getElementById(item.target))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target?.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        rootMargin: "-30% 0px -55% 0px",
        threshold: [0.05, 0.2, 0.45, 0.7],
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  const scrollToSection = (event, target) => {
    event.preventDefault();

    const element = document.getElementById(target);
    if (!element) return;

    const offset = window.innerWidth <= 768 ? 78 : 104;
    const top =
      element.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: "smooth",
    });

    setActiveSection(target);
    setMenuOpen(false);
  };

  return (
    <>
      <nav className={`op-navbar ${scrolled ? "scrolled" : ""}`} aria-label="Primary navigation">
        <div className="light-beam" aria-hidden="true"></div>
        <div className="energy-line" aria-hidden="true"></div>

        <a
          href="#home"
          className="op-logo"
          onClick={(event) => scrollToSection(event, "home")}
          aria-label="Over Power Esports Home"
        >
          OVER POWER <span>ESPORTS</span>
        </a>

        <div className="op-nav-links">
          {navItems.map((item) => (
            <a
              key={item.target}
              href={`#${item.target}`}
              className={activeSection === item.target ? "active" : ""}
              onClick={(event) => scrollToSection(event, item.target)}
            >
              <span className="nav-glow" aria-hidden="true"></span>
              {item.name}
            </a>
          ))}
        </div>

        <div className="op-actions">
          <a href="/login" className="op-login">
            LOGIN
          </a>

          <button
            className="op-menu-btn"
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      <SideMenu
        open={menuOpen}
        close={() => setMenuOpen(false)}
      />

      <style jsx>{`
        .op-navbar,
        .op-navbar * {
          box-sizing: border-box;
        }

        .op-navbar {
          position: fixed;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100vw;
          max-width: none;
          height: 78px;
          display: flex;
          align-items: center;
          gap: 28px;
          padding: 0 38px;
          z-index: 9999;
          background:
            linear-gradient(
              180deg,
              rgba(8, 8, 12, 0.94),
              rgba(8, 5, 10, 0.72)
            );
          border-bottom: 1px solid rgba(255, 35, 82, 0.22);
          box-shadow:
            0 10px 35px rgba(0, 0, 0, 0.28),
            inset 0 1px rgba(255, 255, 255, 0.045);
          backdrop-filter: blur(22px) saturate(150%);
          transition:
            top 0.45s ease,
            width 0.45s ease,
            height 0.45s ease,
            border-radius 0.45s ease,
            background 0.45s ease,
            box-shadow 0.45s ease;
          overflow: hidden;
        }

        .op-navbar.scrolled {
          top: 12px;
          width: calc(100% - 32px);
          height: 68px;
          border-radius: 22px;
          background:
            linear-gradient(
              110deg,
              rgba(13, 7, 12, 0.92),
              rgba(7, 10, 18, 0.9),
              rgba(12, 7, 17, 0.92)
            );
          border: 1px solid rgba(255, 48, 93, 0.42);
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.025) inset,
            0 15px 50px rgba(0, 0, 0, 0.45),
            0 0 42px rgba(255, 20, 76, 0.18);
        }

        .light-beam {
          position: absolute;
          top: -100px;
          left: -260px;
          width: 310px;
          height: 230px;
          pointer-events: none;
          background:
            radial-gradient(
              circle,
              rgba(255, 20, 70, 0.34),
              transparent 70%
            );
          filter: blur(28px);
          animation: moveLight 7s linear infinite;
        }

        .energy-line {
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 1px;
          pointer-events: none;
          background:
            linear-gradient(
              90deg,
              transparent 0%,
              rgba(255, 40, 87, 0.25) 15%,
              #ff355f 35%,
              #ffd18b 50%,
              #7eefff 65%,
              rgba(255, 40, 87, 0.25) 85%,
              transparent 100%
            );
          background-size: 240% 100%;
          animation: lineMove 6s linear infinite;
          box-shadow: 0 0 14px rgba(255, 72, 116, 0.5);
        }

        .op-logo {
          position: relative;
          z-index: 3;
          flex: 0 0 auto;
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
          color: #fff !important;
          text-decoration: none !important;
          font-size: 18px;
          font-weight: 950;
          letter-spacing: 2.8px;
          text-shadow: 0 0 18px rgba(255, 255, 255, 0.22);
          transition: transform 0.25s ease, filter 0.25s ease;
        }

        .op-logo:hover {
          transform: translateY(-1px);
          filter: drop-shadow(0 0 13px rgba(255, 54, 101, 0.32));
        }

        .op-logo span {
          margin-left: 7px;
          color: #ff355f;
          text-shadow:
            0 0 13px rgba(255, 35, 83, 0.9),
            0 0 28px rgba(255, 35, 83, 0.35);
        }

        .op-nav-links {
          position: relative;
          z-index: 3;
          min-width: 0;
          flex: 1 1 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(7px, 1.25vw, 23px);
        }

        .op-nav-links a {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 40px;
          padding: 0 7px;
          color: rgba(229, 229, 238, 0.78) !important;
          text-decoration: none !important;
          font-size: clamp(9px, 0.76vw, 12px);
          font-weight: 900;
          letter-spacing: 0.55px;
          white-space: nowrap;
          transition:
            color 0.25s ease,
            transform 0.25s ease,
            text-shadow 0.25s ease;
        }

        .op-nav-links a::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: 2px;
          width: 0;
          height: 2px;
          border-radius: 99px;
          transform: translateX(-50%);
          background: linear-gradient(90deg, #ff3564, #ff9a83, #8eefff);
          box-shadow:
            0 0 9px rgba(255, 58, 103, 0.8),
            0 0 18px rgba(124, 229, 255, 0.35);
          transition: width 0.28s ease;
        }

        .op-nav-links a:hover,
        .op-nav-links a.active {
          color: #fff !important;
          transform: translateY(-1px);
          text-shadow:
            0 0 11px rgba(255, 255, 255, 0.28),
            0 0 19px rgba(255, 65, 110, 0.22);
        }

        .op-nav-links a:hover::after,
        .op-nav-links a.active::after {
          width: calc(100% - 12px);
        }

        .nav-glow {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 45px;
          height: 20px;
          transform: translate(-50%, -50%);
          pointer-events: none;
          background: radial-gradient(
            ellipse,
            rgba(255, 43, 91, 0.17),
            transparent 72%
          );
          filter: blur(8px);
          opacity: 0;
          transition: opacity 0.25s ease;
        }

        .op-nav-links a:hover .nav-glow,
        .op-nav-links a.active .nav-glow {
          opacity: 1;
        }

        .op-actions {
          position: relative;
          z-index: 3;
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .op-login {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 88px;
          height: 38px;
          padding: 0 18px;
          border-radius: 999px;
          color: #fff !important;
          text-decoration: none !important;
          border: 1px solid rgba(255, 52, 93, 0.62);
          background:
            linear-gradient(
              180deg,
              rgba(255, 36, 80, 0.18),
              rgba(255, 20, 64, 0.06)
            );
          box-shadow:
            0 0 18px rgba(255, 27, 74, 0.24),
            inset 0 1px rgba(255, 255, 255, 0.08);
          font-size: 10px;
          font-weight: 950;
          letter-spacing: 2px;
          transition:
            transform 0.25s ease,
            background 0.25s ease,
            box-shadow 0.25s ease;
        }

        .op-login:hover {
          transform: translateY(-2px);
          background: linear-gradient(180deg, #ff2c57, #d80c3d);
          box-shadow:
            0 0 28px rgba(255, 29, 72, 0.6),
            0 7px 20px rgba(0, 0, 0, 0.25);
        }

        .op-menu-btn {
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          border-radius: 50%;
          border: 1px solid rgba(255, 44, 91, 0.62);
          background:
            radial-gradient(
              circle at 35% 25%,
              rgba(255, 81, 118, 0.22),
              rgba(255, 0, 55, 0.08)
            );
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          box-shadow:
            0 0 19px rgba(255, 20, 65, 0.32),
            inset 0 1px rgba(255, 255, 255, 0.08);
          transition:
            transform 0.35s ease,
            background 0.3s ease,
            box-shadow 0.3s ease;
        }

        .op-menu-btn span {
          width: 17px;
          height: 1.5px;
          border-radius: 99px;
          background: #fff;
          box-shadow: 0 0 7px rgba(255, 255, 255, 0.3);
          transition: transform 0.3s ease;
        }

        .op-menu-btn:hover {
          transform: rotate(180deg) scale(1.08);
          background: #ec1647;
          box-shadow:
            0 0 32px rgba(255, 18, 67, 0.7),
            inset 0 0 16px rgba(255, 255, 255, 0.1);
        }

        @keyframes moveLight {
          from { left: -260px; }
          to { left: 110%; }
        }

        @keyframes lineMove {
          from { background-position: 0% 0; }
          to { background-position: 240% 0; }
        }

        @media (max-width: 1180px) {
          .op-navbar {
            padding: 0 24px;
            gap: 16px;
          }

          .op-logo {
            font-size: 16px;
            letter-spacing: 2px;
          }

          .op-nav-links {
            gap: 4px;
          }

          .op-nav-links a {
            padding: 0 5px;
            font-size: 9px;
            letter-spacing: 0.35px;
          }

          .op-login {
            min-width: 76px;
            padding: 0 13px;
          }
        }

        @media (max-width: 900px) {
          .op-navbar {
            height: 72px;
          }

          .op-nav-links {
            display: none;
          }

          .op-logo {
            font-size: 16px;
          }

          .op-actions {
            margin-left: auto;
          }
        }

        @media (max-width: 768px) {
          .op-navbar {
            height: 68px;
            padding: 0 15px;
          }

          .op-navbar.scrolled {
            top: 8px;
            width: calc(100% - 18px);
            height: 62px;
            border-radius: 18px;
          }

          .op-logo {
            font-size: 13px;
            letter-spacing: 1.5px;
          }

          .op-logo span {
            margin-left: 5px;
          }

          .op-actions {
            gap: 8px;
          }

          .op-login {
            min-width: 67px;
            height: 32px;
            padding: 0 11px;
            font-size: 9px;
            letter-spacing: 1.5px;
          }

          .op-menu-btn {
            width: 36px;
            height: 36px;
            flex-basis: 36px;
          }

          .op-menu-btn span {
            width: 15px;
          }
        }

        @media (max-width: 360px) {
          .op-logo {
            font-size: 11px;
            letter-spacing: 1px;
          }

          .op-login {
            min-width: 60px;
            padding: 0 8px;
            font-size: 8px;
          }
        }
      `}</style>
    </>
  );
}
