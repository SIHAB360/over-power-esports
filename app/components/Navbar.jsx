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

        .navbar {

          position: fixed;

          top: 15px;

          left: 50%;

          transform: translateX(-50%);

          width: calc(100% - 50px);

          max-width: 1400px;

          display: flex;

          justify-content: space-between;

          align-items: center;

          padding: 15px 30px;

          background:
          rgba(10,0,5,0.72);

          backdrop-filter:
          blur(18px);

          border:
          1px solid rgba(255,0,60,0.35);

          border-radius: 18px;

          box-shadow:
          0 0 30px rgba(255,0,60,0.18);

          z-index: 50;

        }



        .logo {

          color: white;

          font-size: 24px;

          font-weight: 800;

          letter-spacing: 3px;

        }



        .logo span {

          color: #ff1744;

          text-shadow:
          0 0 15px #ff1744;

        }



        .nav-actions {

          display:flex;

          align-items:center;

          gap:15px;

        }



        .login-btn {

          text-decoration:none;

          color:white;

          font-size:14px;

          letter-spacing:2px;

          padding:10px 24px;

          border-radius:20px;

          border:
          1px solid rgba(255,0,60,.6);

          background:
          rgba(255,0,60,.08);

          transition:.3s;

          box-shadow:
          0 0 12px rgba(255,0,60,.25);

        }



        .login-btn:hover {

          background:#ff1744;

          box-shadow:
          0 0 25px #ff1744;

          transform:translateY(-2px);

        }



        .menu-btn {

          width:42px;

          height:42px;

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

          transition:.3s;

          box-shadow:
          0 0 15px rgba(255,0,60,.5);

        }



        .menu-btn:hover {

          transform:scale(1.1);

          box-shadow:
          0 0 30px #ff1744;

        }



        .menu-btn span {

          width:6px;

          height:6px;

          background:#ff1744;

          border-radius:50%;

          display:block;

          box-shadow:
          0 0 12px #ff1744;

        }



        @media(max-width:600px){

          .navbar {

            width:calc(100% - 30px);

            padding:14px 18px;

          }



          .logo {

            font-size:16px;

            letter-spacing:2px;

          }



          .login-btn {

            display:none;

          }

        }


      `}</style>

    </>
  );
}
