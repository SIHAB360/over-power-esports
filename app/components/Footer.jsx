"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "../assets/logo.png";

const exploreLinks = [
  { label: "Home", href: "/#home" },
  { label: "Our Players", href: "/#players" },
  { label: "Our Teams", href: "/#teams" },
  { label: "Tournaments", href: "/#tournaments" },
];

const communityLinks = [
  { label: "Join the Team", href: "/join-team" },
  { label: "Member Login", href: "/login" },
];

export default function Footer() {
  function backToTop() {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }

  return (
    <footer className="op-safe-footer" aria-label="Over Power Esports footer">
      <div className="op-safe-footer__glow red" aria-hidden="true" />
      <div className="op-safe-footer__glow blue" aria-hidden="true" />
      <div className="op-safe-footer__inner">
        <div className="op-safe-footer__overline">
          <span className="op-safe-footer__live"><i aria-hidden="true" /> THE POWER CONTINUES</span>
          <span className="op-safe-footer__tagline">✦ POWER · UNITY · DOMINATION</span>
        </div>

        <div className="op-safe-footer__content">
          <div className="op-safe-footer__brand">
            <Link href="/#home" className="op-safe-footer__identity" aria-label="Over Power Esports Home">
              <span className="op-safe-footer__logo">
                <Image src={logo} alt="Over Power Esports logo" width={72} height={72} />
              </span>
              <span className="op-safe-footer__name">
                <strong>OVER POWER</strong>
                <b>ESPORTS</b>
              </span>
            </Link>
            <p>Victory is our mission. Built on discipline, driven by passion, united by the game.</p>
            <Link href="/join-team" className="op-safe-footer__join">
              JOIN THE TEAM <span aria-hidden="true">↗</span>
            </Link>
            <small className="op-safe-footer__motto">✧ THE NEXT GENERATION OF CHAMPIONS</small>
          </div>

          <nav className="op-safe-footer__nav" aria-label="Footer navigation">
            <div className="op-safe-footer__nav-col">
              <h3>EXPLORE</h3>
              {exploreLinks.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span aria-hidden="true">↗</span> {item.label}
                </Link>
              ))}
            </div>
            <div className="op-safe-footer__nav-col">
              <h3>COMMUNITY</h3>
              {communityLinks.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span aria-hidden="true">↗</span> {item.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="op-safe-footer__feature-border">
            <div className="op-safe-footer__feature">
              <span>✦ THE OVER POWER MINDSET</span>
              <h2>BEYOND<br /><em>THE GAME.</em></h2>
              <div className="op-safe-footer__feature-line" />
              <p>Every second matters. Every victory is earned.</p>
            </div>
          </div>
        </div>

        <div className="op-safe-footer__slogan">WE <span>✦</span> BELIEVE IN <span>✦</span> DOMINATION</div>
        <div className="op-safe-footer__bottom">
          <small>© {new Date().getFullYear()} OVER POWER ESPORTS. ALL RIGHTS RESERVED.</small>
          <small>CRAFTED FOR CHAMPIONS <span>✦</span></small>
          <button type="button" onClick={backToTop}>BACK TO TOP ↑</button>
        </div>
      </div>

      <style jsx global>{`
        .op-safe-footer, .op-safe-footer * { box-sizing: border-box; }
        .op-safe-footer {
          position: relative; isolation: isolate; overflow: hidden; width: 100%;
          margin: 46px 0 0; padding: 0 clamp(18px, 4vw, 55px);
          color: #f9f7ff; text-align: left; font-family: Arial, Helvetica, sans-serif;
          background: linear-gradient(145deg, #160a14, #070811 55%, #07151a);
          border-top: 1px solid rgba(255, 211, 138, .35);
        }
        .op-safe-footer:before {
          content: ""; position: absolute; height: 2px; top: 0; left: 0; right: 0;
          background: linear-gradient(90deg, transparent, #ff4b78, #ffce83, #83edff, transparent);
          box-shadow: 0 0 17px rgba(255, 118, 145, .55); pointer-events: none;
        }
        .op-safe-footer__glow {
          position: absolute; z-index: -1; width: 370px; height: 310px;
          border-radius: 50%; filter: blur(85px); pointer-events: none;
        }
        .op-safe-footer__glow.red { top: -170px; left: -150px; background: rgba(255, 51, 95, .20); }
        .op-safe-footer__glow.blue { bottom: -130px; right: -140px; background: rgba(0, 204, 233, .16); }
        .op-safe-footer__inner { width: 100%; max-width: 1370px; margin: 0 auto; }
        .op-safe-footer__overline {
          display: flex; justify-content: space-between; align-items: center;
          gap: 18px; min-height: 69px; border-bottom: 1px solid rgba(255,255,255,.12);
          font-size: 10px; font-weight: 800; letter-spacing: 2px;
        }
        .op-safe-footer__live { display: inline-flex; align-items: center; gap: 11px; }
        .op-safe-footer__live i {
          width: 8px; height: 8px; border-radius: 50%; background: #6ce9ce;
          box-shadow: 0 0 13px #6ce9ce;
        }
        .op-safe-footer__tagline { color: #c6b9d0; }
        .op-safe-footer__content {
          display: grid; grid-template-columns: 1.14fr .96fr 1fr;
          align-items: start; gap: clamp(24px, 3vw, 65px); padding: 56px 0;
        }
        .op-safe-footer__identity {
          display: inline-flex; align-items: center; gap: 17px;
          text-decoration: none !important; color: #fff !important;
        }
        .op-safe-footer__logo {
          display: grid; place-items: center; width: 80px; height: 80px; flex: 0 0 80px;
          padding: 4px; border-radius: 50%;
          background: linear-gradient(130deg, #ffda8b, #ff5181, #8deaff);
          box-shadow: 0 0 27px rgba(255, 98, 145, .3);
        }
        .op-safe-footer__logo img {
          display: block; width: 100%; height: 100%; object-fit: cover;
          border-radius: 50%; background: #0c0c12;
        }
        .op-safe-footer__name { display: flex; flex-direction: column; gap: 7px; min-width: 0; }
        .op-safe-footer__name strong { font-size: clamp(19px, 2vw, 28px); font-weight: 900; letter-spacing: 1.5px; white-space: nowrap; }
        .op-safe-footer__name b {
          font-size: clamp(19px, 2.1vw, 29px); font-weight: 900; letter-spacing: 5px;
          color: #ffb692; text-shadow: 0 0 16px rgba(255, 99, 140, .25);
        }
        .op-safe-footer__brand > p {
          margin: 25px 0 20px; max-width: 370px;
          font-size: 14px; line-height: 1.85; color: #c0b9c8;
        }
        .op-safe-footer__join {
          display: inline-flex; align-items: center; justify-content: space-between;
          gap: 18px; min-height: 48px; padding: 6px 6px 6px 20px;
          border: 1px solid rgba(255, 210, 145, .6); border-radius: 99px;
          background: rgba(255, 111, 131, .10); color: #fff !important;
          font-size: 11px; font-weight: 900; letter-spacing: 1.2px; text-decoration: none !important;
        }
        .op-safe-footer__join span {
          display: grid; place-items: center; width: 34px; height: 34px;
          border-radius: 50%; background: linear-gradient(135deg, #ffdd95, #ff668b);
          color: #190910; font-size: 22px;
        }
        .op-safe-footer__motto { display: block; margin-top: 19px; font-size: 9px; letter-spacing: 1.4px; color: #b9aab6; }
        .op-safe-footer__nav { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding-top: 9px; }
        .op-safe-footer__nav-col { min-width: 0; display: flex; flex-direction: column; gap: 5px; }
        .op-safe-footer__nav-col h3 {
          margin: 0 0 14px; color: #ffe1ac; font-size: 11px;
          font-weight: 900; letter-spacing: 2px;
        }
        .op-safe-footer__nav-col a {
          display: block; min-height: 38px; padding: 9px 0;
          color: #d5d0dd !important; text-decoration: none !important;
          font-size: 13px; font-weight: 600; line-height: 1.45;
        }
        .op-safe-footer__nav-col a span { color: #85eaff; margin-right: 5px; }
        .op-safe-footer__nav-col a:hover { color: #fff !important; }
        .op-safe-footer__feature-border {
          padding: 1px; border-radius: 23px;
          background: linear-gradient(145deg, #e9c38f, #6b4a78, #75d9ea);
          box-shadow: 0 8px 45px rgba(116, 89, 215, .15);
        }
        .op-safe-footer__feature {
          min-height: 255px; padding: 27px; border-radius: 22px;
          background: linear-gradient(145deg, #221b31, #0a0d18 75%);
        }
        .op-safe-footer__feature > span { color: #8ceaff; font-size: 10px; font-weight: 900; letter-spacing: 1px; }
        .op-safe-footer__feature h2 {
          margin: 23px 0 0; color: white; font-weight: 900;
          font-size: clamp(31px, 3vw, 43px); letter-spacing: -1px; line-height: 1.06;
        }
        .op-safe-footer__feature h2 em { font-style: normal; color: #ffad91; }
        .op-safe-footer__feature-line {
          height: 1px; margin: 25px 0 16px;
          background: linear-gradient(90deg, #ff889a, #ffdba5, #87effc, transparent);
        }
        .op-safe-footer__feature p { margin: 0; color: #c5c1ce; font-size: 12px; line-height: 1.7; }
        .op-safe-footer__slogan {
          display: flex; justify-content: center; align-items: center; gap: 22px;
          min-height: 65px; border-top: 1px solid rgba(255,255,255,.09);
          border-bottom: 1px solid rgba(255,255,255,.09);
          color: #e3dce7; font-size: 12px; font-weight: 900; letter-spacing: 3px;
        }
        .op-safe-footer__slogan span { color: #ffd38b; }
        .op-safe-footer__bottom {
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 16px; min-height: 75px;
          font-size: 10px; letter-spacing: 1px; color: #aca4b9;
        }
        .op-safe-footer__bottom small { font-size: inherit; }
        .op-safe-footer__bottom small span { color: #ffdc99; }
        .op-safe-footer__bottom button {
          padding: 10px 12px; border: 1px solid rgba(138,230,252,.3); border-radius: 99px;
          background: rgba(138,230,252,.05); color: #f9f7ff;
          font-size: 11px; font-weight: 800; cursor: pointer; letter-spacing: .6px;
        }
        .op-safe-footer a:focus-visible, .op-safe-footer button:focus-visible { outline: 2px solid #91ebff; outline-offset: 3px; }
        @media (max-width: 1120px) {
          .op-safe-footer__content { grid-template-columns: 1fr 1fr; }
          .op-safe-footer__feature-border { grid-column: 1 / -1; }
        }
        @media (max-width: 760px) {
          .op-safe-footer { padding: 0 18px; }
          .op-safe-footer__overline { flex-direction: column; justify-content: center; gap: 9px; padding: 20px 0; text-align: center; }
          .op-safe-footer__overline, .op-safe-footer__tagline { font-size: 10px; letter-spacing: 1.3px; }
          .op-safe-footer__content { display: flex; flex-direction: column; gap: 26px; padding: 33px 0 32px; }
          .op-safe-footer__brand, .op-safe-footer__nav, .op-safe-footer__feature-border { width: 100%; }
          .op-safe-footer__brand { text-align: center; }
          .op-safe-footer__identity { justify-content: center; }
          .op-safe-footer__logo { width: 74px; height: 74px; flex-basis: 74px; }
          .op-safe-footer__name strong { font-size: clamp(18px, 4.5vw, 24px); }
          .op-safe-footer__name b { font-size: clamp(18px, 4.5vw, 24px); letter-spacing: 3px; }
          .op-safe-footer__brand > p { margin: 19px auto; max-width: 360px; font-size: 13px; }
          .op-safe-footer__motto { text-align: center; }
          .op-safe-footer__nav {
            grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 12px;
            max-width: 540px; margin: 0 auto; padding: 19px 13px;
            border-radius: 18px; border: 1px solid rgba(255,255,255,.12);
            background: rgba(255,255,255,.035);
          }
          .op-safe-footer__nav-col { text-align: left; }
          .op-safe-footer__nav-col h3 { font-size: 12px; letter-spacing: 1px; }
          .op-safe-footer__nav-col a { font-size: 13px; min-height: 40px; }
          .op-safe-footer__feature { min-height: 215px; padding: 24px 22px; }
          .op-safe-footer__feature h2 { font-size: 35px; }
          .op-safe-footer__slogan { gap: 9px; font-size: 10px; letter-spacing: 1px; min-height: 60px; }
          .op-safe-footer__bottom { flex-direction: column; justify-content: center; padding: 22px 0 30px; gap: 14px; text-align: center; }
          .op-safe-footer__bottom small { font-size: 10px; line-height: 1.7; }
          .op-safe-footer__bottom button { min-height: 42px; }
        }
        @media (max-width: 365px) {
          .op-safe-footer { padding: 0 13px; }
          .op-safe-footer__identity { gap: 9px; }
          .op-safe-footer__logo { width: 60px; height: 60px; flex-basis: 60px; }
          .op-safe-footer__name strong { font-size: 17px; }
          .op-safe-footer__name b { font-size: 17px; letter-spacing: 2px; }
          .op-safe-footer__nav { padding: 16px 10px; gap: 7px; }
          .op-safe-footer__nav-col h3 { font-size: 10px; }
          .op-safe-footer__nav-col a { font-size: 12px; }
          .op-safe-footer__slogan { gap: 6px; font-size: 9px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .op-safe-footer__join, .op-safe-footer__nav-col a { transition: none; }
        }
      `}</style>
    </footer>
  );
}
