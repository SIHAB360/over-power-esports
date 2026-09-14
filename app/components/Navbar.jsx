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

  top: 20px;

  left: 50%;

  transform: translateX(-50%);

  width: calc(100% - 60px);

  max-width: 1400px;


  display:flex;

  justify-content:space-between;

  align-items:center;


  padding:18px 35px;


  background:
  rgba(10,0,5,0.65);


  backdrop-filter:
  blur(15px);


  border:
  1px solid rgba(255,0,60,.35);


  border-radius:18px;


  box-shadow:

  0 0 25px rgba(255,0,60,.15);


  z-index:50;

}



.logo{

  color:white;

  font-size:24px;

  font-weight:800;

  letter-spacing:3px;

}



.logo span{

  color:#ff1744;

  text-shadow:

  0 0 15px #ff1744;

}



@media(max-width:600px){

.navbar{

width:calc(100% - 30px);

padding:15px 20px;

}


.logo{

font-size:16px;

}

.login-btn{

display:none;

}

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
