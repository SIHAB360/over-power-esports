
"use client";

import Link from "next/link";
import Image from "next/image";
import logo from "../assets/logo.png";

const explore = [
  { label: "Home", href: "/" },
  { label: "Our Players", href: "/players" },
  { label: "Our Teams", href: "/teams" },
  { label: "Tournaments", href: "/tournaments" },
];

const community = [
  { label: "Join the Team", href: "/join-team" },
  { label: "Member Login", href: "/login" },
];

export default function Footer() {
  return (
    <footer className="op-footer" aria-label="Over Power Esports footer">
      <div className="op-footer__glow op-footer__glow--one" aria-hidden="true" />
      <div className="op-footer__glow op-footer__glow--two" aria-hidden="true" />
      <div className="op-footer__glow op-footer__glow--three" aria-hidden="true" />

      <div className="op-footer__container">
        <div className="op-footer__eyebrow">
          <span className="op-footer__status">
            <span className="op-footer__status-dot" />
            THE POWER CONTINUES
          </span>
          <span className="op-footer__motto">POWER · UNITY · DOMINATION</span>
        </div>

        <div className="op-footer__content">
          <div className="op-footer__brand">
            <Link href="/" className="op-footer__brand-link" aria-label="Over Power Esports — Home">
              <span className="op-footer__logo-wrap">
                <Image src={logo} alt="Over Power Esports logo" width={72} height={72} />
              </span>
              <span className="op-footer__brand-name">
                OVER POWER
                <span>ESPORTS</span>
              </span>
            </Link>

            <p>
              Victory is our Mission. Built on discipline, driven by passion,
              united by the game.
            </p>

            <Link href="/join-team" className="op-footer__cta">
              <span>JOIN THE TEAM</span>
              <span className="op-footer__cta-icon" aria-hidden="true">↗</span>
            </Link>
          </div>

          <nav className="op-footer__nav" aria-label="Footer navigation">
            <div className="op-footer__nav-group">
              <h3>EXPLORE</h3>
              {explore.map((item) => (
                <Link key={item.href} href={item.href} className="op-footer__nav-link">
                  <span className="op-footer__link-arrow" aria-hidden="true">↗</span>
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="op-footer__nav-group">
              <h3>COMMUNITY</h3>
              {community.map((item) => (
                <Link key={item.href} href={item.href} className="op-footer__nav-link">
                  <span className="op-footer__link-arrow" aria-hidden="true">↗</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="op-footer__feature">
            <span className="op-footer__feature-label">THE OVER POWER MINDSET</span>
            <h2>
              BEYOND
              <br />
              <span>THE GAME.</span>
            </h2>
            <div className="op-footer__feature-rule" aria-hidden="true" />
            <p>Every second matters. Every victory is earned.</p>
          </div>
        </div>

        <div className="op-footer__bottom">
          <span>© {new Date().getFullYear()} OVER POWER ESPORTS. ALL RIGHTS RESERVED.</span>
          <span className="op-footer__bottom-center">CRAFTED FOR CHAMPIONS <span aria-hidden="true">✦</span></span>
          <a href="#" className="op-footer__back-to-top">BACK TO TOP <span aria-hidden="true">↑</span></a>
        </div>
      </div>

      <style jsx global>{`
        .op-footer, .op-footer * { box-sizing: border-box; }
        .op-footer {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          width: 100%;
          color: #f8f7fc;
          margin-top: 30px;
          padding: 0 22px;
          background: #06070c;
          border-top: 1px solid rgba(255,255,255,.09);
          font-family: Inter, system-ui, -apple-system, Segoe UI, sans-serif;
        }
        .op-footer::before {
          content: "";
          position: absolute;
          z-index: 2;
          top: 0;
          left: -40%;
          width: 70%;
          height: 2px;
          background: linear-gradient(90deg,transparent,#ff315e,#ffca67,#65eaff,transparent);
          box-shadow: 0 0 20px rgba(255,173,110,.85);
          animation: opFooterLight 9s ease-in-out infinite alternate;
        }
        .op-footer__glow { position: absolute; pointer-events:none; z-index:-1; border-radius:50%; filter:blur(72px); }
        .op-footer__glow--one { width:420px; height:420px; top:-190px; left:-80px; background:rgba(255,42,85,.20); }
        .op-footer__glow--two { width:440px; height:340px; top:0; right:12%; background:rgba(94,69,255,.14); animation:opFooterBreathe 7s ease-in-out infinite alternate; }
        .op-footer__glow--three { width:290px; height:280px; right:-80px; bottom:-100px; background:rgba(30,235,238,.13); }
        .op-footer__container { position:relative; max-width:1380px; margin:auto; }
        .op-footer__eyebrow {
          display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;
          border-bottom:1px solid rgba(255,255,255,.09);
          padding:27px 0 24px;
        }
        .op-footer__status, .op-footer__motto {
          font-size:10px; font-weight:850; letter-spacing:2.7px; color:#c7c2d0;
        }
        .op-footer__status { display:inline-flex; gap:12px; align-items:center; color:#f2e9d0; }
        .op-footer__status-dot {
          display:inline-block; width:8px; height:8px; flex:none; border-radius:50%;
          background:#70f6dd; box-shadow:0 0 0 4px rgba(112,246,221,.09),0 0 16px #70f6dd;
          animation:opFooterDot 2.6s ease-in-out infinite;
        }
        .op-footer__content {
          display:grid; grid-template-columns:minmax(290px,1.12fr) minmax(230px,1fr) minmax(245px,.88fr);
          gap:clamp(24px,5vw,82px); padding:65px 0 70px; align-items:start;
        }
        .op-footer__brand-link {
          display:inline-flex; align-items:center; gap:17px;
          text-decoration:none !important; color:white !important;
        }
        .op-footer__logo-wrap {
          flex:none; width:76px; height:76px; display:grid; place-items:center; overflow:hidden;
          border:1px solid rgba(255,213,142,.45); border-radius:24px;
          background:linear-gradient(145deg,rgba(255,255,255,.10),rgba(255,35,71,.06));
          box-shadow:0 0 38px rgba(255,39,90,.14),inset 0 0 20px rgba(255,255,255,.03);
        }
        .op-footer__logo-wrap img { width:66px; height:66px; object-fit:contain; }
        .op-footer__brand-name {
          font-size:clamp(20px,2.2vw,28px); line-height:1.12; font-weight:950;
          letter-spacing:2.1px; white-space:nowrap;
        }
        .op-footer__brand-name > span {
          display:block; margin-top:5px;
          background:linear-gradient(95deg,#ff5776 10%,#ffc274 54%,#ffe3a6);
          -webkit-background-clip:text; background-clip:text; color:transparent;
          letter-spacing:6px;
        }
        .op-footer__brand > p {
          max-width:375px; margin:28px 0 26px;
          font-size:14px; line-height:1.85; color:#aaa6b7;
        }
        .op-footer__cta {
          display:inline-flex; align-items:center; justify-content:space-between; gap:28px;
          padding:8px 8px 8px 23px; min-height:54px;
          border-radius:999px; border:1px solid rgba(255,200,126,.48);
          background:linear-gradient(100deg,rgba(255,55,95,.19),rgba(255,211,134,.07));
          box-shadow:0 0 30px rgba(255,52,100,.12),inset 0 0 14px rgba(255,255,255,.04);
          color:#fff !important; text-decoration:none !important; font-size:11px; font-weight:900; letter-spacing:2px;
          transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease;
        }
        .op-footer__cta:hover { transform:translateY(-3px); border-color:#ffc774; box-shadow:0 8px 38px rgba(255,65,111,.27); }
        .op-footer__cta-icon {
          width:36px; height:36px; display:grid; place-items:center;
          border-radius:50%; background:linear-gradient(140deg,#ffbd73,#ff506d); color:#180b13;
          font-size:23px; font-weight:700;
        }
        .op-footer__nav { display:grid; grid-template-columns:1fr 1fr; gap:28px; padding-top:9px; }
        .op-footer__nav-group { display:flex; flex-direction:column; align-items:flex-start; gap:16px; }
        .op-footer__nav-group h3 {
          margin:0 0 13px; color:#ffe0a4; font-size:11px; font-weight:950; letter-spacing:3px;
        }
        .op-footer__nav-link {
          display:inline-flex; align-items:center; gap:9px;
          color:#c7c2d1 !important; text-decoration:none !important;
          font-size:13px; line-height:1.5; font-weight:600;
          transition:transform .22s ease,color .22s ease;
        }
        .op-footer__link-arrow { color:#76e5fa; font-size:12px; opacity:.65; transition:opacity .22s ease; }
        .op-footer__nav-link:hover { transform:translateX(5px); color:#fff !important; }
        .op-footer__nav-link:hover .op-footer__link-arrow { opacity:1; }
        .op-footer__feature {
          padding:24px; min-height:236px; border-radius:26px;
          background:linear-gradient(143deg,rgba(255,255,255,.085),rgba(255,255,255,.018) 58%,rgba(91,236,248,.045));
          border:1px solid rgba(255,255,255,.13);
          box-shadow:inset 0 1px rgba(255,255,255,.13),0 24px 65px rgba(0,0,0,.22);
          backdrop-filter:blur(20px);
        }
        .op-footer__feature-label { color:#8ff3fc; font-size:9px; font-weight:850; letter-spacing:2px; }
        .op-footer__feature h2 {
          margin:17px 0 14px; font-size:clamp(26px,3vw,42px); line-height:1.06; font-weight:1000; letter-spacing:-1px; color:#fff;
        }
        .op-footer__feature h2 span {
          background:linear-gradient(100deg,#fbbf8d,#ff6687 44%,#95e8ff);
          background-clip:text; -webkit-background-clip:text; color:transparent;
        }
        .op-footer__feature-rule { width:100%; height:1px; margin:21px 0 14px; background:linear-gradient(90deg,#ff8e91,#f8c778,#8adfff,transparent); opacity:.72; }
        .op-footer__feature p { margin:0; font-size:11px; line-height:1.7; color:#b9b3c5; }
        .op-footer__bottom {
          min-height:77px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap;
          gap:15px; border-top:1px solid rgba(255,255,255,.10);
          color:#8e8b9a; font-size:10px; font-weight:700; letter-spacing:1.1px;
        }
        .op-footer__bottom-center { color:#a5a0b1; }
        .op-footer__bottom-center span { color:#ffcc79; margin-left:7px; }
        .op-footer__back-to-top { color:#ede8f2 !important; text-decoration:none !important; display:inline-flex; gap:10px; align-items:center; }
        .op-footer__back-to-top span { font-size:18px; color:#8ee9fa; transition:transform .2s; }
        .op-footer__back-to-top:hover span { transform:translateY(-4px); }
        @keyframes opFooterLight { from { transform:translateX(0); } to { transform:translateX(240%); } }
        @keyframes opFooterBreathe { to { opacity:.48; transform:scale(1.2); } }
        @keyframes opFooterDot { 50% { opacity:.45; box-shadow:0 0 0 7px rgba(112,246,221,.04),0 0 9px #70f6dd; } }
        @media(max-width:1050px) {
          .op-footer__content { grid-template-columns:1.15fr 1fr; gap:40px; }
          .op-footer__feature { grid-column:1/-1; min-height:unset; }
        }
        @media(max-width:680px) {
          .op-footer { padding:0 18px; }
          .op-footer__eyebrow { padding:24px 0 20px; }
          .op-footer__motto { font-size:9px; letter-spacing:1.5px; }
          .op-footer__content { grid-template-columns:1fr; gap:36px; padding:39px 0 42px; }
          .op-footer__brand-link { gap:13px; }
          .op-footer__logo-wrap { width:64px; height:64px; border-radius:20px; }
          .op-footer__logo-wrap img { width:56px; height:56px; }
          .op-footer__brand-name { font-size:20px; }
          .op-footer__brand-name > span { letter-spacing:4px; }
          .op-footer__brand > p { margin:19px 0; }
          .op-footer__nav { gap:25px; }
          .op-footer__nav-group { gap:13px; }
          .op-footer__feature { grid-column:auto; }
          .op-footer__bottom { justify-content:center; text-align:center; padding:24px 0; gap:15px; line-height:1.7; }
          .op-footer__bottom-center { display:none; }
        }
        @media(prefers-reduced-motion:reduce) {
          .op-footer::before, .op-footer__glow, .op-footer__status-dot { animation:none !important; }
          .op-footer__cta, .op-footer__nav-link, .op-footer__back-to-top span { transition:none !important; }
        }
      `}</style>
    </footer>
  );
}
