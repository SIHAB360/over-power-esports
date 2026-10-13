"use client";

import { useState } from "react";
import SideMenu from "./SideMenu";

export default function Navbar() {

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>

      <nav className="op-navbar">

        <div className="op-light"></div>


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

top:0;

left:50%;

transform:translateX(-50%);


width:100%;

max-width:1500px;


height:92px;


display:flex;

align-items:center;

justify-content:space-between;


padding:0 45px;


background:

linear-gradient(
180deg,
rgba(20,0,5,.92),
rgba(5,0,2,.75)
);


backdrop-filter:blur(25px);


border-bottom:

1px solid rgba(255,0,70,.35);


z-index:9999;


overflow:hidden;


box-shadow:

0 10px 40px rgba(255,0,60,.18);


}



/* top premium light */

.op-light{

position:absolute;

top:-60px;

left:50%;

transform:translateX(-50%);


width:500px;

height:120px;


background:

radial-gradient(
circle,
rgba(255,0,70,.45),
transparent 70%
);


filter:blur(20px);


}




.op-navbar:before{

content:"";

position:absolute;

bottom:0;

left:10%;


width:80%;

height:1px;


background:

linear-gradient(
90deg,
transparent,
#ff003c,
#ffe600,
#ff003c,
transparent
);


box-shadow:

0 0 20px #ff003c;


}




.op-logo{


position:relative;

z-index:2;


color:white;


font-size:24px;


font-weight:950;


letter-spacing:4px;


text-shadow:

0 0 15px rgba(255,255,255,.3);


}



.op-logo span{


color:#ff2020;


text-shadow:

0 0 10px #ff2020,
0 0 25px #ff2020;


}




.op-actions{


display:flex;

align-items:center;

gap:18px;

z-index:2;


}




.op-login{


height:42px;


padding:0 30px;


display:flex;

align-items:center;

justify-content:center;


color:white;


font-size:13px;


font-weight:800;


letter-spacing:3px;


text-decoration:none;


border-radius:30px;


border:

1px solid rgba(255,0,70,.8);



background:

linear-gradient(
135deg,
rgba(255,0,60,.25),
rgba(255,0,60,.05)
);



box-shadow:

0 0 20px rgba(255,0,60,.45),
inset 0 0 15px rgba(255,0,60,.2);


transition:.35s;


}




.op-login:hover{


background:#ff003c;


box-shadow:

0 0 40px #ff003c;


transform:translateY(-2px);


}





.op-menu-btn{


width:48px;

height:48px;


border-radius:50%;


display:flex;

align-items:center;

justify-content:center;

flex-direction:column;


gap:5px;


border:

1px solid rgba(255,0,70,.8);


background:

rgba(255,0,60,.15);


cursor:pointer;


box-shadow:

0 0 25px rgba(255,0,60,.6);


transition:.3s;


}




.op-menu-btn span{


width:20px;


height:2px;


background:white;


border-radius:10px;


box-shadow:

0 0 8px white;


}




.op-menu-btn:hover{


transform:scale(1.12);


background:#ff003c;


box-shadow:

0 0 45px #ff003c;


}




@media(max-width:768px){


.op-navbar{


height:72px;

padding:0 18px;


}



.op-logo{


font-size:15px;

letter-spacing:2px;


}



.op-login{


height:34px;

padding:0 16px;


font-size:10px;


}



.op-menu-btn{


width:38px;

height:38px;


}



.op-menu-btn span{

width:16px;

}



}



`}</style>


    </>
  );
}
