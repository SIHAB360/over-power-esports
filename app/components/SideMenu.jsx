"use client";

import Link from "next/link";

export default function SideMenu({ open, close }) {
  const menus = [
    { name: "HOME", href: "/#home" },
    { name: "ROSTER", href: "/#players" },
    { name: "LEADERSHIP", href: "/#leadership" },
    { name: "SCHEDULE", href: "/#tournaments" },
    { name: "ACHIEVEMENTS", href: "/#achievements" },
    { name: "CONTACT", href: "/#opx-connect" },
    { name: "MEMBER LOGIN", href: "/login" },
  ];

  return (
    <>
      {open && <div className="op-overlay" onClick={close} aria-hidden="true" />}

      <aside className={`op-side-menu ${open ? "open" : ""}`} aria-label="Main navigation">
        <button
          type="button"
          className="op-close"
          onClick={close}
          aria-label="Close navigation menu"
        >
          ×
        </button>

        <div className="op-side-logo" aria-label="Over Power Esports">
          <span className="op-brand-main">OVER POWER</span>
          <span className="op-brand-accent">ESPORTS</span>
          <div className="logo-line" />
        </div>

        <nav className="op-menu-links" aria-label="Section links">
          {menus.map((item, index) => (
            <Link
              className="op-menu-item"
              href={item.href}
              key={item.href}
              onClick={close}
              style={{ "--menu-index": index }}
            >
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="op-side-footer">
          <span className="op-footer-mark">OP</span>
          <span className="op-footer-copy">
            OVER POWER ESPORTS
            <small>PLAY WITH DISCIPLINE</small>
          </span>
        </div>
      </aside>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .op-overlay {
          position: fixed;
          inset: 0;
          z-index: 9998;
          background: rgba(1, 2, 8, .76);
          -webkit-backdrop-filter: blur(9px);
          backdrop-filter: blur(9px);
          animation: opOverlayIn .22s ease both;
        }

        .op-side-menu {
          position: fixed;
          z-index: 9999;
          top: 16px;
          left: -460px;
          display: flex;
          flex-direction: column;
          width: min(420px, calc(100vw - 32px));
          height: calc(100dvh - 32px);
          padding: 25px 22px 20px;
          overflow-x: hidden;
          overflow-y: auto;
          overscroll-behavior: contain;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 72, 120, .5) transparent;
          border: 1px solid rgba(255, 76, 125, .42);
          border-radius: 26px;
          background:
            radial-gradient(ellipse at 0% 0%, rgba(255, 35, 88, .2), transparent 43%),
            radial-gradient(ellipse at 100% 75%, rgba(66, 117, 255, .11), transparent 43%),
            linear-gradient(150deg, #180711 0%, #0b0812 54%, #05070e 100%);
          box-shadow:
            0 28px 90px rgba(0, 0, 0, .7),
            0 0 42px rgba(255, 30, 86, .2),
            inset 0 1px 0 rgba(255, 255, 255, .09);
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition:
            left .42s cubic-bezier(.2, .85, .25, 1),
            opacity .28s ease,
            visibility .28s ease,
            box-shadow .3s ease;
        }

        .op-side-menu.open {
          left: 16px;
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }

        .op-side-menu::before {
          content: "";
          position: absolute;
          z-index: 0;
          top: 0;
          bottom: 0;
          left: 0;
          width: 2px;
          pointer-events: none;
          background: linear-gradient(
            180deg,
            transparent 0%,
            #ff426f 18%,
            #ffb4c7 48%,
            #ff426f 78%,
            transparent 100%
          );
          box-shadow: 0 0 18px rgba(255, 49, 95, .8);
          opacity: .9;
        }

        .op-side-menu::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 0;
          padding: 1px;
          border-radius: inherit;
          pointer-events: none;
          background: linear-gradient(
            125deg,
            rgba(255, 100, 145, .95),
            rgba(255, 255, 255, .05) 28%,
            rgba(112, 218, 255, .55) 68%,
            rgba(255, 58, 108, .8)
          );
          background-size: 250% 250%;
          animation: opPanelBorder 7s ease-in-out infinite;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }

        .op-close {
          position: absolute;
          z-index: 2;
          top: 17px;
          right: 17px;
          display: grid;
          place-items: center;
          width: 43px;
          height: 43px;
          padding: 0;
          border: 1px solid rgba(255, 85, 129, .72);
          border-radius: 50%;
          color: #fff;
          background: linear-gradient(145deg, rgba(255,255,255,.1), rgba(255, 40, 91, .15));
          box-shadow: 0 0 19px rgba(255, 49, 95, .22), inset 0 1px rgba(255,255,255,.1);
          font-size: 28px;
          line-height: 1;
          cursor: pointer;
          transition: transform .24s ease, background .24s ease, box-shadow .24s ease;
        }

        .op-close:hover,
        .op-close:focus-visible {
          transform: rotate(90deg);
          outline: none;
          background: #ed1748;
          box-shadow: 0 0 28px rgba(255, 35, 88, .65);
        }

        .op-side-logo {
          position: relative;
          z-index: 1;
          display: flex;
          flex: 0 0 auto;
          flex-direction: column;
          align-items: flex-start;
          width: fit-content;
          margin: 30px 0 27px;
          line-height: 1.03;
        }

        .op-side-logo .op-brand-main {
          color: #fff;
          font-size: clamp(24px, 6vw, 30px);
          font-weight: 1000;
          letter-spacing: 2px;
          text-shadow: 0 0 17px rgba(255, 255, 255, .17);
        }

        .op-side-logo .op-brand-accent {
          margin-top: 5px;
          color: #ff3c70;
          font-size: clamp(27px, 6.4vw, 33px);
          font-weight: 1000;
          letter-spacing: 4px;
          text-shadow: 0 0 13px rgba(255, 49, 95, .75), 0 0 32px rgba(255, 49, 95, .28);
        }

        .logo-line {
          width: 120px;
          height: 2px;
          margin-top: 15px;
          border-radius: 3px;
          background: linear-gradient(90deg, #ff315f, #ffb1c7 55%, transparent);
          box-shadow: 0 0 15px rgba(255, 49, 95, .7);
          animation: opLogoGlow 2.8s ease-in-out infinite;
        }

        .op-menu-links {
          position: relative;
          z-index: 1;
          display: flex;
          flex: 0 0 auto;
          flex-direction: column;
          gap: 11px;
          width: 100%;
          margin: 0;
          padding: 0 1px 14px;
        }

        :global(.op-menu-item) {
          position: relative;
          isolation: isolate;
          display: flex !important;
          align-items: center !important;
          justify-content: flex-start !important;
          width: 100%;
          min-width: 0;
          min-height: 52px;
          padding: 0 17px;
          overflow: hidden;
          border: 1px solid rgba(255, 75, 119, .48) !important;
          border-radius: 13px;
          color: #fff5f8 !important;
          background: linear-gradient(105deg, rgba(255, 44, 93, .15), rgba(255,255,255,.035) 58%, rgba(82, 145, 255, .07)) !important;
          box-shadow: 0 0 13px rgba(255, 40, 91, .15), inset 0 0 13px rgba(255, 40, 91, .045);
          text-align: left;
          text-decoration: none !important;
          -webkit-tap-highlight-color: transparent;
          animation: opMenuBorderPulse 3s ease-in-out infinite;
          animation-delay: calc(var(--menu-index, 0) * .18s);
          transition: transform .22s ease, border-color .22s ease, background .22s ease, box-shadow .22s ease;
        }

        :global(.op-menu-item::before) {
          content: "";
          position: absolute;
          z-index: -1;
          inset: 0;
          pointer-events: none;
          opacity: .3;
          background: linear-gradient(105deg, rgba(255, 42, 94, .42), transparent 65%, rgba(98, 220, 255, .2));
          transition: opacity .22s ease;
        }

        :global(.op-menu-item::after) {
          content: "";
          position: absolute;
          top: 17%;
          bottom: 17%;
          left: 0;
          width: 2px;
          border-radius: 3px;
          pointer-events: none;
          background: linear-gradient(180deg, #ffc4d4, #ff315f, #79e7ff);
          box-shadow: 0 0 12px rgba(255, 49, 95, .8);
        }

        :global(.op-menu-item span) {
          position: relative;
          z-index: 1;
          display: block;
          width: 100%;
          color: #fff5f8 !important;
          font-size: 13px;
          line-height: 1.2;
          font-weight: 950;
          letter-spacing: 2px;
          text-shadow: 0 0 10px rgba(255, 73, 119, .4);
          transition: color .22s ease, text-shadow .22s ease, letter-spacing .22s ease;
        }

        :global(.op-menu-item:hover),
        :global(.op-menu-item:focus-visible) {
          transform: translateX(4px);
          border-color: rgba(255, 177, 199, .98) !important;
          background: linear-gradient(100deg, rgba(255, 38, 91, .31), rgba(255,255,255,.065) 62%, rgba(97, 218, 255, .13)) !important;
          box-shadow: 0 0 24px rgba(255, 42, 95, .34), 0 0 8px rgba(105, 225, 255, .13), inset 0 0 18px rgba(255, 42, 95, .11);
          outline: none;
          animation-play-state: paused;
        }

        :global(.op-menu-item:hover::before),
        :global(.op-menu-item:focus-visible::before) {
          opacity: .85;
        }

        :global(.op-menu-item:hover span),
        :global(.op-menu-item:focus-visible span) {
          color: #fff !important;
          letter-spacing: 2.35px;
          text-shadow: 0 0 8px #ff6c96, 0 0 20px rgba(255, 49, 95, .85);
        }

        :global(.op-menu-item:last-child) {
          border-color: rgba(255, 130, 162, .72) !important;
          background: linear-gradient(100deg, rgba(255, 49, 95, .24), rgba(255,255,255,.04)) !important;
        }

        .op-side-footer {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: auto;
          padding: 18px 0 0 2px;
          border-top: 1px solid rgba(255, 255, 255, .09);
        }

        .op-footer-mark {
          display: grid;
          flex: 0 0 36px;
          place-items: center;
          width: 36px;
          height: 36px;
          border: 1px solid rgba(255, 86, 126, .45);
          border-radius: 50%;
          color: #ff789a;
          font-size: 12px;
          font-weight: 950;
          box-shadow: 0 0 15px rgba(255, 49, 95, .15);
        }

        .op-footer-copy {
          display: flex;
          flex-direction: column;
          gap: 4px;
          color: #c4b7c4;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.25px;
          line-height: 1.35;
        }

        .op-footer-copy small {
          color: #8f8495;
          font-size: 9px;
          letter-spacing: 1.4px;
        }

        @keyframes opOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes opPanelBorder {
          0%, 100% { background-position: 0% 50%; opacity: .72; }
          50% { background-position: 100% 50%; opacity: 1; }
        }

        @keyframes opLogoGlow {
          0%, 100% { opacity: .75; box-shadow: 0 0 10px rgba(255, 49, 95, .35); }
          50% { opacity: 1; box-shadow: 0 0 19px rgba(255, 49, 95, .8); }
        }

        @keyframes opMenuBorderPulse {
          0%, 100% {
            border-color: rgba(255, 75, 119, .45);
            box-shadow: 0 0 10px rgba(255, 40, 91, .12), inset 0 0 10px rgba(255, 40, 91, .03);
          }
          50% {
            border-color: rgba(255, 159, 187, .9);
            box-shadow: 0 0 21px rgba(255, 40, 91, .27), inset 0 0 15px rgba(255, 40, 91, .07);
          }
        }

        @media (max-width: 600px) {
          .op-side-menu {
            top: 12px;
            left: calc(-100vw - 24px);
            width: calc(100vw - 24px);
            height: calc(100dvh - 24px);
            padding: 22px 17px 16px;
            border-radius: 24px;
          }

          .op-side-menu.open { left: 12px; }
          .op-side-logo { margin-top: 25px; margin-bottom: 23px; }
          .op-menu-links { gap: 9px; }
          :global(.op-menu-item) { min-height: 49px; padding: 0 14px; }
          :global(.op-menu-item span) { font-size: 12px; letter-spacing: 1.8px; }
        }

        @media (max-height: 700px) {
          .op-side-menu { padding-top: 15px; padding-bottom: 12px; }
          .op-side-logo { margin-top: 16px; margin-bottom: 15px; }
          .op-menu-links { gap: 6px; }
          :global(.op-menu-item) { min-height: 42px; }
          .op-side-footer { padding-top: 10px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .op-side-menu,
          .op-side-menu::after,
          .op-side-menu *,
          :global(.op-menu-item) {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
}
