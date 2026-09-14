"use client";

import { useState } from "react";
import SideMenu from "./SideMenu";

export default function Navbar() {

  const [menuOpen, setMenuOpen] = useState(false);


  return (
    <>

      <nav className="op-navbar">


        <div className="op-logo">
          OVER POWER <span>ESPORTS</span>
        </div>



        <div className="op-actions">


          <a href="/login" className="op-login">
            LOGIN
          </a>



          <button
            className="op-menu-btn"
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

.op-navbar{

position:fixed;

top:18px;

left:50%;

transform:translateX(-50%);


width:calc(100% - 40px);

max-width:1400px;


height:68px;


display:flex;

align-items:center;

justify-content:space-between;


padding:0 28px;


background:

rgba(5,5,5,.75);


backdrop-filter:

blur(20px);


border:

1px solid rgba(255,0,60,.35);


border-radius:20px;


box-shadow:

0 0 35px rgba(255,0,60,.15);


z-index:9999;

}



.op-logo{

color:white;

font-size:22px;

font-weight:900;

letter-spacing:3px;

white-space:nowrap;

}



.op-logo span{

color:#ff2020;

text-shadow:

0 0 15px #ff2020;

}



.op-actions{

display:flex;

align-items:center;

gap:15px;

}



.op-login{


height:38px;

padding:0 25px;


display:flex;

align-items:center;

justify-content:center;


color:white;


font-size:13px;

font-weight:700;

letter-spacing:2px;


text-decoration:none;


border-radius:25px;


border:

1px solid rgba(255,0,60,.7);



background:

rgba(255,0,60,.10);



box-shadow:

0 0 15px rgba(255,0,60,.3);


transition:.3s;


}



.op-login:hover{

background:#ff2020;

box-shadow:

0 0 30px #ff2020;

}





.op-menu-btn{


width:42px;

height:42px;


display:flex;

flex-direction:column;

justify-content:center;

align-items:center;


gap:5px;


border-radius:50%;


border:

1px solid rgba(255,0,60,.7);



background:

rgba(255,0,60,.12);


cursor:pointer;


box-shadow:

0 0 20px rgba(255,0,60,.5);


transition:.3s;


}



.op-menu-btn span{


width:18px;

height:2px;


background:white;


border-radius:10px;


box-shadow:

0 0 8px white;


}



.op-menu-btn:hover{

transform:scale(1.1);

box-shadow:

0 0 35px #ff2020;

}



.op-menu-btn:hover span{

background:#ff2020;

}





@media(max-width:768px){


.op-navbar{


top:12px;


width:calc(100% - 24px);


height:58px;


padding:0 14px;


}



.op-logo{

font-size:14px;

letter-spacing:1px;

}



.op-actions{

gap:8px;

}



.op-login{


height:32px;

padding:0 14px;


font-size:10px;


}



.op-menu-btn{

width:36px;

height:36px;

}



}



@media(max-width:400px){


.op-login{

display:none;

}



.op-logo{

font-size:13px;

}



}


`}</style>



    </>
  );
}
