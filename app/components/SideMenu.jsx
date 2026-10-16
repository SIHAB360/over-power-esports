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
    { name: "LOGIN", href: "/login" },
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

        <div className="op-side-logo">
          OVER POWER
          <span>ESPORTS</span>
          <div className="logo-line"></div>
        </div>

        <div className="op-menu-links">
          {menus.map((item, index) => (
            <Link
              href={item.href}
              key={index}
              onClick={close}
            >
              <span className="menu-dot"></span>
              {item.name}
            </Link>
          ))}
        </div>

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
        `}</style>
      </aside>
    </>
  );
}
