
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
import AchievementGallery from "./components/AchievementGallery";

export default function Home() {
  return (
    <>
      <PreLoader />

      <main className="home-animation">
        <Navbar />

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

        <section
          id="best-players"
          className="reveal-card"
          style={{ scrollMarginTop: "90px" }}
        >
          <BestPlayers />
        </section>

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

        <section
          id="tournaments"
          className="reveal-card reveal-delay-1"
          style={{ scrollMarginTop: "90px" }}
        >
          <Tournaments />
        </section>

        <section
          id="games"
          className="reveal-card reveal-delay-2"
          style={{ scrollMarginTop: "90px" }}
        >
          <Games />
        </section>

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
    </>
  );
}
