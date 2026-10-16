"use client";
import Link from "next/link";

export default function SideMenu({ open, close }) {
  const menus = [
    { name: "HOME", href: "/#home", detail: "Return to base", number: "01" },
    { name: "ROSTER", href: "/#players", detail: "Meet the squad", number: "02" },
    { name: "LEADERSHIP", href: "/#leadership", detail: "The people behind OP", number: "03" },
    { name: "SCHEDULE", href: "/#tournaments", detail: "Upcoming competition", number: "04" },
    { name: "ACHIEVEMENTS", href: "/#achievements", detail: "Moments of glory", number: "05" },
    { name: "CONTACT", href: "/#opx-connect", detail: "Connect with the team", number: "06" },
    { name: "LOGIN", href: "/login", detail: "Enter the player portal", number: "07" },
  ];

  return (
    <>
      {open && (
        <div
          className="op-overlay"
          onClick={close}
        />
      )}

      <aside className={`op-side-menu ${open ? "open" : ""}`}>
        <button
          className="op-close"
          onClick={close}
        >
          ×
        </button>

        <div className="op-menu-topline">
          <span className="op-menu-live"><i /> NAVIGATION SYSTEM</span>
          <span className="op-menu-index">OP / 07</span>
        </div>

        <div className="op-side-logo">
          <span className="op-brand-main">OVER POWER</span>
          <span className="op-brand-accent">ESPORTS</span>
          <div className="logo-line"></div>
        </div>

        <p className="op-menu-caption">CHOOSE YOUR DESTINATION</p>

        <nav className="op-menu-links" aria-label="Section links">
          {menus.map((item) => (
            <Link href={item.href} key={item.href} onClick={close}>
              <span className="op-link-number">{item.number}</span>
              <span className="op-link-copy">
                <strong>{item.name === "LOGIN" ? "MEMBER LOGIN" : item.name}</strong>
                <small>{item.detail}</small>
              </span>
              <span className="op-link-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </nav>

        <div className="op-side-footer">
          OVER POWER ESPORTS
          <br />
          PLAY WITH DISCIPLINE
        </div>

        <style jsx>{`
          * {
            box-sizing: border-box;
          }

          /* OVERLAY */
          .op-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(14px);
            z-index: 9998;
            animation: fadeIn 0.35s ease;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          /* GLASS PANEL */
          .op-side-menu {
            position: fixed;
            top: 40px;
            left: -440px;
            width: 360px;
            height: calc(100vh - 80px);
            padding: 70px 32px 40px;
            border-radius: 32px;
            background: linear-gradient(
              145deg,
              rgba(40, 0, 15, 0.92),
              rgba(15, 0, 8, 0.95)
            );
            backdrop-filter: blur(40px) saturate(180%);
            border: 1px solid rgba(255, 30, 70, 0.25);
            box-shadow:
              0 0 80px rgba(255, 0, 60, 0.25),
              0 25px 60px rgba(0, 0, 0, 0.6),
              inset 0 1px 0 rgba(255, 255, 255, 0.08),
              inset 0 0 60px rgba(255, 0, 60, 0.06);
            transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
            z-index: 9999;
            overflow: hidden;
          }

          .op-side-menu.open {
            left: 24px;
          }

          /* Soft red glow on the left edge */
          .op-side-menu::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(
              to bottom,
              transparent,
              #ff1744,
              #ff1744,
              transparent
            );
            box-shadow: 0 0 30px #ff1744;
            opacity: 0.8;
          }

          /* CLOSE BUTTON */
          .op-close {
            position: absolute;
            top: 22px;
            right: 22px;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            border: 1px solid rgba(255, 23, 68, 0.6);
            background: rgba(255, 255, 255, 0.06);
            color: #fff;
            font-size: 30px;
            line-height: 1;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 25px rgba(255, 0, 60, 0.35);
            transition: all 0.3s ease;
          }

          .op-close:hover {
            transform: rotate(90deg) scale(1.08);
            background: #ff1744;
            border-color: #ff1744;
            box-shadow: 0 0 35px rgba(255, 0, 60, 0.7);
          }

          /* LOGO */
          .op-side-logo {
            font-size: 26px;
            font-weight: 900;
            letter-spacing: 3px;
            color: #ffffff;
            line-height: 1.15;
          }

          .op-side-logo span {
            display: block;
            color: #ff1744;
            text-shadow:
              0 0 20px #ff1744,
              0 0 40px rgba(255, 23, 68, 0.5);
          }

          .logo-line {
            width: 110px;
            height: 3px;
            margin-top: 16px;
            border-radius: 4px;
            background: linear-gradient(
              90deg,
              #ff1744 0%,
              rgba(255, 23, 68, 0.3) 70%,
              transparent 100%
            );
            box-shadow: 0 0 18px rgba(255, 23, 68, 0.6);
          }

          /* MENU LINKS */
          .op-menu-links {
            margin-top: 50px;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .op-menu-links a {
            height: 54px;
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 0 20px;
            border-radius: 16px;
            color: #ffffff !important;
            text-decoration: none !important;
            font-size: 16px;
            font-weight: 700;
            letter-spacing: 1.8px;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(12px);
            transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
            position: relative;
            overflow: hidden;
          }

          .op-menu-links a::before {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(
              90deg,
              rgba(255, 23, 68, 0.15),
              transparent
            );
            opacity: 0;
            transition: opacity 0.3s ease;
          }

          .op-menu-links a:hover {
            transform: translateX(10px);
            color: #ff1744 !important;
            border-color: rgba(255, 23, 68, 0.5);
            background: rgba(255, 23, 68, 0.1);
            box-shadow:
              0 0 30px rgba(255, 0, 60, 0.35),
              inset 0 0 20px rgba(255, 0, 60, 0.08);
          }

          .op-menu-links a:hover::before {
            opacity: 1;
          }

          .menu-dot {
            width: 9px;
            height: 9px;
            border-radius: 50%;
            background: #ff1744;
            box-shadow: 0 0 12px #ff1744;
            flex-shrink: 0;
            animation: blink 1.8s infinite ease-in-out;
          }

          @keyframes blink {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.35;
              transform: scale(0.7);
            }
          }

          /* FOOTER */
          .op-side-footer {
            position: absolute;
            bottom: 32px;
            left: 32px;
            right: 32px;
            font-size: 11px;
            letter-spacing: 2.5px;
            color: rgba(255, 255, 255, 0.35);
            line-height: 1.6;
            text-align: left;
          }

          /* Responsive */
          @media (max-width: 600px) {
            .op-side-menu {
              width: calc(100% - 32px);
              left: -100%;
              top: 20px;
              height: calc(100vh - 40px);
            }
            .op-side-menu.open {
              left: 16px;
            }
          }

          /* Premium esports menu refresh */
          .op-overlay {
            background: rgba(2, 3, 8, .78);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
          }

          .op-side-menu {
            top: 18px;
            left: -430px;
            width: min(390px, calc(100vw - 36px));
            height: calc(100dvh - 36px);
            padding: 25px 22px 20px;
            border-radius: 27px;
            border-color: rgba(255, 76, 118, .38);
            background:
              radial-gradient(ellipse at 0% 0%, rgba(255, 35, 85, .19), transparent 42%),
              radial-gradient(ellipse at 100% 55%, rgba(65, 116, 255, .08), transparent 48%),
              linear-gradient(155deg, rgba(20, 8, 18, .99), rgba(5, 6, 13, .99) 70%);
            box-shadow: 0 30px 100px rgba(0,0,0,.65), 0 0 55px rgba(255,35,85,.17), inset 0 1px rgba(255,255,255,.08);
            transition: left .48s cubic-bezier(.2,.85,.25,1), box-shadow .3s ease;
          }

          .op-side-menu.open { left: 18px; }

          .op-side-menu::before {
            width: 2px;
            background: linear-gradient(180deg, transparent, #ff315f 18%, #ff9a85 48%, #ff315f 78%, transparent);
            box-shadow: 0 0 22px rgba(255,49,95,.8);
          }

          .op-menu-topline {
            display: flex; align-items: center; justify-content: space-between; gap: 10px;
            padding: 0 58px 20px 0;
            border-bottom: 1px solid rgba(255,255,255,.1);
            color: #b7aab8; font-size: 9px; font-weight: 900; letter-spacing: 1.5px;
          }
          .op-menu-live { display: inline-flex; align-items: center; gap: 8px; }
          .op-menu-live i {
            display: inline-block; width: 7px; height: 7px; border-radius: 50%;
            background: #ff5278; box-shadow: 0 0 12px #ff315f; animation: blink 1.8s infinite ease-in-out;
          }
          .op-menu-index { color: #ffb3c4; }

          .op-close {
            top: 18px; right: 17px; width: 43px; height: 43px;
            border-color: rgba(255,73,114,.62);
            background: linear-gradient(145deg, rgba(255,255,255,.09), rgba(255,49,95,.12));
            box-shadow: 0 0 24px rgba(255,49,95,.18), inset 0 1px rgba(255,255,255,.1);
          }

          .op-side-logo {
            display: flex; flex-direction: column; align-items: flex-start;
            width: fit-content; margin-top: 27px; line-height: 1.02;
          }
          .op-side-logo .op-brand-main {
            color: #fff; font-size: clamp(23px, 6vw, 29px);
            font-weight: 1000; letter-spacing: 2.1px;
            text-shadow: 0 0 18px rgba(255,255,255,.15);
          }
          .op-side-logo .op-brand-accent {
            margin-top: 5px; color: #ff315f; font-size: clamp(25px, 6.3vw, 32px);
            font-weight: 1000; letter-spacing: 4px;
            text-shadow: 0 0 14px rgba(255,49,95,.7), 0 0 35px rgba(255,49,95,.22);
          }
          .logo-line {
            width: 120px; height: 2px; margin-top: 15px;
            background: linear-gradient(90deg, #ff315f, #ff9c9d, transparent);
            box-shadow: 0 0 16px rgba(255,49,95,.7);
          }

          .op-menu-caption {
            margin: 25px 0 11px; color: #8e8295;
            font-size: 9px; font-weight: 900; letter-spacing: 2px;
          }

          .op-menu-links { margin-top: 0; gap: 8px; }
          .op-menu-links a {
            position: relative; isolation: isolate; gap: 13px;
            min-height: 55px; height: auto; padding: 8px 13px;
            border: 1px solid rgba(255,255,255,.075); border-radius: 14px;
            background: linear-gradient(110deg, rgba(255,255,255,.045), rgba(255,255,255,.012));
            box-shadow: inset 0 1px rgba(255,255,255,.025);
            transition: transform .24s ease, border-color .24s ease, background .24s ease, box-shadow .24s ease;
          }
          .op-menu-links a::before {
            content: ""; position: absolute; z-index: -1; inset: 0; opacity: 0;
            background: linear-gradient(100deg, rgba(255,49,95,.22), rgba(255,49,95,.035) 68%, transparent);
            transition: opacity .24s ease;
          }
          .op-menu-links a:hover {
            transform: translateX(4px); color: #fff !important;
            border-color: rgba(255,88,128,.48);
            background-color: rgba(255,49,95,.08);
            box-shadow: 0 7px 22px rgba(0,0,0,.2), 0 0 20px rgba(255,49,95,.08);
          }
          .op-menu-links a:hover::before { opacity: 1; }
          .op-link-number { flex: 0 0 31px; color: #ff779c; font-size: 10px; font-weight: 900; letter-spacing: 1px; }
          .op-link-copy { display: flex; flex: 1; flex-direction: column; gap: 4px; min-width: 0; }
          .op-link-copy strong { color: #fff; font-size: 12px; font-weight: 950; letter-spacing: 1.5px; }
          .op-link-copy small { color: #a99eae; font-size: 10px; font-weight: 500; letter-spacing: .15px; }
          .op-link-arrow {
            display: grid; place-items: center; width: 29px; height: 29px; flex: 0 0 29px;
            border: 1px solid rgba(255,255,255,.1); border-radius: 50%;
            color: #ffb4c6; background: rgba(255,255,255,.035); font-size: 15px;
            transition: transform .24s ease, background .24s ease;
          }
          .op-menu-links a:hover .op-link-arrow { transform: translate(2px,-2px); background: rgba(255,49,95,.16); }
          .op-menu-links a:last-child {
            border-color: rgba(255,82,122,.42);
            background: linear-gradient(100deg, rgba(255,49,95,.18), rgba(255,255,255,.025));
          }

          .op-side-footer {
            display: flex; align-items: center; gap: 12px;
            margin-top: auto; padding-top: 20px;
            border-top: 1px solid rgba(255,255,255,.08);
            font-size: 9px; font-weight: 900; letter-spacing: 1.2px;
            color: #b4a8b7;
          }
          .op-side-footer::before {
            content: "OP"; display: grid; place-items: center; flex: 0 0 35px;
            width: 35px; height: 35px; border: 1px solid rgba(255,86,126,.35);
            border-radius: 50%; color: #ff789a; font-size: 12px;
            box-shadow: 0 0 16px rgba(255,49,95,.1);
          }

          @media (max-height: 760px) {
            .op-side-menu { padding-top: 16px; padding-bottom: 13px; }
            .op-menu-topline { padding-bottom: 12px; }
            .op-side-logo { margin-top: 16px; }
            .op-menu-caption { margin-top: 15px; margin-bottom: 7px; }
            .op-menu-links { gap: 5px; }
            .op-menu-links a { min-height: 44px; padding-top: 6px; padding-bottom: 6px; }
            .op-side-footer { padding-top: 10px; }
          }

          @media (max-width: 600px) {
            .op-side-menu { width: calc(100% - 24px); left: calc(-100% - 30px); top: 12px; height: calc(100dvh - 24px); padding: 20px 16px 15px; }
            .op-side-menu.open { left: 12px; }
          }

          @media (prefers-reduced-motion: reduce) {
            .op-side-menu, .op-side-menu * { animation: none !important; transition: none !important; }
          }

        `}</style>
      </aside>
    </>
  );
}
