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
        <a>Home</a>
        <a>Players</a>
        <a>Teams</a>
        <a>Tournaments</a>
        <a>Rankings</a>
      </div>


      <button>
        Join Team
      </button>

    </nav>
  );
}
