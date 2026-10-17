
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
import heroStyles from "./components/HomeHero.module.css";

export default function Home() {
  return (
    <>
      <PreLoader />

      <main className="home-animation">
        <Navbar />

        <section
          id="home"
          className={heroStyles.hero}
          style={{ scrollMarginTop: "90px" }}
          aria-label="Over Power Esports welcome"
        >
          <div className={heroStyles.redAuraLeft} aria-hidden="true" />
          <div className={heroStyles.redAuraRight} aria-hidden="true" />
          <div className={heroStyles.heroContent}>
            <div className={heroStyles.logoFrame}>
              <Image
                src={logo}
                width={164}
                height={164}
                alt="Over Power Esports logo"
                className={heroStyles.logoImage}
                priority
              />
            </div>

            <p className={heroStyles.eyebrow}>OVER POWER ESPORTS</p>
            <h1 className={heroStyles.headline}>
              <span className={heroStyles.headlineWhite}>WE ARE</span>{" "}
              <span className={heroStyles.headlineRed}>OVER POWER</span>
            </h1>
            <p className={heroStyles.slogan}>FORGED IN FIRE, BUILT TO CONQUER</p>
            <p className={heroStyles.description}>
              A premier Free Fire Esports organization striving for excellence,
              built on teamwork, and driven by passion.
            </p>

            <div className={heroStyles.actions}>
              <Link href="#tournaments" className={heroStyles.primaryAction}>
                LIVE MATCHES
                <span aria-hidden="true">↗</span>
              </Link>
              <Link href="#best-players" className={heroStyles.secondaryAction}>
                <span aria-hidden="true">🏆</span> HALL OF CHAMPIONS
              </Link>
            </div>
          </div>
          <div className={heroStyles.bottomBlend} aria-hidden="true" />
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

          <AchievementGallery />

        <FloatingContact />
      </main>

      <Footer />
    </>
  );
}
