"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "../assets/logo.png";
import { FaFacebookF, FaWhatsapp, FaDiscord } from "react-icons/fa";

const explore = [
  { name: "Home", href: "/#home" },
  { name: "Our Players", href: "/#players" },
  { name: "Our Teams", href: "/#teams" },
  { name: "Tournaments", href: "/#tournaments" },
];

const community = [
  { name: "Join the Team", href: "/join-team" },
  { name: "Member Login", href: "/login" },
];

const social = [
  { name: "Facebook", detail: "OFFICIAL PAGE", href: "https://www.facebook.com/profile.php?id=61590595667810", color: "fb", Icon: FaFacebookF },
  { name: "WhatsApp", detail: "DIRECT CHAT", href: "https://wa.me/8801715393876", color: "wa", Icon: FaWhatsapp },
  { name: "WA Group", detail: "JOIN THE GROUP", href: "https://chat.whatsapp.com/JUQ9j32a73VJby7nucgzWo", color: "group", Icon: FaWhatsapp },
  { name: "Discord", detail: "OUR SERVER", href: "https://discord.gg/PqVUHpGMa", color: "discord", Icon: FaDiscord },
];

export default function Footer() {
  const backToTop = () => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <footer className="opx-footer" aria-label="Over Power Esports footer">
      <div className="opx-light opx-light--red" aria-hidden="true" />
      <div className="opx-light opx-light--blue" aria-hidden="true" />
      <div className="opx-light opx-light--violet" aria-hidden="true" />
      <div className="opx-scanline" aria-hidden="true" />

      <div className="opx-shell">
        <div className="opx-topbar">
          <span className="opx-live"><i aria-hidden="true" /> THE POWER CONTINUES</span>
          <span className="opx-top-motto">OFFICIAL OVER POWER ESPORTS <b>✦</b> DIGITAL HOME</span>
        </div>

        <div className="opx-hero">
          <div className="opx-story">
            <Link href="/#home" className="opx-identity" aria-label="Over Power Esports Home">
              <span className="opx-logo-ring">
                <span className="opx-logo-core">
                  <Image src={logo} width={90} height={90} alt="Over Power Esports logo" />
                </span>
              </span>
              <span className="opx-brandname"><strong>OVER POWER</strong><b>ESPORTS</b></span>
            </Link>

            <div className="opx-eyebrow"><span /> UNSTOPPABLE SPIRIT · ONE COMMUNITY</div>
            <h2 className="opx-statement">MORE THAN<br /><span>A GAME.</span></h2>
            <p className="opx-intro">Victory is our mission. Built on discipline, driven by passion, united by the game.</p>
            <div className="opx-signature"><span>POWER</span><i>✦</i><span>UNITY</span><i>✦</i><span>DOMINATION</span></div>
          </div>

          <div className="opx-feature-frame">
            <div className="opx-feature">
              <div className="opx-feature-head"><span>✦ THE OVER POWER MINDSET</span><span>OP / 01</span></div>
              <div className="opx-feature-inner">
                <span className="opx-feature-kicker">YOUR LEGACY STARTS HERE</span>
                <h3>BEYOND<br /><em>THE GAME.</em></h3>
                <p>Every second matters. Every victory is earned. Be part of what comes next.</p>
                <Link href="/join-team" className="opx-join"><span>START YOUR JOURNEY</span><b aria-hidden="true">↗</b></Link>
              </div>
              <div className="opx-feature-foot"><span>CRAFTED FOR CHAMPIONS</span><span>✧ ✧ ✧</span></div>
              <span className="opx-feature-watermark" aria-hidden="true">OP</span>
            </div>
          </div>
        </div>

        <div className="opx-content">
          <nav className="opx-nav" aria-label="Footer navigation">
            <div className="opx-section-title"><i /> EXPLORE THE UNIVERSE</div>
            <div className="opx-nav-grid">
              <div className="opx-nav-column">
                <h3>EXPLORE</h3>
                {explore.map(({ name, href }) => (
                  <Link href={href} key={href}><span aria-hidden="true">↗</span>{name}</Link>
                ))}
              </div>
              <div className="opx-nav-column">
                <h3>COMMUNITY</h3>
                {community.map(({ name, href }) => (
                  <Link href={href} key={href}><span aria-hidden="true">↗</span>{name}</Link>
                ))}
                <a href="tel:+8801715393876"><span aria-hidden="true">↗</span>Contact Us</a>
              </div>
            </div>
          </nav>

          <section className="opx-connect" id="opx-connect" aria-label="Connect with Over Power Esports">
            <div className="opx-connect-heading">
              <div><div className="opx-section-title"><i /> YOUR SQUAD. YOUR COMMUNITY.</div><h3>STAY <span>CONNECTED.</span></h3></div>
              <span className="opx-connect-decor">04 / OFFICIAL CHANNELS · LIVE CONNECTIONS</span>
            </div>
            <div className="opx-social-grid">
              {social.map(({ name, detail, href, color, Icon }) => (
                <a key={color} className={`opx-social opx-social--${color}`} href={href} target="_blank" rel="noopener noreferrer" aria-label={name + " — " + detail}>
                  <span className="opx-social-light" aria-hidden="true" />
                  <span className="opx-social-orb"><Icon aria-hidden="true" /></span>
                  <strong>{name}</strong><small>{detail}</small>
                  <span className="opx-social-arrow" aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
            <a className="opx-hotline" href="tel:+8801715393876"><span aria-hidden="true">✦</span> DIRECT LINE <b>+880 1715-393876</b><span aria-hidden="true">↗</span></a>
          </section>
        </div>

        <div className="opx-bigword" aria-hidden="true">OVER POWER</div>
        <div className="opx-bottom">
          <small>© {new Date().getFullYear()} OVER POWER ESPORTS. ALL RIGHTS RESERVED.</small>
          <span>BUILT FOR CHAMPIONS <b>✦</b></span>
          <button type="button" onClick={backToTop}>BACK TO TOP <span aria-hidden="true">↑</span></button>
        </div>
      </div>

      <style jsx global>{`
        .opx-footer,.opx-footer *{box-sizing:border-box}
        .opx-footer{position:relative;isolation:isolate;overflow:hidden;width:100%;margin:48px 0 0;color:#f9f8fd;background:radial-gradient(ellipse at 8% 5%,#200817 0%,transparent 40%),radial-gradient(ellipse at 100% 90%,#08222b 0%,transparent 40%),#06060c;font-family:Arial,Helvetica,sans-serif;border-top:1px solid rgba(255,194,148,.35);text-align:left}
        .opx-footer:before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.023) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.023) 1px,transparent 1px);background-size:79px 79px;mask-image:linear-gradient(180deg,#000,transparent 88%)}
        .opx-light{position:absolute;z-index:-1;pointer-events:none;border-radius:50%;filter:blur(85px);animation:opxBreathe 8s ease-in-out infinite alternate}
        .opx-light--red{width:530px;height:430px;background:rgba(247,35,91,.18);top:-230px;left:-130px}
        .opx-light--blue{width:570px;height:440px;background:rgba(22,199,237,.16);bottom:-280px;right:-190px;animation-delay:-3s}
        .opx-light--violet{width:530px;height:420px;background:rgba(132,75,246,.16);top:130px;right:9%;animation-delay:-5s}
        .opx-scanline{position:absolute;left:-40%;top:0;width:42%;height:2px;pointer-events:none;background:linear-gradient(90deg,transparent,#ff588d,#ffe1a7,#81eaf8,transparent);box-shadow:0 0 23px rgba(255,156,147,.75);animation:opxScan 9s linear infinite}
        .opx-shell{position:relative;max-width:1540px;margin:auto;padding:0 clamp(20px,4.2vw,74px)}
        .opx-topbar{min-height:77px;display:flex;align-items:center;justify-content:space-between;gap:18px;border-bottom:1px solid rgba(255,255,255,.12);color:#dcd5e5;font-size:10px;font-weight:900;letter-spacing:2px}
        .opx-live{display:inline-flex;align-items:center;gap:11px;color:#ffecdb}
        .opx-live i{width:8px;height:8px;flex:none;border-radius:50%;background:#62eacc;box-shadow:0 0 0 5px rgba(98,234,204,.1),0 0 17px #62eacc;animation:opxPulse 2.5s infinite}
        .opx-top-motto b{color:#ffd6a1;margin:0 7px}
        .opx-hero{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(330px,.8fr);gap:clamp(35px,5.2vw,90px);align-items:stretch;padding:65px 0 65px}
        .opx-story{min-width:0;display:flex;flex-direction:column;align-items:flex-start}
        .opx-identity{display:inline-flex;gap:19px;align-items:center;max-width:100%;color:#fff!important;text-decoration:none!important}
        .opx-logo-ring{width:94px;height:94px;flex:0 0 94px;display:grid;place-items:center;position:relative;border-radius:50%;box-shadow:0 0 42px rgba(255,72,122,.20)}
        .opx-logo-ring:before{content:"";position:absolute;inset:0;border-radius:50%;background:conic-gradient(#ffe0a5,#ff598f,#936eff,#7fe8f9,#ffe0a5);animation:opxRotate 9s linear infinite}
        .opx-logo-core{position:relative;z-index:1;width:84px;height:84px;display:block;overflow:hidden;border:3px solid #120c19;border-radius:50%;background:#0d0b14}
        .opx-logo-core img{width:100%;height:100%;object-fit:cover;border-radius:50%;display:block}
        .opx-brandname{display:flex;flex-direction:column;gap:5px;font-family:var(--font-orbitron),Arial,sans-serif;line-height:1.1}
        .opx-brandname strong{font-size:clamp(22px,2.1vw,31px);font-weight:950;letter-spacing:1.8px;white-space:nowrap;text-shadow:0 0 24px rgba(255,255,255,.19)}
        .opx-brandname b{font-size:clamp(22px,2.3vw,33px);letter-spacing:6px;background:linear-gradient(90deg,#ff638d,#ffbaa0,#ffe2a4);background-clip:text;-webkit-background-clip:text;color:transparent}
        .opx-eyebrow{display:flex;align-items:center;gap:10px;margin-top:38px;font-size:11px;letter-spacing:2.3px;font-weight:900;color:#ffddaa}
        .opx-eyebrow span{width:28px;height:2px;background:linear-gradient(90deg,#ff739d,#ffdb92);box-shadow:0 0 12px #ff5b97}
        .opx-statement{margin:18px 0 18px!important;font-family:var(--font-orbitron),Arial,sans-serif;font-weight:950;letter-spacing:-2px;line-height:1.08;color:#fff;font-size:clamp(47px,5.3vw,87px);text-shadow:0 0 35px rgba(255,255,255,.11)}
        .opx-statement span{background:linear-gradient(95deg,#ffe0a2 0%,#ff789e 48%,#ab99ff 82%,#8deeff 100%);background-size:200% 100%;background-clip:text;-webkit-background-clip:text;color:transparent;animation:opxColor 8s linear infinite alternate;filter:drop-shadow(0 0 18px rgba(255,98,148,.22))}
        .opx-intro{max-width:590px;margin:0!important;color:#c6becc;font-size:clamp(15px,1.25vw,18px);line-height:1.85}
        .opx-signature{display:flex;align-items:center;gap:18px;margin-top:34px;color:#f8ecf4;font-size:11px;font-weight:900;letter-spacing:2.8px}
        .opx-signature i{font-style:normal;color:#ffcc91;text-shadow:0 0 18px #ff9f82}
        .opx-feature-frame{position:relative;min-width:0;padding:1px;border-radius:30px;background:linear-gradient(130deg,rgba(255,218,159,.95),rgba(255,110,158,.58) 36%,rgba(154,111,255,.64) 74%,rgba(132,239,255,.92));box-shadow:0 23px 75px rgba(0,0,0,.30),0 0 50px rgba(144,74,234,.19)}
        .opx-feature-frame:before{content:"";position:absolute;inset:-5px;border-radius:inherit;z-index:-1;background:conic-gradient(from 90deg,transparent,rgba(255,157,181,.55),transparent,rgba(133,241,255,.4),transparent);filter:blur(24px);opacity:.55;animation:opxRotate 16s linear infinite}
        .opx-feature{position:relative;min-height:420px;height:100%;display:flex;flex-direction:column;isolation:isolate;overflow:hidden;padding:clamp(25px,2.8vw,43px);border-radius:29px;background:radial-gradient(circle at 82% 17%,rgba(139,75,240,.26),transparent 40%),linear-gradient(145deg,#23172b 0%,#11101c 64%,#080d14 100%)}
        .opx-feature:after{content:"";position:absolute;width:320px;height:320px;border:1px solid rgba(255,255,255,.065);border-radius:50%;right:-160px;bottom:-180px;box-shadow:0 0 0 36px rgba(255,255,255,.025),0 0 0 78px rgba(255,255,255,.02);pointer-events:none}
        .opx-feature-head,.opx-feature-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;color:#90edff;font-size:10px;letter-spacing:1.4px;font-weight:900;position:relative;z-index:1}
        .opx-feature-head span:last-child{color:#988baf}
        .opx-feature-inner{position:relative;z-index:1;margin:auto 0;padding:26px 0 31px}
        .opx-feature-kicker{color:#e9c997;font-size:11px;font-weight:900;letter-spacing:2px}
        .opx-feature h3{margin:14px 0 15px!important;font-family:var(--font-orbitron),Arial,sans-serif;font-size:clamp(37px,3.5vw,54px);line-height:1.07;font-weight:950;letter-spacing:-1.3px;color:#fff;text-shadow:0 0 20px rgba(255,255,255,.17)}
        .opx-feature h3 em{font-style:normal;background:linear-gradient(100deg,#ffb78d,#ff669a 62%,#97e5ff);background-clip:text;-webkit-background-clip:text;color:transparent}
        .opx-feature-inner p{margin:0!important;max-width:340px;color:#d1c9d9;font-size:14px;line-height:1.7}
        .opx-join{position:relative;display:flex;align-items:center;justify-content:space-between;gap:15px;width:min(100%,330px);min-height:57px;margin-top:25px;padding:6px 7px 6px 22px;border-radius:15px;border:1px solid rgba(255,208,148,.55);background:linear-gradient(105deg,#ff4e7c,#cc3d6c 65%,#9e3a84);color:#fff!important;font-size:12px;letter-spacing:1.8px;font-weight:950;text-decoration:none!important;box-shadow:0 8px 32px rgba(255,60,121,.26);transition:transform .25s,box-shadow .25s}
        .opx-join:hover{transform:translateY(-3px);box-shadow:0 13px 42px rgba(255,60,121,.48)}
        .opx-join b{display:grid;place-items:center;width:43px;height:43px;flex:none;border-radius:11px;background:linear-gradient(130deg,#ffe5b0,#fff0d7);color:#3b132b;font-size:26px}
        .opx-feature-foot{color:#a99db8;letter-spacing:1.6px}
        .opx-feature-foot span:last-child{color:#f3c993}
        .opx-feature-watermark{position:absolute;right:-8px;bottom:-40px;opacity:.045;color:#fff;font-size:170px;font-family:Arial,sans-serif;font-weight:1000;line-height:1;letter-spacing:-22px;pointer-events:none}
        .opx-content{display:grid;grid-template-columns:minmax(290px,.72fr) minmax(0,1.28fr);gap:clamp(28px,5vw,82px);border-top:1px solid rgba(255,255,255,.12);padding:43px 0 47px}
        .opx-nav{min-width:0}
        .opx-section-title{display:flex;align-items:center;gap:9px;color:#f1d49f;font-size:11px;font-weight:950;letter-spacing:2px}
        .opx-section-title i{width:18px;height:2px;background:linear-gradient(90deg,#ff6596,#ffe1a5);box-shadow:0 0 12px rgba(255,114,163,.5)}
        .opx-nav-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:24px}
        .opx-nav-column{display:flex;flex-direction:column;align-items:flex-start;gap:7px;min-width:0}
        .opx-nav-column h3{margin:0 0 12px!important;color:#fff;font-size:13px;letter-spacing:1.5px;font-weight:950}
        .opx-nav-column a{display:inline-flex;align-items:center;gap:9px;min-height:35px;color:#c9c3d1!important;text-decoration:none!important;font-size:13px;font-weight:750;transition:transform .23s,color .23s}
        .opx-nav-column a span{color:#84eaff;font-size:17px}
        .opx-nav-column a:hover{color:#fff!important;transform:translateX(5px)}
        .opx-connect{min-width:0}
        .opx-connect-heading{display:flex;justify-content:space-between;align-items:end;gap:10px;margin-bottom:20px}
        .opx-connect-heading h3{margin:10px 0 0!important;font-family:var(--font-orbitron),Arial,sans-serif;font-size:clamp(20px,2vw,30px);font-weight:950;letter-spacing:-.3px;color:#fff}
        .opx-connect-heading h3 span{background:linear-gradient(95deg,#ffc4a2,#ff7da9,#8deaff);background-clip:text;-webkit-background-clip:text;color:transparent}
        .opx-connect-decor{font-size:10px;font-weight:800;color:#a99ebc;letter-spacing:1px;text-align:right}
        .opx-social-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
        .opx-social{position:relative;isolation:isolate;display:flex;flex-direction:column;justify-content:center;align-items:center;min-width:0;min-height:139px;gap:6px;padding:15px 8px;border:1px solid rgba(255,255,255,.13);border-radius:19px;background:linear-gradient(155deg,rgba(255,255,255,.08),rgba(11,10,19,.90) 75%);color:#fff!important;text-decoration:none!important;overflow:hidden;transition:transform .3s,border-color .3s,box-shadow .3s}
        .opx-social:before{content:"";position:absolute;inset:0;pointer-events:none;z-index:-1;background:radial-gradient(circle at 50% 26%,var(--opx-aura),transparent 58%);opacity:.52;transition:opacity .3s}
        .opx-social--fb{--opx-accent:#74b5ff;--opx-aura:rgba(45,105,255,.33)}
        .opx-social--wa{--opx-accent:#71f6af;--opx-aura:rgba(30,226,121,.29)}
        .opx-social--group{--opx-accent:#91ecf2;--opx-aura:rgba(29,212,204,.30)}
        .opx-social--discord{--opx-accent:#b8a9ff;--opx-aura:rgba(105,91,254,.34)}
        .opx-social-orb{display:grid;place-items:center;width:52px;height:52px;border-radius:17px;border:1px solid color-mix(in srgb,var(--opx-accent),transparent 45%);background:linear-gradient(145deg,rgba(255,255,255,.13),rgba(255,255,255,.025));color:var(--opx-accent);font-size:25px;box-shadow:0 0 25px var(--opx-aura),inset 0 1px rgba(255,255,255,.16);transition:transform .3s}
        .opx-social strong{font-size:13px;letter-spacing:.2px;font-weight:950}
        .opx-social small{color:#a8a3b5;font-size:9px;font-weight:850;letter-spacing:1px;line-height:1.4;text-align:center}
        .opx-social-arrow{position:absolute;top:9px;right:12px;color:#8c849e;font-size:15px;transition:color .25s}
        .opx-social:hover{transform:translateY(-7px);border-color:var(--opx-accent);box-shadow:0 15px 40px rgba(0,0,0,.35),0 0 28px var(--opx-aura)}
        .opx-social:hover:before{opacity:1}
        .opx-social:hover .opx-social-orb{transform:scale(1.1)}
        .opx-social:hover .opx-social-arrow{color:var(--opx-accent)}
        .opx-hotline{display:inline-flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:19px;color:#b9adbf!important;font-size:11px;font-weight:900;letter-spacing:1.1px;text-decoration:none!important}
        .opx-hotline b{color:#9eeeff;font-size:13px;letter-spacing:.4px}
        .opx-hotline span{color:#ffd49a}
        .opx-bigword{overflow:hidden;white-space:nowrap;padding:12px 0 5px;text-align:center;border-top:1px solid rgba(255,255,255,.1);font-family:var(--font-orbitron),Arial,sans-serif;font-size:clamp(60px,11.1vw,173px);font-weight:1000;line-height:1.14;letter-spacing:-7px;color:transparent;-webkit-text-stroke:1px rgba(240,225,250,.11);text-shadow:0 0 80px rgba(184,82,234,.06);pointer-events:none;user-select:none}
        .opx-bottom{display:grid;grid-template-columns:1fr auto 1fr;gap:15px;align-items:center;min-height:91px;padding:17px 0 20px;border-top:1px solid rgba(255,255,255,.1);color:#a59eb2;font-size:10px;font-weight:850;letter-spacing:1px}
        .opx-bottom small{font-size:inherit;line-height:1.65}
        .opx-bottom>span{color:#d6cad8}
        .opx-bottom>span b{color:#ffdc9e;margin-left:6px}
        .opx-bottom button{justify-self:end;display:inline-flex;align-items:center;gap:12px;padding:12px 18px;border-radius:999px;border:1px solid rgba(134,230,248,.38);background:rgba(134,230,248,.065);color:#fff;font-size:11px;font-weight:900;letter-spacing:1px;cursor:pointer;transition:background .2s,transform .2s}
        .opx-bottom button:hover{background:rgba(134,230,248,.18);transform:translateY(-3px)}
        .opx-bottom button span{font-size:19px;color:#87edff}
        .opx-footer a:focus-visible,.opx-footer button:focus-visible{outline:2px solid #84ecff;outline-offset:4px}
        @media(max-width:1250px){
          .opx-hero{grid-template-columns:minmax(0,1fr) minmax(310px,.87fr);gap:30px}
          .opx-content{grid-template-columns:1fr;gap:38px}
          .opx-social-grid{grid-template-columns:repeat(4,minmax(0,1fr))}
        }
        @media(max-width:1050px){
          .opx-hero{display:flex;flex-direction:column;align-items:center;gap:32px;padding:46px 0}
          .opx-story{width:100%;align-items:center;text-align:center}
          .opx-eyebrow{justify-content:center;margin-top:27px}
          .opx-intro{text-align:center}
          .opx-signature{justify-content:center}
          .opx-feature-frame{width:min(100%,670px)}
          .opx-feature{min-height:340px}
          .opx-content{padding:35px 0}
          .opx-nav,.opx-connect{width:min(100%,760px);margin:0 auto}
          .opx-nav{text-align:center}
          .opx-nav .opx-section-title,.opx-connect .opx-section-title{justify-content:center}
          .opx-nav-grid{width:min(100%,600px);margin:24px auto 0}
          .opx-nav-column{align-items:center;text-align:center}
          .opx-connect-heading{flex-direction:column;align-items:center;text-align:center}
          .opx-connect-decor{text-align:center}
          .opx-hotline{display:flex;justify-content:center}
          .opx-bottom{display:flex;flex-direction:column;text-align:center;justify-content:center;padding:25px 0;gap:13px}
          .opx-bottom button{justify-self:center}
        }
        @media(max-width:620px){
          .opx-shell{padding:0 17px}
          .opx-topbar{flex-direction:column;justify-content:center;min-height:90px;padding:17px 0;gap:9px;text-align:center;font-size:9px;letter-spacing:1.2px}
          .opx-hero{padding:35px 0 39px;gap:28px}
          .opx-logo-ring{width:76px;height:76px;flex-basis:76px}
          .opx-logo-core{width:68px;height:68px}
          .opx-identity{gap:12px}
          .opx-brandname strong{font-size:clamp(18px,4.9vw,24px);letter-spacing:1px}
          .opx-brandname b{font-size:clamp(19px,5.2vw,26px);letter-spacing:3px}
          .opx-eyebrow{font-size:9px;letter-spacing:1.1px;margin-top:29px}
          .opx-statement{font-size:clamp(42px,11vw,65px);letter-spacing:-1.6px;margin:16px 0!important}
          .opx-intro{font-size:14px;line-height:1.7;max-width:380px}
          .opx-signature{gap:9px;font-size:9px;letter-spacing:1.1px;margin-top:22px}
          .opx-feature{padding:24px 21px;min-height:345px}
          .opx-feature h3{font-size:clamp(34px,9vw,45px)}
          .opx-feature-kicker{font-size:9px}
          .opx-feature-inner{padding:15px 0 18px}
          .opx-feature-inner p{font-size:13px}
          .opx-feature-foot,.opx-feature-head{font-size:8px;letter-spacing:.6px}
          .opx-join{min-height:52px}
          .opx-content{gap:37px;padding:34px 0 38px}
          .opx-section-title{font-size:10px;letter-spacing:1.25px}
          .opx-nav-grid{gap:14px}
          .opx-nav-column h3{font-size:12px}
          .opx-nav-column a{font-size:13px}
          .opx-connect-heading h3{font-size:24px}
          .opx-social-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}
          .opx-social{min-height:127px}
          .opx-social-orb{width:49px;height:49px;font-size:23px}
          .opx-social strong{font-size:13px}
          .opx-bigword{font-size:clamp(40px,11vw,69px);letter-spacing:-3px;padding:17px 0}
          .opx-bottom{font-size:9px;letter-spacing:.6px}
        }
        @media(max-width:350px){
          .opx-shell{padding:0 12px}
          .opx-identity{gap:8px}
          .opx-brandname strong{font-size:16px}
          .opx-brandname b{font-size:17px;letter-spacing:2px}
          .opx-logo-ring{width:64px;height:64px;flex-basis:64px}
          .opx-logo-core{width:57px;height:57px}
          .opx-signature{gap:6px;font-size:8px}
          .opx-feature{padding:20px 17px}
          .opx-nav-grid{gap:8px}
          .opx-nav-column a{font-size:12px;gap:5px}
          .opx-social{min-height:116px}
        }
        @keyframes opxRotate{to{transform:rotate(360deg)}}
        @keyframes opxBreathe{to{opacity:.62;transform:scale(1.14) translateY(15px)}}
        @keyframes opxPulse{50%{opacity:.35;box-shadow:0 0 0 9px rgba(98,234,204,.045),0 0 12px #62eacc}}
        @keyframes opxScan{to{left:110%}}
        @keyframes opxColor{to{background-position:100% 0}}

        /* ===== OVER POWER | CINEMATIC VIP FINISH ===== */
        .opx-footer {
          --opx-gold:#ffda99;--opx-frost:#98f0ff;--opx-rose:#ff6a96;
          background:radial-gradient(ellipse 52% 48% at 5% 6%,rgba(111,17,49,.30),transparent 100%),radial-gradient(ellipse 50% 58% at 96% 77%,rgba(8,81,98,.22),transparent 100%),#06070e;
          box-shadow:inset 0 35px 90px rgba(0,0,0,.24);
        }
        .opx-footer:after {
          content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;
          background:radial-gradient(circle at 50% 0%,rgba(255,255,255,.07) 0 1px,transparent 2px);
          background-size:58px 58px;opacity:.14;
          -webkit-mask-image:linear-gradient(#000,transparent 85%);mask-image:linear-gradient(#000,transparent 85%);
        }
        .opx-light--red {background:rgba(255,31,90,.27)}
        .opx-light--violet {background:rgba(119,68,245,.21)}
        .opx-light--blue {background:rgba(15,203,227,.20)}
        .opx-topbar {border-bottom:1px solid rgba(255,226,187,.15)}
        .opx-live {text-shadow:0 0 14px rgba(255,255,255,.18)}
        .opx-logo-ring {filter:drop-shadow(0 0 18px rgba(255,99,149,.26))}
        .opx-eyebrow {color:#ffe6c3}
        .opx-statement {
          font-size:clamp(48px,5.4vw,90px);
          text-shadow:0 4px 30px rgba(255,255,255,.16),0 10px 50px rgba(255,91,139,.12);
        }
        .opx-statement span{filter:drop-shadow(0 0 19px rgba(255,113,167,.29))}
        .opx-feature-frame {
          background:linear-gradient(125deg,rgba(255,221,166,.92),rgba(255,97,145,.72) 33%,rgba(145,112,251,.76) 67%,rgba(128,231,255,.89));
          box-shadow:0 30px 90px rgba(0,0,0,.36),0 0 46px rgba(155,91,255,.25),inset 0 0 18px rgba(255,255,255,.18);
        }
        .opx-feature {min-height:385px;background:radial-gradient(ellipse at 86% 4%,rgba(147,83,255,.34),transparent 60%),radial-gradient(ellipse at 3% 100%,rgba(240,45,97,.10),transparent 62%),linear-gradient(150deg,#24172e,#090c18 80%)}
        .opx-feature:before {
          content:"";position:absolute;z-index:0;left:-60%;top:-50%;width:65%;height:200%;
          background:linear-gradient(100deg,transparent,rgba(255,255,255,.045),rgba(255,226,174,.06),transparent);
          transform:rotate(19deg);animation:opxVipSweep 9s linear infinite;pointer-events:none;
        }
        .opx-feature h3{filter:drop-shadow(0 0 13px rgba(255,215,232,.17))}
        .opx-feature h3 em{filter:drop-shadow(0 0 15px rgba(255,111,158,.18))}
        .opx-join {overflow:hidden;isolation:isolate;box-shadow:0 9px 36px rgba(255,60,121,.33),0 0 20px rgba(255,215,145,.14)}
        .opx-join:after {
          content:"";position:absolute;z-index:-1;top:0;left:-120%;width:90%;height:100%;
          background:linear-gradient(100deg,transparent,rgba(255,255,255,.26),transparent);
          transform:skewX(-20deg);animation:opxVipButton 7s ease-in-out infinite;
        }
        .opx-content {border-top:1px solid rgba(255,221,189,.15);gap:clamp(38px,5vw,86px)}
        .opx-section-title {color:#ffe4b7;text-shadow:0 0 18px rgba(255,200,116,.20)}
        .opx-nav-grid {gap:clamp(16px,2vw,34px)}
        .opx-nav-column a {min-height:40px;padding:3px 9px;border-radius:9px;transition:transform .2s ease,color .2s ease,background .2s ease}
        .opx-nav-column a:hover {background:rgba(255,255,255,.055)}
        .opx-connect-heading {margin-bottom:21px}
        .opx-connect-heading h3 {font-size:clamp(23px,2.4vw,34px);letter-spacing:-.6px}
        .opx-connect-heading h3 span{filter:drop-shadow(0 0 13px rgba(255,116,153,.24))}
        .opx-social-grid {gap:14px}
        .opx-social {
          min-height:156px;padding:20px 10px 16px;border:1px solid rgba(255,255,255,.16);
          border-radius:22px;background:linear-gradient(155deg,rgba(255,255,255,.10),rgba(12,12,24,.95) 77%);
          box-shadow:0 14px 38px rgba(0,0,0,.20),inset 0 1px rgba(255,255,255,.11);
          gap:8px;
        }
        .opx-social:after {
          content:"";position:absolute;inset:0;border-radius:inherit;z-index:-1;pointer-events:none;
          border-top:1px solid rgba(255,255,255,.16);
          background:linear-gradient(145deg,rgba(255,255,255,.065),transparent 55%);
        }
        .opx-social:before {opacity:.77;background:radial-gradient(ellipse at 50% 29%,var(--opx-aura) 0%,transparent 74%)}
        .opx-social-light {
          position:absolute;pointer-events:none;width:75px;height:75px;top:13px;left:calc(50% - 37.5px);
          border-radius:50%;background:var(--opx-aura);filter:blur(25px);opacity:.90;
          animation:opxVipOrb 4.5s ease-in-out infinite alternate;
        }
        .opx-social:nth-child(2) .opx-social-light{animation-delay:-1.1s}
        .opx-social:nth-child(3) .opx-social-light{animation-delay:-2.2s}
        .opx-social:nth-child(4) .opx-social-light{animation-delay:-3.3s}
        .opx-social-orb {
          width:61px;height:61px;font-size:29px;z-index:1;
          border-radius:19px;border:1px solid var(--opx-accent);
          background:linear-gradient(150deg,rgba(255,255,255,.14),rgba(8,9,19,.62));
          box-shadow:0 0 28px var(--opx-aura),inset 0 0 14px rgba(255,255,255,.05);
        }
        .opx-social strong {position:relative;z-index:1;font-size:14px;font-weight:900;color:#fff;text-shadow:0 0 16px rgba(255,255,255,.20)}
        .opx-social small {position:relative;z-index:1;color:#d2cbdb;letter-spacing:.85px;font-size:10px}
        .opx-social-arrow {color:var(--opx-accent);opacity:.8}
        .opx-social:hover {transform:translateY(-6px);border-color:var(--opx-accent);box-shadow:0 17px 45px rgba(0,0,0,.43),0 0 35px var(--opx-aura)}
        .opx-social:hover .opx-social-orb {transform:scale(1.08) rotate(-4deg)}
        .opx-hotline {padding:10px 14px;border:1px solid rgba(143,237,255,.18);border-radius:999px;background:rgba(113,223,245,.035)}
        .opx-hotline b {color:#a4f3ff}
        .opx-bigword {font-size:clamp(57px,10.2vw,157px);letter-spacing:-.06em;-webkit-text-stroke:1px rgba(255,226,244,.13);text-shadow:0 0 60px rgba(144,116,245,.1)}
        .opx-bottom {color:#bcb3c7}

        /* Laptop / mobile browsers requesting a desktop-width viewport */
        @media(max-width:1180px){
          .opx-hero{display:flex;flex-direction:column;align-items:center;gap:29px;padding:45px 0 40px}
          .opx-story{width:100%;align-items:center;text-align:center}
          .opx-eyebrow,.opx-signature{justify-content:center}
          .opx-intro{text-align:center}
          .opx-feature-frame{width:min(100%,650px)}
          .opx-feature{min-height:310px}
          .opx-content{grid-template-columns:1fr;gap:31px;padding:36px 0 39px}
          .opx-nav,.opx-connect{width:min(100%,730px);margin:0 auto}
          .opx-nav,.opx-connect{text-align:center}
          .opx-section-title,.opx-connect .opx-section-title{justify-content:center}
          .opx-nav-grid{max-width:600px;margin:20px auto 0}
          .opx-nav-column{align-items:center;text-align:center}
          .opx-connect-heading{align-items:center;justify-content:center;flex-direction:column;text-align:center}
          .opx-social-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:15px;max-width:650px;margin:auto}
          .opx-social{min-height:145px}
          .opx-hotline{justify-content:center;margin-top:20px}
          .opx-bottom{display:flex;flex-direction:column;gap:13px;justify-content:center;text-align:center;padding:21px 0 28px}
        }
        @media(max-width:620px){
          .opx-shell{padding:0 18px}
          .opx-topbar{min-height:70px;padding:16px 0;gap:8px}
          .opx-hero{padding:25px 0 28px;gap:24px}
          .opx-eyebrow{margin-top:23px;font-size:9px}
          .opx-statement{font-size:clamp(40px,11vw,62px);margin:14px 0 13px!important}
          .opx-intro{font-size:13px;line-height:1.65;max-width:360px}
          .opx-signature{margin-top:20px}
          .opx-feature{min-height:295px;padding:22px 20px}
          .opx-feature h3{font-size:clamp(34px,9vw,44px)}
          .opx-feature-inner{padding:16px 0}
          .opx-feature-head,.opx-feature-foot{font-size:8px}
          .opx-feature-kicker{font-size:10px}
          .opx-join{min-height:51px}
          .opx-content{gap:26px;padding:29px 0 31px}
          .opx-nav-grid{margin-top:16px;gap:12px}
          .opx-nav-column h3{margin-bottom:8px!important}
          .opx-nav-column a{min-height:37px;font-size:13px;justify-content:center;padding:2px 4px}
          .opx-connect-heading{margin-bottom:17px}
          .opx-connect-heading h3{font-size:clamp(20px,5.8vw,27px)}
          .opx-connect-decor{font-size:9px}
          .opx-social-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}
          .opx-social{min-height:126px;padding:13px 6px;gap:6px;border-radius:18px}
          .opx-social-orb{width:52px;height:52px;font-size:25px;border-radius:15px}
          .opx-social strong{font-size:13px}
          .opx-social small{font-size:8px;letter-spacing:.65px}
          .opx-hotline{font-size:10px;margin-top:16px}
          .opx-bigword{font-size:clamp(35px,10vw,65px);letter-spacing:-.05em;padding:12px 0}
          .opx-bottom{padding:19px 0 25px}
        }
        @media(max-width:350px){
          .opx-shell{padding:0 13px}
          .opx-social-grid{gap:9px}
          .opx-social{min-height:124px}
          .opx-social-orb{width:47px;height:47px;font-size:23px}
          .opx-nav-grid{gap:7px}
          .opx-nav-column a{font-size:12px}
        }
        @keyframes opxVipOrb{to{opacity:.47;transform:scale(1.25)}}
        @keyframes opxVipSweep{to{left:160%}}
        @keyframes opxVipButton{0%,20%,100%{left:-120%}45%,68%{left:140%}}

        @media(prefers-reduced-motion:reduce){.opx-footer *,.opx-footer *:before,.opx-footer *:after{animation:none!important;transition:none!important}}
      `}</style>
    </footer>
  );
}
