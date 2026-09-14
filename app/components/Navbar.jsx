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

/* MAIN NAVBAR */

.navbar{

  position:fixed;

  top:18px;

  left:50%;

  transform:translateX(-50%);


  width:calc(100% - 40px);

  max-width:1400px;


  height:70px;


  display:flex;

  align-items:center;

  justify-content:space-between;


  padding:0 28px;


  background:rgba(10,0,5,0.55);


  backdrop-filter:blur(18px);


  border:1px solid rgba(255,0,60,.35);


  border-radius:18px;


  box-shadow:
  0 0 25px rgba(255,0,60,.18);


  z-index:999;

}



/* LOGO */

.logo{

  color:#ffffff;

  font-size:22px;

  font-weight:800;

  letter-spacing:3px;

  white-space:nowrap;

}


.logo span{

  color:#ff1744;

  text-shadow:
  0 0 12px #ff1744;

}



/* RIGHT AREA */

.nav-actions{

  display:flex;

  align-items:center;

  gap:14px;

}



/* LOGIN */

.login-btn{

  display:flex;

  align-items:center;

  justify-content:center;


  height:38px;

  padding:0 22px;


  color:white;

  text-decoration:none;


  font-size:13px;

  letter-spacing:2px;


  border-radius:20px;


  border:1px solid rgba(255,0,60,.7);


  background:
  rgba(255,0,60,.08);


  box-shadow:
  0 0 12px rgba(255,0,60,.3);


  transition:.3s;

}


.login-btn:hover{

 background:#ff1744;

 box-shadow:
 0 0 25px #ff1744;

}



/* MENU BUTTON */

.menu-btn{


 width:42px;

 height:42px;


 display:flex;

 flex-direction:column;

 justify-content:center;

 align-items:center;


 gap:5px;


 border-radius:50%;


 border:1px solid rgba(255,0,60,.6);


 background:
 rgba(255,0,60,.08);


 cursor:pointer;


 box-shadow:
 0 0 18px rgba(255,0,60,.5);


 transition:.3s;


}


.menu-btn span{


 width:18px;

 height:2px;


 background:white;


 border-radius:10px;


 box-shadow:
 0 0 8px white;


}


.menu-btn:hover{

 transform:scale(1.1);

 box-shadow:
 0 0 30px #ff1744;

}


.menu-btn:hover span{

 background:#ff1744;

}




/* TABLET */

@media(max-width:768px){


.navbar{

 height:62px;

 width:calc(100% - 24px);

 padding:0 16px;

 top:12px;

}



.logo{

 font-size:15px;

 letter-spacing:1.5px;

}



.login-btn{

 height:34px;

 padding:0 15px;

 font-size:11px;

}



.menu-btn{

 width:38px;

 height:38px;

}



}





/* SMALL MOBILE */

@media(max-width:420px){


.navbar{

 height:58px;

}



.logo{

 font-size:13px;

}



.login-btn{

 display:none;

}



.menu-btn{

 width:36px;

 height:36px;

}


}



`}</style>


    </>
  );
}
