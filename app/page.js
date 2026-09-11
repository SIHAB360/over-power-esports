import FloatingContact from "./components/FloatingContact";
import Image from "next/image";
import logo from "./assets/logo.png";

import Navbar from "./components/Navbar";
import Tournaments from "./components/Tournaments";
import Games from "./components/Games";
import Teams from "./components/Teams";


export default function Home() {

  return (

    <main className="home-animation">


      <Navbar />



      <section className="hero reveal-header">


        <div className="hero-logo reveal-photo">

          <Image

            src={logo}

            width={140}

            height={140}

            alt="Over Power Esports Logo"

            priority

          />

        </div>




        <h1>

          OVER POWER ESPORTS

        </h1>



        <p>

          Victory is our Mission

        </p>



        <button>

          JOIN TEAM

        </button>



      </section>





      <section className="reveal-card">

        <Teams />

      </section>





      <section className="reveal-card reveal-delay-1">

        <Tournaments />

      </section>





      <section className="reveal-card reveal-delay-2">

        <Games />

      </section>






      <section className="contact premium-contact">


        <h2>

          READY TO JOIN?

        </h2>



        <p>

          Become part of Over Power Esports

        </p>



        <button>

          JOIN TEAM

        </button>



      </section>






      <FloatingContact />



    </main>

  );

}
