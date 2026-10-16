
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
  const backToTop = () => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <footer className="op-vip-footer" aria-label="Over Power Esports footer">
      {/* Pure CSS lighting, contained inside the footer. */}
      <div className="op-vip-footer__grid" aria-hidden="true" />
      <div className="op-vip-footer__aura op-vip-footer__aura--rose" aria-hidden="true" />
      <div className="op-vip-footer__aura op-vip-footer__aura--violet" aria-hidden="true" />
      <div className="op-vip-footer__aura op-vip-footer__aura--cyan" aria-hidden="true" />
      <div className="op-vip-footer__top-beam" aria-hidden="true" />

      <div className="op-vip-footer__inner">
        <div className="op-vip-footer__overline">
          <div className="op-vip-footer__live">
            <span className="op-vip-footer__live-dot" aria-hidden="true" />
            THE POWER CONTINUES
          </div>
          <div className="op-vip-footer__overline-right">
            <span className="op-vip-footer__star" aria-hidden="true">✦</span>
            POWER · UNITY · DOMINATION
          </div>
        </div>

        <div className="op-vip-footer__main">
          <div className="op-vip-footer__brand">
            <Link
              className="op-vip-footer__identity"
              href="/"
              aria-label="Over Power Esports home"
            >
              <span className="op-vip-footer__logo-orbit">
                {/* The square original is visually clipped into a true circle. */}
                <span className="op-vip-footer__logo-circle">
                  <Image
                    src={logo}
                    alt="Over Power Esports"
                    className="op-vip-footer__logo-image"
                    width={90}
                    height={90}
                    sizes="90px"
                  />
                </span>
              </span>
              <span className="op-vip-footer__wordmark">
                <span className="op-vip-footer__wordmark-top">OVER POWER</span>
                <span className="op-vip-footer__wordmark-bottom">ESPORTS</span>
              </span>
            </Link>

            <p className="op-vip-footer__description">
              Victory is our mission. Built on discipline, driven by passion,
              united by the game.
            </p>

            <Link className="op-vip-footer__join" href="/join-team">
              <span className="op-vip-footer__join-shine" aria-hidden="true" />
              <span>JOIN THE TEAM</span>
              <span className="op-vip-footer__join-arrow" aria-hidden="true">↗</span>
            </Link>

            <div className="op-vip-footer__mini-line">
              <span aria-hidden="true">✧</span>
              THE NEXT GENERATION OF CHAMPIONS
            </div>
          </div>

          <nav className="op-vip-footer__navigation" aria-label="Footer navigation">
            <div className="op-vip-footer__nav-group">
              <h3><span aria-hidden="true" /> EXPLORE</h3>
              {exploreLinks.map(({ href, label }) => (
                <Link key={href} className="op-vip-footer__link" href={href}>
                  <span className="op-vip-footer__link-indicator" aria-hidden="true">↗</span>
                  <span>{label}</span>
                </Link>
              ))}
            </div>
            <div className="op-vip-footer__nav-group">
              <h3><span aria-hidden="true" /> COMMUNITY</h3>
              {communityLinks.map(({ href, label }) => (
                <Link key={href} className="op-vip-footer__link" href={href}>
                  <span className="op-vip-footer__link-indicator" aria-hidden="true">↗</span>
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </nav>

          <div className="op-vip-footer__feature-shell">
            <div className="op-vip-footer__feature">
              <span className="op-vip-footer__feature-kicker">
                <span aria-hidden="true">✦</span> THE OVER POWER MINDSET
              </span>
              <h2>BEYOND<br /><span>THE GAME.</span></h2>
              <div className="op-vip-footer__feature-divider" aria-hidden="true" />
              <p>Every second matters. Every victory is earned.</p>
              <span className="op-vip-footer__feature-watermark" aria-hidden="true">OP</span>
            </div>
          </div>
        </div>

        <div className="op-vip-footer__slogan" aria-label="We believe in domination">
          <span>WE</span>
          <span className="op-vip-footer__slogan-dot">✦</span>
          <span>BELIEVE IN</span>
          <span className="op-vip-footer__slogan-dot">✦</span>
          <span>DOMINATION</span>
        </div>

        <div className="op-vip-footer__bottom">
          <span>© {new Date().getFullYear()} OVER POWER ESPORTS. ALL RIGHTS RESERVED.</span>
          <span className="op-vip-footer__made">CRAFTED FOR CHAMPIONS <b>✦</b></span>
          <button type="button" onClick={backToTop} className="op-vip-footer__to-top">
            BACK TO TOP <span aria-hidden="true">↑</span>
          </button>
        </div>
      </div>

      <style jsx global>{`
        /* Scroll target clearance for the homepage fixed navbar. */
        #home, #players, #teams, #tournaments { scroll-margin-top: 110px; }
        .op-vip-footer, .op-vip-footer * { box-sizing: border-box; }
        .op-vip-footer {
          --vip-gold:#ffd789;
          --vip-cyan:#7eeaff;
          --vip-rose:#ff527a;
          --vip-purple:#b29aff;
          position:relative;
          isolation:isolate;
          overflow:hidden;
          width:100%;
          margin-top:54px;
          padding:0 clamp(18px,4vw,64px);
          color:#f8f7fd;
          font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
          background:linear-gradient(155deg,#0c0811 0%,#05050a 54%,#090c13 100%);
          border-top:1px solid rgba(255,255,255,.12);
          text-align:left;
        }
        .op-vip-footer__grid {
          position:absolute;z-index:-1;inset:0;pointer-events:none;
          background-image:
            linear-gradient(rgba(255,255,255,.024) 1px,transparent 1px),
            linear-gradient(90deg,rgba(255,255,255,.024) 1px,transparent 1px);
          background-size:74px 74px;
          -webkit-mask-image:linear-gradient(to bottom,transparent,black 32%,transparent 100%);
          mask-image:linear-gradient(to bottom,transparent,black 32%,transparent 100%);
        }
        .op-vip-footer__aura {
          position:absolute;z-index:-1;pointer-events:none;border-radius:50%;filter:blur(85px);
          animation:opVipAurora 9s ease-in-out infinite alternate;
        }
        .op-vip-footer__aura--rose { width:480px;height:420px;top:-200px;left:-170px;background:rgba(255,44,93,.20); }
        .op-vip-footer__aura--violet { width:550px;height:420px;top:0;right:5%;background:rgba(113,81,255,.14);animation-delay:-3s; }
        .op-vip-footer__aura--cyan { width:450px;height:340px;bottom:-180px;right:-100px;background:rgba(27,222,240,.14);animation-delay:-5s; }
        .op-vip-footer__top-beam {
          position:absolute;top:0;left:-42%;width:50%;height:2px;z-index:1;pointer-events:none;
          background:linear-gradient(90deg,transparent,#ff557a,#ffd78b,#8bedff,transparent);
          box-shadow:0 0 16px rgba(255,184,150,.85),0 0 40px rgba(255,70,134,.3);
          animation:opVipScan 10s ease-in-out infinite alternate;
        }
        .op-vip-footer__inner { max-width:1460px;margin:0 auto;position:relative; }
        .op-vip-footer__overline {
          display:flex;align-items:center;justify-content:space-between;gap:15px;flex-wrap:wrap;
          padding:28px 0 24px;border-bottom:1px solid rgba(255,255,255,.09);
        }
        .op-vip-footer__live,.op-vip-footer__overline-right {
          display:inline-flex;align-items:center;gap:12px;
          font-size:10px;font-weight:900;letter-spacing:2.6px;color:#f0e9dc;
        }
        .op-vip-footer__overline-right {color:#aaa4ba;}
        .op-vip-footer__star {color:var(--vip-gold);font-size:15px;}
        .op-vip-footer__live-dot {
          width:8px;height:8px;flex:none;border-radius:50%;background:#6bf3d6;
          box-shadow:0 0 0 4px rgba(107,243,214,.07),0 0 18px rgba(107,243,214,.8);
          animation:opVipDot 2.4s ease-in-out infinite;
        }
        .op-vip-footer__main {
          display:grid;grid-template-columns:minmax(300px,1.1fr) minmax(250px,.9fr) minmax(290px,.94fr);
          gap:clamp(26px,4vw,85px);align-items:start;padding:66px 0 56px;
        }
        .op-vip-footer__identity {
          display:inline-flex;align-items:center;gap:20px;max-width:100%;
          color:#fff !important;text-decoration:none !important;
        }
        .op-vip-footer__logo-orbit {
          width:94px;height:94px;flex:none;position:relative;display:grid;place-items:center;
          border-radius:50%;background:rgba(10,12,21,.65);
          box-shadow:0 0 40px rgba(255,77,126,.15),0 0 20px rgba(126,234,255,.07);
        }
        .op-vip-footer__logo-orbit::before {
          content:"";position:absolute;inset:0;border-radius:50%;
          background:conic-gradient(from 30deg,#ffd38c,#ff527a,#b29aff,#76edfc,#ffd38c);
          animation:opVipSpin 9s linear infinite;
          box-shadow:0 0 24px rgba(255,114,149,.22);
        }
        .op-vip-footer__logo-orbit::after {
          content:"";position:absolute;inset:3px;border-radius:50%;background:#0b0911;
        }
        .op-vip-footer__logo-circle {
          width:82px;height:82px;position:relative;z-index:1;overflow:hidden;
          display:block;border-radius:50%;background:#0a0a11;
          border:1px solid rgba(255,255,255,.24);
        }
        .op-vip-footer__logo-image {
          display:block !important;width:100% !important;height:100% !important;
          border-radius:50% !important;object-fit:cover !important;object-position:center !important;
          transform:scale(1.06); /* Crops square image corners; keeps OP centered. */
        }
        .op-vip-footer__wordmark {display:flex;flex-direction:column;min-width:0;line-height:1.08;}
        .op-vip-footer__wordmark-top {
          font-weight:950;letter-spacing:2px;font-size:clamp(21px,2.1vw,30px);
          color:#fff;text-shadow:0 0 22px rgba(255,255,255,.13);white-space:nowrap;
        }
        .op-vip-footer__wordmark-bottom {
          margin-top:7px;font-size:clamp(22px,2.15vw,31px);font-weight:950;letter-spacing:6px;
          background:linear-gradient(100deg,#ff5a87,#ffb57f 51%,#ffe5a4 90%);
          -webkit-background-clip:text;background-clip:text;color:transparent;
        }
        .op-vip-footer__description {max-width:375px;margin:30px 0 27px;color:#aea9b9;font-size:14px;line-height:1.9;}
        .op-vip-footer__join {
          position:relative;overflow:hidden;min-height:54px;display:inline-flex;align-items:center;
          justify-content:space-between;gap:30px;padding:7px 7px 7px 23px;
          color:#fff !important;text-decoration:none !important;font-size:11px;font-weight:950;letter-spacing:2px;
          background:linear-gradient(105deg,rgba(255,78,113,.16),rgba(255,196,119,.08));
          border:1px solid rgba(255,209,140,.60);border-radius:999px;
          box-shadow:0 0 30px rgba(255,70,119,.12),inset 0 1px rgba(255,255,255,.10);
          transition:transform .3s ease,box-shadow .3s ease,border-color .3s ease;
        }
        .op-vip-footer__join:hover {transform:translateY(-3px);box-shadow:0 15px 45px rgba(255,69,129,.24);border-color:#ffe0ac;}
        .op-vip-footer__join-shine {
          position:absolute;inset:0;pointer-events:none;
          background:linear-gradient(110deg,transparent 36%,rgba(255,255,255,.24) 49%,transparent 61%);
          transform:translateX(-130%);animation:opVipShine 7s ease-in-out infinite;
        }
        .op-vip-footer__join-arrow {
          width:38px;height:38px;display:grid;place-items:center;flex:none;border-radius:50%;
          background:linear-gradient(135deg,#ffe19a,#ff5b83);color:#1d0b16;font-size:25px;
          box-shadow:0 0 18px rgba(255,128,135,.20);
        }
        .op-vip-footer__mini-line {display:flex;align-items:center;gap:11px;margin-top:24px;font-size:9px;font-weight:750;letter-spacing:1.8px;color:#7e7a8a;}
        .op-vip-footer__mini-line span {font-size:20px;color:var(--vip-gold);}
        .op-vip-footer__navigation {display:grid;grid-template-columns:1fr 1fr;gap:clamp(20px,2vw,36px);padding-top:16px;}
        .op-vip-footer__nav-group {display:flex;flex-direction:column;align-items:flex-start;gap:7px;min-width:0;}
        .op-vip-footer__nav-group h3 {
          margin:0 0 19px;display:flex;align-items:center;gap:10px;
          color:#ffe0aa;font-size:11px;font-weight:950;letter-spacing:2.8px;
        }
        .op-vip-footer__nav-group h3 span {width:17px;height:2px;border-radius:4px;background:linear-gradient(90deg,#ff587d,#ffe09e);}
        .op-vip-footer__link {
          display:inline-flex;align-items:center;gap:10px;min-height:34px;max-width:100%;
          padding:5px 9px 5px 0;border-radius:8px;
          text-decoration:none !important;color:#c9c4d3 !important;
          font-size:13px;font-weight:600;line-height:1.4;
          transition:color .2s ease,transform .2s ease,background .2s ease;
        }
        .op-vip-footer__link-indicator {font-size:14px;color:var(--vip-cyan);opacity:.73;transition:opacity .2s ease;}
        .op-vip-footer__link:hover {color:#fff !important;transform:translateX(5px);background:rgba(255,255,255,.035);}
        .op-vip-footer__link:hover .op-vip-footer__link-indicator {opacity:1;}
        .op-vip-footer__feature-shell {
          position:relative;padding:1px;border-radius:29px;isolation:isolate;
          background:linear-gradient(135deg,rgba(255,218,146,.68),rgba(255,255,255,.10) 32%,rgba(174,133,255,.40) 65%,rgba(91,224,253,.62));
          box-shadow:0 22px 70px rgba(0,0,0,.22),0 0 40px rgba(113,74,245,.10);
        }
        .op-vip-footer__feature-shell::before {
          content:"";position:absolute;inset:-1px;z-index:-1;border-radius:inherit;
          background:conic-gradient(from 0deg,transparent,rgba(255,221,152,.7),transparent,rgba(108,226,255,.7),transparent);
          filter:blur(14px);opacity:.25;animation:opVipSpin 12s linear infinite;
        }
        .op-vip-footer__feature {
          position:relative;isolation:isolate;overflow:hidden;border-radius:28px;
          min-height:265px;padding:29px 27px;
          background:linear-gradient(145deg,rgba(37,31,53,.99),rgba(10,11,21,.99) 75%);
        }
        .op-vip-footer__feature::before {
          content:"";position:absolute;z-index:-1;width:220px;height:220px;right:-120px;top:-110px;
          border-radius:50%;filter:blur(24px);background:rgba(124,86,249,.22);
        }
        .op-vip-footer__feature-kicker {color:#94eeff;font-size:9px;font-weight:950;letter-spacing:2px;}
        .op-vip-footer__feature-kicker span {color:var(--vip-gold);margin-right:5px;}
        .op-vip-footer__feature h2 {margin:24px 0 0;font-size:clamp(35px,3.1vw,47px);line-height:1.05;letter-spacing:-1px;font-weight:1000;color:#fff;}
        .op-vip-footer__feature h2 span {background:linear-gradient(90deg,#ffb88a,#ff668c 47%,#93ebfc);-webkit-background-clip:text;background-clip:text;color:transparent;}
        .op-vip-footer__feature-divider {height:1px;margin:25px 0 15px;background:linear-gradient(90deg,#ff7f95,#e6bd80,#8be4ff,transparent);opacity:.72;}
        .op-vip-footer__feature p {margin:0;max-width:300px;font-size:12px;line-height:1.7;color:#b9b2c8;}
        .op-vip-footer__feature-watermark {position:absolute;right:13px;bottom:-25px;font-size:125px;font-weight:1000;letter-spacing:-15px;opacity:.03;pointer-events:none;}
        .op-vip-footer__slogan {
          display:flex;justify-content:center;align-items:center;gap:clamp(15px,4vw,54px);flex-wrap:wrap;
          padding:19px 0;margin:0 0 1px;
          border-top:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08);
          font-size:clamp(11px,1.2vw,15px);font-weight:950;letter-spacing:clamp(2px,.5vw,6px);
          color:#d6d2dd;text-shadow:0 0 15px rgba(255,255,255,.07);
        }
        .op-vip-footer__slogan-dot {color:#ffcd83;font-size:12px;opacity:.85;}
        .op-vip-footer__bottom {
          display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;
          min-height:78px;padding:20px 0;color:#8d899b;font-size:10px;font-weight:750;letter-spacing:1.1px;
        }
        .op-vip-footer__made {color:#aca5b9;}
        .op-vip-footer__made b {margin-left:7px;color:#ffd89a;}
        .op-vip-footer__to-top {
          display:inline-flex;align-items:center;gap:12px;cursor:pointer;color:#eae7f3 !important;
          background:none;border:0;padding:9px 0;font:inherit;letter-spacing:inherit;
          transition:color .2s ease;
        }
        .op-vip-footer__to-top:hover {color:#fff !important;}
        .op-vip-footer__to-top span {font-size:19px;color:#8be8ff;transition:transform .2s ease;}
        .op-vip-footer__to-top:hover span {transform:translateY(-4px);}
        .op-vip-footer a:focus-visible,.op-vip-footer button:focus-visible {outline:2px solid #83e7ff;outline-offset:5px;}
        @keyframes opVipScan {from{transform:translateX(0)}to{transform:translateX(295%)}}
        @keyframes opVipAurora {to{opacity:.58;transform:scale(1.15) translateY(14px)}}
        @keyframes opVipSpin {to{transform:rotate(360deg)}}
        @keyframes opVipDot {50%{opacity:.45;box-shadow:0 0 0 7px rgba(107,243,214,.04),0 0 9px rgba(107,243,214,.85)}}
        @keyframes opVipShine {0%,20%,100%{transform:translateX(-130%)}50%,68%{transform:translateX(130%)}}
        /* Responsive refinement: desktop grid remains unchanged. */
        @media (max-width:1120px) {
          .op-vip-footer {
            padding-left:clamp(18px,4vw,36px);
            padding-right:clamp(18px,4vw,36px);
          }
          .op-vip-footer__main {
            display:grid;
            grid-template-columns:minmax(0,1fr);
            gap:32px;
            padding:46px 0;
          }
          .op-vip-footer__brand,
          .op-vip-footer__navigation,
          .op-vip-footer__feature-shell {
            grid-column:auto;
            width:100%;
            max-width:100%;
            min-width:0;
          }
          .op-vip-footer__navigation {
            grid-template-columns:repeat(2,minmax(0,1fr));
            padding:28px;
            gap:24px;
            border-radius:24px;
            border:1px solid rgba(255,255,255,.10);
            background:linear-gradient(135deg,rgba(255,255,255,.042),rgba(255,255,255,.012));
            box-shadow:0 15px 55px rgba(0,0,0,.12);
          }
          .op-vip-footer__nav-group {min-width:0;}
          .op-vip-footer__feature-shell {margin:0;}
        }

        /* True mobile composition: one centered visual column, two tidy link groups. */
        @media (max-width:760px) {
          .op-vip-footer {
            margin-top:26px;
            padding:0 16px;
            overflow:hidden;
          }
          .op-vip-footer__inner {
            width:100%;
            max-width:520px;
            min-width:0;
            margin-inline:auto;
          }
          .op-vip-footer__overline {
            flex-direction:column;
            align-items:center;
            justify-content:center;
            gap:10px;
            padding:22px 0 18px;
            text-align:center;
          }
          .op-vip-footer__live,
          .op-vip-footer__overline-right {
            justify-content:center;
            flex-wrap:wrap;
            gap:9px;
            font-size:10px;
            font-weight:850;
            letter-spacing:1.65px;
            line-height:1.65;
          }
          .op-vip-footer__overline-right {font-size:9px;color:#bcb5c9;}
          .op-vip-footer__main {
            display:flex;
            flex-direction:column;
            align-items:stretch;
            gap:24px;
            padding:29px 0 32px;
          }

          /* Brand block: logo above the centered name, no left-side drift. */
          .op-vip-footer__brand {
            display:flex;
            flex-direction:column;
            align-items:center;
            width:100%;
            min-width:0;
            text-align:center;
            padding:7px 5px 8px;
          }
          .op-vip-footer__identity {
            flex-direction:column;
            align-items:center;
            justify-content:center;
            gap:14px;
            width:100%;
            text-align:center;
          }
          .op-vip-footer__logo-orbit {
            width:90px;
            height:90px;
            margin:0 auto;
          }
          .op-vip-footer__logo-circle {
            width:78px;
            height:78px;
          }
          .op-vip-footer__wordmark {
            align-items:center;
            justify-content:center;
            width:100%;
            text-align:center;
          }
          .op-vip-footer__wordmark-top {
            font-size:clamp(21px,6vw,26px);
            line-height:1.16;
            letter-spacing:2px;
            white-space:normal;
          }
          .op-vip-footer__wordmark-bottom {
            margin-top:6px;
            font-size:clamp(24px,7vw,29px);
            letter-spacing:5px;
            line-height:1.18;
          }
          .op-vip-footer__description {
            max-width:340px;
            margin:20px auto 22px;
            padding:0 5px;
            font-size:14px;
            line-height:1.85;
            text-align:center;
            color:#c7c2d0;
          }
          .op-vip-footer__join {
            align-self:center;
            min-height:52px;
            padding-left:22px;
            gap:26px;
            font-size:11px;
            letter-spacing:1.7px;
          }
          .op-vip-footer__mini-line {
            justify-content:center;
            max-width:100%;
            margin-top:19px;
            gap:9px;
            text-align:center;
            font-size:10px;
            letter-spacing:1.1px;
            line-height:1.6;
          }

          /* Match headings and links in two intentionally equal columns. */
          .op-vip-footer__navigation {
            position:relative;
            display:grid;
            grid-template-columns:repeat(2,minmax(0,1fr));
            align-items:start;
            gap:12px;
            width:100%;
            padding:21px 14px 24px;
            border:1px solid rgba(255,255,255,.14);
            border-radius:20px;
            background:linear-gradient(145deg,rgba(32,28,47,.92),rgba(8,9,17,.91));
            box-shadow:0 15px 40px rgba(0,0,0,.24), inset 0 1px 0 rgba(255,255,255,.045);
          }
          .op-vip-footer__navigation::after {
            content:"";
            position:absolute;
            top:21px;
            bottom:21px;
            left:50%;
            width:1px;
            pointer-events:none;
            background:linear-gradient(transparent,rgba(255,211,155,.23) 22%,rgba(134,232,255,.18) 75%,transparent);
          }
          .op-vip-footer__nav-group {
            align-items:flex-start;
            justify-content:flex-start;
            gap:3px;
            min-width:0;
            padding:0 3px;
          }
          .op-vip-footer__nav-group h3 {
            margin:0 0 13px;
            font-size:11px;
            font-weight:900;
            letter-spacing:1.4px;
            line-height:1.4;
            white-space:nowrap;
            color:#ffdea8;
          }
          .op-vip-footer__nav-group h3 span {width:12px;}
          .op-vip-footer__link {
            width:100%;
            min-height:42px;
            gap:8px;
            padding:7px 0;
            font-size:13px;
            font-weight:650;
            line-height:1.45;
            white-space:normal;
            overflow-wrap:break-word;
            color:#e1dce9 !important;
          }
          .op-vip-footer__link-indicator {font-size:13px;flex:none;}

          /* Main feature uses whole available width and centered typography. */
          .op-vip-footer__feature-shell {
            width:100%;
            border-radius:23px;
            box-shadow:0 18px 45px rgba(0,0,0,.25),0 0 29px rgba(113,74,245,.12);
          }
          .op-vip-footer__feature {
            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content:center;
            width:100%;
            min-height:226px;
            padding:28px 19px;
            border-radius:22px;
            text-align:center;
          }
          .op-vip-footer__feature-kicker {
            font-size:10px;
            letter-spacing:1.45px;
            line-height:1.6;
          }
          .op-vip-footer__feature h2 {
            margin:20px 0 0;
            font-size:clamp(37px,10vw,44px);
            line-height:1.05;
          }
          .op-vip-footer__feature-divider {
            width:min(100%,270px);
            margin:20px auto 14px;
          }
          .op-vip-footer__feature p {
            margin:0 auto;
            max-width:300px;
            font-size:12.5px;
            line-height:1.7;
            text-align:center;
            color:#c9c1d2;
          }
          .op-vip-footer__feature-watermark {
            right:7px;
            bottom:-18px;
            font-size:104px;
            opacity:.028;
          }

          /* Slogan and legal row: deliberate center alignment rather than corners. */
          .op-vip-footer__slogan {
            justify-content:center;
            gap:8px;
            padding:19px 0;
            margin:0;
            font-size:10.5px;
            font-weight:900;
            letter-spacing:1.1px;
            line-height:1.8;
            text-align:center;
          }
          .op-vip-footer__slogan-dot {font-size:10px;}
          .op-vip-footer__bottom {
            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content:center;
            gap:13px;
            padding:24px 4px 32px;
            font-size:10.5px;
            font-weight:750;
            line-height:1.8;
            letter-spacing:.45px;
            text-align:center;
          }
          .op-vip-footer__made {
            display:block;
            color:#c5bbce;
            font-size:10px;
            letter-spacing:1.1px;
          }
          .op-vip-footer__to-top {
            display:inline-flex;
            align-items:center;
            justify-content:center;
            min-height:42px;
            padding:9px 18px;
            border:1px solid rgba(126,234,255,.28);
            border-radius:999px;
            background:rgba(126,234,255,.05);
            color:#f5f3fa !important;
            font-size:11px;
            letter-spacing:1.1px;
          }
        }
        @media (max-width:370px) {
          .op-vip-footer {padding:0 13px;}
          .op-vip-footer__navigation {padding:20px 10px;gap:8px;}
          .op-vip-footer__nav-group {padding:0 2px;}
          .op-vip-footer__nav-group h3 {font-size:10px;letter-spacing:1px;gap:6px;}
          .op-vip-footer__nav-group h3 span {width:10px;}
          .op-vip-footer__link {font-size:12.5px;gap:6px;}
          .op-vip-footer__slogan {font-size:9.5px;letter-spacing:.7px;gap:6px;}
        }
        @media(prefers-reduced-motion:reduce) {
          .op-vip-footer *, .op-vip-footer *::before, .op-vip-footer *::after {animation:none !important;transition:none !important;}
        }
      `}</style>
    </footer>
  );
}
