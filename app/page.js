
"use client";

import FloatingContact from "./components/FloatingContact";
import Image from "next/image";
import logo from "./assets/logo.png";
import Link from "next/link";

import Navbar from "./components/Navbar";
import Tournaments from "./components/Tournaments";
import Games from "./components/Games";
import Teams from "./components/Teams";
import Leadership from "./components/Leadership";
import PreLoader from "./components/PreLoader";
import BestPlayers from "./components/BestPlayers";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <PreLoader />

      <main className="home-animation">
        <Navbar />

        {/* HOME */}
        <section
          id="home"
          className="hero reveal-header"
          style={{ scrollMarginTop: "90px" }}
        >
          <div className="hero-logo reveal-photo">
            <Image
              src={logo}
              width={140}
              height={140}
              alt="Over Power Esports Logo"
              priority
            />
          </div>

          <h1>OVER POWER ESPORTS</h1>
          <p>Victory is our Mission</p>
        </section>

        {/* BEST PLAYERS */}
        <section
          id="best-players"
          className="reveal-card"
          style={{ scrollMarginTop: "90px" }}
        >
          <BestPlayers />
        </section>

        {/* TEAMS + PLAYER CARDS */}
        <section
          id="teams"
          className="reveal-card reveal-delay-1"
          style={{ scrollMarginTop: "90px" }}
        >
          <div id="players" style={{ scrollMarginTop: "90px" }}>
            <Teams />
          </div>
        </section>

        <Leadership />

        {/* TOURNAMENTS */}
        <section
          id="tournaments"
          className="reveal-card reveal-delay-1"
          style={{ scrollMarginTop: "90px" }}
        >
          <Tournaments />
        </section>

        {/* GAMES */}
        <section
          id="games"
          className="reveal-card reveal-delay-2"
          style={{ scrollMarginTop: "90px" }}
        >
          <Games />
        </section>

        {/* JOIN TEAM */}
        <section
          id="join"
          className="contact premium-contact"
          style={{ scrollMarginTop: "90px" }}
        >
          <h2>READY TO JOIN?</h2>
          <p>Become part of Over Power Esports</p>
          <Link href="/join-team">JOIN TEAM</Link>
        </section>

        <FloatingContact />
      </main>

      <Footer />

      {/* Mobile responsive styling */}
      <style jsx global>{`
        @media (max-width: 1100px) {
          .home-animation .premium-contact {
            width: min(100%, 760px);
            max-width: 100%;
            margin: 46px auto 18px;
            padding: clamp(35px, 5vw, 58px) 24px;
            border-radius: 26px;
          }

          .home-animation .premium-contact h2 {
            font-size: clamp(28px, 4vw, 40px);
            line-height: 1.2;
            letter-spacing: 1.3px;
            overflow-wrap: anywhere;
          }

          .home-animation .premium-contact p {
            font-size: clamp(13px, 1.6vw, 16px);
            line-height: 1.7;
          }
        }

        @media (max-width: 710px) {
          main.home-animation {
            width: 100%;
            padding: 14px 14px 18px !important;
          }

          .home-animation .premium-contact {
            margin: 38px auto 10px;
            padding: 37px 18px 35px;
            border-radius: 22px;
          }

          .home-animation .premium-contact h2 {
            font-size: clamp(25px, 7vw, 32px);
            letter-spacing: 0.8px;
          }

          .home-animation .premium-contact p {
            margin-top: 12px;
            font-size: 13px;
          }

          .home-animation .premium-contact > a {
            display: inline-flex;
            justify-content: center;
            align-items: center;
            min-height: 44px;
            margin-top: 22px;
            padding: 12px 30px;
            font-size: 13px;
            transform: none;
          }

          .home-animation .premium-contact > a:hover {
            transform: translateY(-2px);
          }
        }
      `}</style>
    </>
  );
}
