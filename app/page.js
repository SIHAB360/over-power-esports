import Image from "next/image";
import logo from "./assets/logo.png";

import Navbar from "./components/Navbar";
import Tournaments from "./components/Tournaments";
import Games from "./components/Games";
import Teams from "./components/Teams";


export default function Home() {

  return (

    <main>


      <Navbar />



      <section className="hero">


        <div className="hero-logo">


          <Image

            src={logo}

            width={140}

            height={140}

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




      <Teams />



      <Tournaments />



      <Games />




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
