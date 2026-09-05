import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="navbar">

      <div className="logo-area">

        <Image
  src="/logo.png"
  width={45}
  height={45}
  alt="OP Logo"
/>

        <h2>
          OVER POWER <span>ESPORTS</span>
        </h2>

      </div>


      <div className="nav-links">

        <a href="#">Home</a>
        <a href="#">Players</a>
        <a href="#">Teams</a>
        <a href="#">Tournaments</a>
        <a href="#">Rankings</a>

      </div>


      <button className="join-btn">
        Join Team
      </button>


    </nav>
  );
}
