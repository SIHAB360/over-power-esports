"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "../assets/logo.png";
import { FaFacebookF, FaWhatsapp, FaDiscord } from "react-icons/fa";

const exploreLinks = [
  { name: "Home", href: "/#home" },
  { name: "Our Players", href: "/#players" },
  { name: "Our Teams", href: "/#teams" },
  { name: "Tournaments", href: "/#tournaments" },
];

const communityLinks = [
  { name: "Join the Team", href: "/join-team" },
  { name: "Member Login", href: "/login" },
];

// Official community links. WhatsApp chat and WhatsApp group are separate.
const socialLinks = [
  {
    name: "Facebook Page",
    shortName: "FACEBOOK",
    href: "https://www.facebook.com/profile.php?id=61590595667810",
    styleName: "facebook",
    Icon: FaFacebookF,
  },
  {
    name: "WhatsApp Direct Chat",
    shortName: "WHATSAPP",
    href: "https://wa.me/8801715393876",
    styleName: "whatsapp",
    Icon: FaWhatsapp,
  },
  {
    name: "WhatsApp Community Group",
    shortName: "WA GROUP",
    href: "https://chat.whatsapp.com/JUQ9j32a73VJby7nucgzWo",
    styleName: "group",
    Icon: FaWhatsapp,
  },
  {
    name: "Discord Server",
    shortName: "DISCORD",
    href: "https://discord.gg/PqVUHpGMa",
    styleName: "discord",
    Icon: FaDiscord,
  },
];

export default function Footer() {
  const backToTop = () => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <footer className="op-royal-footer" aria-label="Over Power Esports footer">
      <div className="op-royal-footer__light op-royal-footer__light--red" aria-hidden="true" />
      <div className="op-royal-footer__light op-royal-footer__light--blue" aria-hidden="true" />
      <div className="op-royal-footer__light op-royal-footer__light--purple" aria-hidden="true" />
      <div className="op-royal-footer__laser" aria-hidden="true" />
      <div className="op-royal-footer__inner">
        <div className="op-royal-footer__top">
          <span className="op-royal-footer__online"><i aria-hidden="true" /> THE POWER CONTINUES</span>
          <span className="op-royal-footer__tagline">✦ POWER · UNITY · DOMINATION</span>
        </div>

        <div className="op-royal-footer__layout">
          <section className="op-royal-footer__brand" aria-label="Over Power Esports">
            <Link href="/#home" className="op-royal-footer__identity" aria-label="Over Power Esports - Home">
              <span className="op-royal-footer__logo-ring">
                <span className="op-royal-footer__logo-holder">
                  <Image src={logo} alt="Over Power Esports logo" width={76} height={76} />
                </span>
              </span>
              <span className="op-royal-footer__wordmark">
                <strong>OVER POWER</strong>
                <b>ESPORTS</b>
              </span>
            </Link>
            <p className="op-royal-footer__description">
              Victory is our mission. Built on discipline, driven by passion,
              united by the game.
            </p>
            <Link href="/join-team" className="op-royal-footer__join">
              <span>JOIN THE TEAM</span><span className="op-royal-footer__join-icon" aria-hidden="true">↗</span>
            </Link>
            <p className="op-royal-footer__micro">✧ THE NEXT GENERATION OF CHAMPIONS</p>

            <div className="op-royal-footer__social-area">
              <h3 className="op-royal-footer__social-heading">
                <span aria-hidden="true">✦</span> CONNECT WITH THE POWER
              </h3>
              <div className="op-royal-footer__socials" aria-label="Official social media and community links">
                {socialLinks.map(({ name, shortName, href, styleName, Icon }) => (
                  <a
                    key={styleName}
                    href={href}
                    className={`op-royal-footer__social op-royal-footer__social--${styleName}`}
                    aria-label={name}
                    title={name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="op-royal-footer__social-icon"><Icon aria-hidden="true" /></span>
                    <span className="op-royal-footer__social-name">{shortName}</span>
                  </a>
                ))}
              </div>
              <a className="op-royal-footer__phone" href="tel:+8801715393876">
                <span aria-hidden="true">✦</span> CALL: +880 1715-393876
              </a>
            </div>
          </section>

          <nav className="op-royal-footer__nav" aria-label="Footer navigation">
            <div className="op-royal-footer__nav-group">
              <h3>EXPLORE</h3>
              {exploreLinks.map((item) => (
                <Link href={item.href} key={item.href}>
                  <span aria-hidden="true">↗</span>{item.name}
                </Link>
              ))}
            </div>
            <div className="op-royal-footer__nav-group">
              <h3>COMMUNITY</h3>
              {communityLinks.map((item) => (
                <Link href={item.href} key={item.href}>
                  <span aria-hidden="true">↗</span>{item.name}
                </Link>
              ))}
            </div>
          </nav>

          <div className="op-royal-footer__panel-shell">
            <div className="op-royal-footer__panel">
              <p className="op-royal-footer__kicker">✦ THE OVER POWER MINDSET</p>
              <h2>BEYOND<br /><span>THE GAME.</span></h2>
              <div className="op-royal-footer__rule" aria-hidden="true" />
              <p className="op-royal-footer__panel-copy">Every second matters. Every victory is earned.</p>
              <span className="op-royal-footer__watermark" aria-hidden="true">OP</span>
            </div>
          </div>
        </div>

        <div className="op-royal-footer__slogan">
          <span>WE</span><i aria-hidden="true">✦</i>
          <span>BELIEVE IN</span><i aria-hidden="true">✦</i>
          <span>DOMINATION</span>
        </div>

        <div className="op-royal-footer__bottom">
          <small>© {new Date().getFullYear()} OVER POWER ESPORTS. ALL RIGHTS RESERVED.</small>
          <small className="op-royal-footer__crafted">CRAFTED FOR CHAMPIONS <span>✦</span></small>
          <button type="button" onClick={backToTop}>BACK TO TOP <span aria-hidden="true">↑</span></button>
        </div>
      </div>

      <style jsx global>{`
        .op-royal-footer,.op-royal-footer *{box-sizing:border-box}
        .op-royal-footer{
          position:relative;isolation:isolate;overflow:hidden;width:100%;
          margin:48px 0 0;padding:0 clamp(20px,4vw,68px);
          background:linear-gradient(155deg,#100710 0%,#060611 52%,#07121a 100%);
          border-top:1px solid rgba(255,213,149,.34);color:#f9f7ff;
          text-align:left;font-family:Arial,Helvetica,sans-serif;
        }
        .op-royal-footer:before{
          content:"";position:absolute;inset:0;pointer-events:none;z-index:-1;
          background-image:linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),
                           linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px);
          background-size:65px 65px;
        }
        .op-royal-footer__light{
          position:absolute;z-index:-1;pointer-events:none;filter:blur(70px);
          border-radius:50%;animation:opRoyalBreath 7s ease-in-out infinite alternate;
        }
        .op-royal-footer__light--red{width:430px;height:360px;left:-180px;top:-135px;background:rgba(255,30,83,.27)}
        .op-royal-footer__light--blue{width:450px;height:340px;right:-170px;bottom:-160px;background:rgba(12,213,243,.22);animation-delay:-3s}
        .op-royal-footer__light--purple{width:440px;height:320px;right:10%;top:30px;background:rgba(112,55,226,.17);animation-delay:-5s}
        .op-royal-footer__laser{
          position:absolute;top:0;left:-45%;width:45%;height:2px;pointer-events:none;
          background:linear-gradient(90deg,transparent,#ff5388,#ffda95,#83edff,transparent);
          box-shadow:0 0 20px rgba(255,111,143,.85);animation:opRoyalLaser 9s linear infinite;
        }
        .op-royal-footer__inner{width:100%;max-width:1380px;margin:0 auto;position:relative}
        .op-royal-footer__top{
          display:flex;justify-content:space-between;align-items:center;gap:18px;
          padding:26px 0;border-bottom:1px solid rgba(255,255,255,.13);
          font-size:11px;letter-spacing:2.1px;font-weight:900;
        }
        .op-royal-footer__online{display:flex;align-items:center;gap:10px;color:#f9e8d6}
        .op-royal-footer__online i{
          width:9px;height:9px;border-radius:50%;flex:0 0 9px;
          background:#70f3d9;box-shadow:0 0 17px #70f3d9;
          animation:opRoyalPulse 2.4s ease-in-out infinite;
        }
        .op-royal-footer__tagline{color:#c8bcd9;text-shadow:0 0 17px rgba(158,118,255,.27)}
        .op-royal-footer__layout{
          display:grid;grid-template-columns:minmax(0,1.13fr) minmax(0,.97fr) minmax(0,1fr);
          gap:clamp(26px,3.5vw,75px);align-items:start;padding:64px 0 55px;
        }
        .op-royal-footer__brand{min-width:0}
        .op-royal-footer__identity{
          display:inline-flex;align-items:center;gap:18px;color:#fff!important;
          text-decoration:none!important;max-width:100%;
        }
        .op-royal-footer__logo-ring{
          flex:0 0 88px;width:88px;height:88px;position:relative;border-radius:50%;
          display:grid;place-items:center;filter:drop-shadow(0 0 12px rgba(255,98,144,.32));
        }
        .op-royal-footer__logo-ring:before{
          content:"";position:absolute;inset:0;border-radius:50%;
          background:conic-gradient(#ffcf8f,#ff4e82,#957aff,#78eafa,#ffcf8f);
          animation:opRoyalSpin 9s linear infinite;
        }
        .op-royal-footer__logo-holder{
          position:relative;z-index:1;display:block;width:80px;height:80px;
          border-radius:50%;overflow:hidden;background:#08070f;
          border:2px solid #0c0a15;
        }
        .op-royal-footer__logo-holder img{display:block;width:100%;height:100%;object-fit:cover;border-radius:50%}
        .op-royal-footer__wordmark{display:flex;flex-direction:column;gap:5px;min-width:0;line-height:1.13}
        .op-royal-footer__wordmark strong{
          font-weight:950;font-size:clamp(20px,2.1vw,29px);letter-spacing:1.6px;
          white-space:nowrap;color:#fff;text-shadow:0 0 21px rgba(255,255,255,.23);
        }
        .op-royal-footer__wordmark b{
          font-weight:950;font-size:clamp(22px,2.2vw,31px);letter-spacing:5px;
          background:linear-gradient(100deg,#ff658f,#ffb08e,#ffe3a4);
          color:transparent;background-clip:text;-webkit-background-clip:text;
          filter:drop-shadow(0 0 12px rgba(255,107,143,.25));
        }
        .op-royal-footer__description{
          max-width:380px;margin:28px 0 22px!important;
          font-size:15px;line-height:1.85;color:#ded7e5;
        }
        .op-royal-footer__join{
          position:relative;display:inline-flex;align-items:center;justify-content:space-between;
          min-height:52px;gap:27px;padding:6px 7px 6px 21px;border-radius:99px;
          border:1px solid rgba(255,212,145,.68);text-decoration:none!important;
          background:linear-gradient(100deg,rgba(255,65,102,.19),rgba(255,197,117,.11));
          color:#fff!important;letter-spacing:1.2px;font-size:12px;font-weight:900;
          box-shadow:0 0 21px rgba(255,77,123,.21),inset 0 1px rgba(255,255,255,.07);
          transition:transform .25s ease,box-shadow .25s ease;
        }
        .op-royal-footer__join:hover{transform:translateY(-3px);box-shadow:0 0 34px rgba(255,77,123,.40)}
        .op-royal-footer__join-icon{
          display:grid;place-items:center;flex:0 0 38px;width:38px;height:38px;
          border-radius:50%;background:linear-gradient(140deg,#ffe2a4,#ff6196);
          color:#1a0b19;font-size:24px;box-shadow:0 0 16px rgba(255,163,126,.32);
        }
        .op-royal-footer__micro{
          margin:23px 0 0!important;color:#dfc7d1;font-size:10px;
          letter-spacing:1.4px;font-weight:800;
        }
        /* Glowing, real social links; scoped to the footer only. */
        .op-royal-footer__social-area{
          width:100%;margin-top:29px;padding-top:23px;
          border-top:1px solid rgba(255,255,255,.12);
        }
        .op-royal-footer__social-heading{
          display:flex;align-items:center;gap:9px;
          margin:0 0 15px!important;color:#ffe0af!important;
          font-size:12px;font-weight:950;letter-spacing:1.6px;line-height:1.4;
          text-shadow:0 0 17px rgba(255,202,142,.40);
        }
        .op-royal-footer__social-heading span{color:#9cecff;filter:drop-shadow(0 0 8px #91eafe)}
        .op-royal-footer__socials{
          display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;
          width:100%;max-width:400px;
        }
        .op-royal-footer__social{
          --glow:rgba(255,111,147,.28);
          position:relative;isolation:isolate;display:flex;flex-direction:column;
          align-items:center;justify-content:center;gap:8px;
          min-width:0;min-height:89px;padding:11px 5px;
          color:#fff!important;text-decoration:none!important;
          border:1px solid rgba(255,255,255,.20);border-radius:16px;
          background:linear-gradient(145deg,rgba(255,255,255,.075),rgba(10,10,25,.92));
          box-shadow:0 5px 20px rgba(0,0,0,.19),0 0 18px var(--glow);
          overflow:hidden;transition:transform .25s ease,border-color .25s ease,box-shadow .25s ease;
        }
        .op-royal-footer__social:before{
          content:"";position:absolute;z-index:-1;inset:-25%;pointer-events:none;
          background:radial-gradient(circle at 50% 26%,var(--glow),transparent 56%);
          animation:opRoyalSocialAura 3.3s ease-in-out infinite alternate;
        }
        .op-royal-footer__social:after{
          content:"";position:absolute;inset:0;pointer-events:none;border-radius:inherit;
          border-top:1px solid rgba(255,255,255,.25);
        }
        .op-royal-footer__social--facebook{--glow:rgba(24,119,242,.62)}
        .op-royal-footer__social--whatsapp{--glow:rgba(37,211,102,.56)}
        .op-royal-footer__social--group{--glow:rgba(21,209,185,.55)}
        .op-royal-footer__social--discord{--glow:rgba(100,111,255,.63)}
        .op-royal-footer__social-icon{
          display:grid;place-items:center;width:34px;height:34px;
          color:#fff;font-size:22px;filter:drop-shadow(0 0 11px var(--glow));
        }
        .op-royal-footer__social-name{
          font-size:9px;line-height:1.3;font-weight:900;letter-spacing:.45px;
          text-align:center;color:#fff;overflow-wrap:break-word;
        }
        .op-royal-footer__social:hover{
          transform:translateY(-5px);border-color:rgba(255,255,255,.65);
          box-shadow:0 12px 35px var(--glow),inset 0 0 25px rgba(255,255,255,.055);
        }
        .op-royal-footer__phone{
          display:inline-flex;align-items:center;gap:7px;margin-top:15px;
          font-size:12px;font-weight:800;letter-spacing:.7px;
          color:#bcecf7!important;text-decoration:none!important;
          text-shadow:0 0 13px rgba(91,223,252,.18);
        }
        .op-royal-footer__phone span{color:#ffdb9c}
        .op-royal-footer__phone:hover{color:#fff!important}
        .op-royal-footer__nav{
          display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);
          gap:20px;padding:18px 0;
        }
        .op-royal-footer__nav-group{display:flex;min-width:0;flex-direction:column;gap:5px}
        .op-royal-footer__nav-group h3{
          margin:0 0 15px!important;color:#ffe0a7;font-size:12px;
          font-weight:950;letter-spacing:2px;text-shadow:0 0 18px rgba(255,202,134,.4);
        }
        .op-royal-footer__nav-group a{
          display:flex;align-items:center;gap:9px;min-height:41px;
          color:#e6e2ef!important;text-decoration:none!important;font-size:14px;
          line-height:1.4;font-weight:700;transition:color .2s,transform .2s;
        }
        .op-royal-footer__nav-group a span{color:#82ebff;font-size:18px;text-shadow:0 0 15px rgba(130,235,255,.45)}
        .op-royal-footer__nav-group a:hover{color:#fff!important;transform:translateX(5px)}
        .op-royal-footer__panel-shell{
          border:1px solid rgba(219,189,255,.42);border-radius:26px;padding:1px;
          background:linear-gradient(125deg,rgba(255,202,147,.45),rgba(148,96,255,.13),rgba(105,239,255,.40));
          box-shadow:0 12px 52px rgba(69,51,153,.23),0 0 28px rgba(255,101,148,.1);
          animation:opRoyalPanelGlow 5s ease-in-out infinite alternate;
        }
        .op-royal-footer__panel{
          position:relative;isolation:isolate;min-height:258px;overflow:hidden;
          border-radius:24px;padding:30px;background:linear-gradient(145deg,#272036,#0b0d1b 76%);
        }
        .op-royal-footer__panel:before{
          content:"";position:absolute;z-index:-1;right:-100px;top:-115px;width:250px;height:250px;
          border-radius:50%;background:rgba(137,85,255,.24);filter:blur(24px);
        }
        .op-royal-footer__kicker{
          color:#97edff;font-size:10px;letter-spacing:1.4px;font-weight:950;
          text-shadow:0 0 15px rgba(82,220,255,.42);
        }
        .op-royal-footer__panel h2{
          position:relative;margin:24px 0 0!important;font-size:clamp(35px,3.1vw,46px);
          color:#fff;font-weight:950;letter-spacing:-.7px;line-height:1.08;
          text-shadow:0 0 20px rgba(255,255,255,.20);
        }
        .op-royal-footer__panel h2{animation:opRoyalHeadingGlow 4.5s ease-in-out infinite alternate}
        .op-royal-footer__wordmark b{background-size:230% 100%;animation:opRoyalGradientFlow 7s linear infinite alternate}
        .op-royal-footer__panel h2 span{
          background:linear-gradient(92deg,#ffc18a,#ff638d,#8febff);
          color:transparent;background-clip:text;-webkit-background-clip:text;
          filter:drop-shadow(0 0 11px rgba(255,114,155,.30));
        }
        .op-royal-footer__rule{
          height:1px;margin:25px 0 16px;
          background:linear-gradient(90deg,#ff8199,#ffda9b,#8ce6ff,transparent);
          box-shadow:0 0 11px rgba(255,111,164,.40);
        }
        .op-royal-footer__panel-copy{color:#ded8e8;font-size:13px;line-height:1.7}
        .op-royal-footer__watermark{
          position:absolute;right:19px;bottom:-25px;font-size:115px;font-weight:950;
          color:rgba(255,255,255,.045);pointer-events:none;
        }
        .op-royal-footer__slogan{
          display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:20px;
          min-height:71px;border-top:1px solid rgba(255,255,255,.11);
          border-bottom:1px solid rgba(255,255,255,.11);
          font-size:13px;font-weight:950;letter-spacing:3px;color:#f6efff;
          text-shadow:0 0 14px rgba(255,255,255,.18);
        }
        .op-royal-footer__slogan i{font-style:normal;color:#ffdc96;filter:drop-shadow(0 0 7px #ffcf86)}
        .op-royal-footer__bottom{
          min-height:78px;display:grid;grid-template-columns:1fr auto 1fr;
          gap:18px;align-items:center;color:#c6bed0;font-size:11px;
          letter-spacing:.6px;
        }
        .op-royal-footer__bottom small{font-size:inherit;line-height:1.6}
        .op-royal-footer__bottom .op-royal-footer__crafted{color:#e8dce4}
        .op-royal-footer__crafted span{color:#ffdda2}
        .op-royal-footer__bottom button{
          justify-self:end;display:flex;align-items:center;gap:8px;padding:9px 15px;
          border-radius:99px;background:rgba(130,235,255,.09);
          border:1px solid rgba(130,235,255,.35);color:#fff;font-size:11px;
          font-weight:850;letter-spacing:.9px;cursor:pointer;
        }
        .op-royal-footer__bottom button span{color:#8cecff;font-size:19px}
        .op-royal-footer a:focus-visible,.op-royal-footer button:focus-visible{outline:2px solid #8cecff;outline-offset:3px}

        /* Important: some mobile browsers request a 980px layout viewport.
           Stack the footer already below 1200px, not only below 760px. */
        @media(max-width:1200px){
          .op-royal-footer{padding:0 clamp(16px,4vw,35px)}
          .op-royal-footer__layout{display:flex;flex-direction:column;align-items:center;gap:28px;padding:42px 0}
          .op-royal-footer__brand,.op-royal-footer__nav,.op-royal-footer__panel-shell{width:100%;max-width:670px;min-width:0}
          .op-royal-footer__brand{text-align:center;display:flex;flex-direction:column;align-items:center}
          .op-royal-footer__social-area{max-width:520px;text-align:center;margin-top:24px}
          .op-royal-footer__social-heading{justify-content:center}
          .op-royal-footer__socials{max-width:490px;margin:0 auto;gap:12px}
          .op-royal-footer__social{min-height:102px}
          .op-royal-footer__social-name{font-size:11px}
          .op-royal-footer__phone{justify-content:center}
          .op-royal-footer__identity{justify-content:center;max-width:100%}
          .op-royal-footer__description{margin:21px auto 19px!important;text-align:center}
          .op-royal-footer__micro{text-align:center;margin-top:21px!important}
          .op-royal-footer__nav{
            grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;
            padding:25px clamp(16px,4vw,32px);
            background:linear-gradient(130deg,rgba(255,255,255,.06),rgba(95,83,136,.07));
            border:1px solid rgba(255,255,255,.15);border-radius:22px;
            box-shadow:0 12px 40px rgba(0,0,0,.18);
          }
          .op-royal-footer__nav-group{align-items:flex-start;text-align:left}
          .op-royal-footer__nav-group h3{font-size:15px;letter-spacing:1.5px}
          .op-royal-footer__nav-group a{font-size:17px;min-height:47px;gap:10px}
          .op-royal-footer__panel{text-align:center;min-height:230px;padding:30px 25px}
          .op-royal-footer__panel h2{font-size:clamp(38px,4vw,47px)}
          .op-royal-footer__rule{max-width:400px;margin:25px auto 16px}
          .op-royal-footer__bottom{display:flex;flex-direction:column;text-align:center;justify-content:center;gap:14px;padding:25px 0 33px}
          .op-royal-footer__bottom button{justify-self:center;min-height:43px}
          .op-royal-footer__top{justify-content:center;flex-wrap:wrap;gap:11px 25px;text-align:center;padding:26px 0}
        }
        @media(max-width:600px){
          .op-royal-footer{padding:0 17px;margin-top:40px}
          .op-royal-footer__top{display:flex;flex-direction:column;gap:12px;font-size:10px;letter-spacing:1.6px;padding:25px 0}
          .op-royal-footer__layout{padding:34px 0 35px;gap:25px}
          .op-royal-footer__logo-ring{width:77px;height:77px;flex-basis:77px}
          .op-royal-footer__logo-holder{width:69px;height:69px}
          .op-royal-footer__identity{gap:12px}
          .op-royal-footer__wordmark strong{font-size:clamp(18px,4.8vw,23px);letter-spacing:1px}
          .op-royal-footer__wordmark b{font-size:clamp(18px,5vw,24px);letter-spacing:3px}
          .op-royal-footer__description{font-size:14px;margin:18px auto!important;line-height:1.65}
          .op-royal-footer__join{min-height:50px}
          .op-royal-footer__social-area{padding-top:22px;margin-top:24px}
          .op-royal-footer__socials{gap:10px}
          .op-royal-footer__social{min-height:91px;padding:10px 3px;border-radius:15px}
          .op-royal-footer__social-icon{font-size:23px}
          .op-royal-footer__social-name{font-size:10px;letter-spacing:.1px}
          .op-royal-footer__social-heading{font-size:11px;letter-spacing:1.15px}
          .op-royal-footer__nav{gap:13px;padding:22px 15px}
          .op-royal-footer__nav-group h3{font-size:12px;letter-spacing:1px}
          .op-royal-footer__nav-group a{font-size:13px;min-height:43px;gap:5px}
          .op-royal-footer__nav-group a span{font-size:15px}
          .op-royal-footer__panel{min-height:225px;padding:26px 18px}
          .op-royal-footer__panel h2{font-size:36px}
          .op-royal-footer__slogan{gap:9px;font-size:10px;letter-spacing:1px;min-height:68px;text-align:center}
          .op-royal-footer__bottom small{font-size:10px}
        }
        @media(max-width:350px){
          .op-royal-footer{padding:0 13px}
          .op-royal-footer__logo-ring{width:63px;height:63px;flex-basis:63px}
          .op-royal-footer__logo-holder{width:56px;height:56px}
          .op-royal-footer__identity{gap:7px}
          .op-royal-footer__wordmark strong{font-size:16px}
          .op-royal-footer__wordmark b{font-size:16px;letter-spacing:2px}
          .op-royal-footer__nav{padding:17px 10px;gap:8px}
          .op-royal-footer__socials{grid-template-columns:repeat(2,minmax(0,1fr));max-width:285px}
          .op-royal-footer__social{min-height:82px}
          .op-royal-footer__social-name{font-size:11px}
          .op-royal-footer__nav-group h3{font-size:11px;letter-spacing:.4px}
          .op-royal-footer__nav-group a{font-size:12px;gap:4px}
          .op-royal-footer__slogan{gap:6px;font-size:9px}
        }
        @keyframes opRoyalSocialAura{0%{opacity:.55;transform:scale(.83)}100%{opacity:1;transform:scale(1.18)}}
        @keyframes opRoyalHeadingGlow{to{text-shadow:0 0 28px rgba(255,255,255,.32),0 0 35px rgba(255,106,144,.18)}}
        @keyframes opRoyalGradientFlow{to{background-position:100% 0}}
        @keyframes opRoyalBreath{to{opacity:.65;transform:scale(1.13) translateY(13px)}}
        @keyframes opRoyalPulse{50%{opacity:.45;box-shadow:0 0 24px #70f3d9}}
        @keyframes opRoyalSpin{to{transform:rotate(360deg)}}
        @keyframes opRoyalLaser{to{left:105%}}
        @keyframes opRoyalPanelGlow{to{box-shadow:0 15px 58px rgba(115,77,205,.35),0 0 38px rgba(255,114,160,.21)}}
        @media(prefers-reduced-motion:reduce){
          .op-royal-footer *,.op-royal-footer *:before,.op-royal-footer *:after{animation:none!important;transition:none!important}
          .op-royal-footer__laser{animation:none}
        }
      `}</style>
    </footer>
  );
}
