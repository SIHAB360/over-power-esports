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

  top: 12px;

  left: 50%;

  transform: translateX(-50%);

  width: calc(100% - 24px);

  display:flex;

  justify-content:space-between;

  align-items:center;

  padding:14px 18px;

  background:rgba(10,0,5,.75);

  backdrop-filter:blur(15px);

  border:1px solid rgba(255,0,60,.35);

  border-radius:18px;

  z-index:50;

}


.logo {

  color:white;

  font-size:18px;

  font-weight:800;

  letter-spacing:2px;

  white-space:nowrap;

}


.logo span {

  color:#ff1744;

}



.nav-actions {

  display:flex;

  align-items:center;

  gap:10px;

}


.login-btn {

  padding:8px 16px;

  font-size:12px;

}



.menu-btn {

  width:40px;

  height:40px;

  display:flex;

  justify-content:center;

  align-items:center;

  flex-direction:column;

  gap:4px;

}



.menu-btn span {

  width:18px;

  height:2px;

  background:white;

  display:block;

  border-radius:5px;

}



@media(max-width:600px){

  .navbar{

    padding:12px 14px;

  }


  .logo{

    font-size:14px;

    letter-spacing:1px;

  }


  .login-btn{

    padding:7px 12px;

    font-size:11px;

  }


  .menu-btn{

    width:36px;

    height:36px;

  }


}


@media(max-width:380px){

  .login-btn{

    display:none;

  }


  .logo{

    font-size:13px;

  }

}



        /* Premium Hamburger */

        .menu-btn {


          width:44px;

          height:44px;


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
          0 0 18px rgba(255,0,60,.5);


        }



        .menu-btn span {


          width:18px;

          height:2px;


          background:white;


          border-radius:10px;


          box-shadow:
          0 0 8px #fff;


          transition:.3s;


        }



        .menu-btn:hover {


          transform:scale(1.08);


          box-shadow:
          0 0 30px #ff1744;


        }



        .menu-btn:hover span {


          background:#ff1744;


        }





        /* Mobile Responsive */

        @media(max-width:768px){


          .navbar {


            top:12px;

            width:calc(100% - 24px);

            padding:14px 16px;


          }



          .logo {


            font-size:15px;

            letter-spacing:1.5px;


          }



          .nav-actions {


            gap:8px;


          }



          .login-btn {


            padding:7px 14px;

            font-size:11px;


          }



          .menu-btn {


            width:38px;

            height:38px;


          }


        }





        @media(max-width:420px){


          .logo {


            font-size:13px;


          }



          .login-btn {


            display:none;


          }



          .navbar {


            padding:12px 14px;


          }


        }


      `}</style>

    </>
  );
}
