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
            aria-label="Open Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

        </div>

      </nav>


      <SideMenu
        open={menuOpen}
        close={() => setMenuOpen(false)}
      />


      <style jsx>{`

        .nav-actions{
          display:flex;
          align-items:center;
          gap:15px;
        }


        .login-btn{

          text-decoration:none;

          color:white;

          font-size:14px;

          letter-spacing:2px;

          padding:10px 22px;

          border:1px solid rgba(255,0,60,.6);

          border-radius:20px;

          background:rgba(255,0,60,.08);

          transition:.3s;

          box-shadow:
          0 0 12px rgba(255,0,60,.3);

        }


        .login-btn:hover{

          background:#ff1744;

          color:white;

          box-shadow:
          0 0 25px #ff1744;

        }



        .menu-btn{

          width:45px;
          height:45px;

          display:flex;

          flex-direction:column;

          justify-content:center;

          align-items:center;

          gap:5px;


          background:
          rgba(255,0,60,.08);


          border:
          1px solid rgba(255,0,60,.6);


          border-radius:50%;


          cursor:pointer;


          box-shadow:
          0 0 15px rgba(255,0,60,.5);


          transition:.3s;

        }



        .menu-btn:hover{

          transform:scale(1.08);

          box-shadow:
          0 0 30px #ff1744;

        }



        .menu-btn span{

          width:5px;

          height:5px;

          background:#ff1744;

          border-radius:50%;

          box-shadow:
          0 0 10px #ff1744;

        }


      `}</style>

    </>
  );
}
