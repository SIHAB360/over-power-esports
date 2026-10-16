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
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  return (
    <footer className="op-footer" aria-label="Over Power Esports footer">
      <div className="op-footer__glow" aria-hidden="true" />
      <div className="op-footer__container">
        <div className="op-footer__overline">
          <span><i className="op-footer__dot" /> THE POWER CONTINUES</span>
          <span>✦ POWER · UNITY · DOMINATION</span>
        </div>

        <div className="op-footer__grid">
          <div className="op-footer__brand">
            <Link href="/" className="op-footer__identity" aria-label="Over Power Esports homepage">
              <span className="op-footer__logo-ring">
                <Image src={logo} alt="Over Power Esports logo" width={76} height={76} />
              </span>
              <span className="op-footer__brand-name">
                <strong>OVER POWER</strong>
                <strong>ESPORTS</strong>
              </span>
            </Link>
            <p>Victory is our mission. Built on discipline, driven by passion, united by the game.</p>
            <Link href="/join-team" className="op-footer__join">
              JOIN THE TEAM <span aria-hidden="true">↗</span>
            </Link>
            <small>✧ THE NEXT GENERATION OF CHAMPIONS</small>
          </div>

          <nav className="op-footer__navigation" aria-label="Footer navigation">
            <div className="op-footer__column">
              <h3>EXPLORE</h3>
              {exploreLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <span aria-hidden="true">↗</span> {link.label}
                </Link>
              ))}
            </div>
            <div className="op-footer__column">
              <h3>COMMUNITY</h3>
              {communityLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <span aria-hidden="true">↗</span> {link.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="op-footer__feature">
            <small>✦ THE OVER POWER MINDSET</small>
            <h2>BEYOND<br /><span>THE GAME.</span></h2>
            <div className="op-footer__rule" />
            <p>Every second matters. Every victory is earned.</p>
          </div>
        </div>

        <div className="op-footer__motto">WE <span>✦</span> BELIEVE IN <span>✦</span> DOMINATION</div>
        <div className="op-footer__bottom">
          <span>© {new Date().getFullYear()} OVER POWER ESPORTS. ALL RIGHTS RESERVED.</span>
          <span>CRAFTED FOR CHAMPIONS ✦</span>
          <button type="button" onClick={backToTop}>BACK TO TOP ↑</button>
        </div>
      </div>

      <style jsx global>{`
        .op-footer, .op-footer * { box-sizing: border-box; }
        .op-footer {
          position: relative; isolation: isolate; overflow: hidden;
          width: 100%; margin: 44px 0 0; padding: 0 26px;
          color: #f9f7ff; background: linear-gradient(145deg, #130911, #070710 60%, #09141b);
          border-top: 1px solid rgba(255, 207, 131, .3);
          font-family: Arial, Helvetica, sans-serif;
        }
        .op-footer__glow {
