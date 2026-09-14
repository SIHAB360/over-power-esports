"use client";

import { useState } from "react";
import SideMenu from "./SideMenu";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="logo">
          OVER POWER <span>ESPORTS</span>
        </div>

        <div className="nav-actions">
          <a href="/login" className="login-btn">
            LOGIN
          </a>

          <button
            className="menu-btn"
            onClick={() => setMenuOpen(true)}
          >
            ⋮
          </button>
        </div>
      </nav>

      <SideMenu
        open={menuOpen}
        close={() => setMenuOpen(false)}
      />
    </>
  );
}
