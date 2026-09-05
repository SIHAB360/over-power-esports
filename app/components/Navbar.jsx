export default function Navbar() {
  return (
    <nav className="navbar">

      <div className="logo">
        OVER POWER <span>ESPORTS</span>
      </div>

      <div className="nav-links">
        <a href="#">Home</a>
        <a href="#">Players</a>
        <a href="#">Teams</a>
        <a href="#">Tournaments</a>
        <a href="#">Rankings</a>
      </div>

      <button className="nav-btn">
        Join Team
      </button>

    </nav>
  );
}
