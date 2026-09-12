export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        OVER POWER <span>ESPORTS</span>
      </div>

      <div className="nav-links">
        <a href="/">Home</a>
        <a href="/players">Players</a>
        <a href="/teams">Teams</a>
        <a href="/tournaments">Tournaments</a>
        <a href="/rankings">Rankings</a>
      </div>
    </nav>
  );
}
