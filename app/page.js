import Image from "next/image";
import logo from "./assets/logo.png";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <main>

      <Navbar />


      <section className="hero">

        <div className="hero-logo">

          <Image
            src={logo}
            width={110}
            height={110}
            alt="Over Power Esports Logo"
          />

        </div>


        <h1>
          OVER POWER ESPORTS
        </h1>


        <p>
          Victory is our Mission
        </p>


        <button>
          Join Team
        </button>


      </section>



      <section className="cards">

        <div>
          <h2>🎮 Games</h2>
          <p>Competitive Gaming & Tournaments</p>
        </div>


        <div>
          <h2>🏆 Achievements</h2>
          <p>Building Champions Worldwide</p>
        </div>


        <div>
          <h2>🔥 Our Team</h2>
          <p>Power. Skill. Victory.</p>
        </div>

      </section>




      <section className="team">

        <h2>
          Our Players
        </h2>


        <div className="players">


          <div className="player">
            <h3>Player One</h3>
            <p>IGL / Captain</p>
          </div>



          <div className="player">
            <h3>Player Two</h3>
            <p>Sniper</p>
          </div>



          <div className="player">
            <h3>Player Three</h3>
            <p>Entry Fragger</p>
          </div>


        </div>


      </section>




      <section className="contact">

        <h2>
          Ready To Join?
        </h2>


        <p>
          Become part of Over Power Esports
        </p>


      </section>



    </main>
  );
}
