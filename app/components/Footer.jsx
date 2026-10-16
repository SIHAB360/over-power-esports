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
