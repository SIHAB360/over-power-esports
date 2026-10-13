"use client";

import { useEffect, useState } from "react";
import SideMenu from "./SideMenu";


export default function Navbar(){

  const [menuOpen,setMenuOpen]=useState(false);
  const [scrolled,setScrolled]=useState(false);


  useEffect(()=>{

    const handleScroll=()=>{

      if(window.scrollY > 40){
        setScrolled(true);
      }else{
        setScrolled(false);
      }

    };


    window.addEventListener("scroll",handleScroll);


    return()=>window.removeEventListener("scroll",handleScroll);


  },[]);



  return(
    <>


    <nav className={`op-navbar ${scrolled ? "scrolled":""}`}>

      
      <div className="light-beam"></div>


      <div className="energy-line"></div>


      <div className="op-logo">

        OVER POWER 
        <span>ESPORTS</span>

      </div>



      <div className="op-actions">


        <a href="/login" className="op-login">
          LOGIN
        </a>



        <button
        className="op-menu-btn"
        onClick={()=>setMenuOpen(true)}
        >


          <span></span>
          <span></span>
          <span></span>


        </button>


      </div>



    </nav>



    <SideMenu
      open={menuOpen}
      close={()=>setMenuOpen(false)}
    />



<style jsx>{`


.op-navbar{


position:fixed;

top:0;

left:50%;

transform:translateX(-50%);

width:100vw;

max-width:none;

height:90px;


display:flex;

align-items:center;

justify-content:space-between;


padding:0 60px;


z-index:9999;


background:

linear-gradient(
180deg,
rgba(10,0,3,.35),
rgba(10,0,3,.15)
);



border-bottom:

1px solid rgba(255,0,60,.25);


transition:.5s ease;


overflow:hidden;


}




/* scroll state */


.op-navbar.scrolled{


top:15px;


width:calc(100% - 50px);


border-radius:25px;


background:

rgba(5,5,5,.85);



backdrop-filter:

blur(25px);


box-shadow:

0 0 40px rgba(255,0,60,.35);


border:

1px solid rgba(255,0,60,.5);


}




.light-beam{


position:absolute;


top:-80px;

left:-300px;


width:280px;

height:250px;


background:

radial-gradient(
circle,
rgba(255,0,60,.5),
transparent 70%
);


filter:blur(30px);


animation:

moveLight 6s linear infinite;


}



@keyframes moveLight{


0%{
left:-300px;
}


100%{
left:110%;
}


}




.energy-line{


position:absolute;

bottom:0;

left:0;


height:2px;


width:100%;


background:

linear-gradient(
90deg,
transparent,
red,
yellow,
red,
transparent
);


background-size:300%;


animation:

lineMove 4s linear infinite;


}




@keyframes lineMove{


0%{
background-position:0%;
}


100%{
background-position:300%;
}


}






.op-logo{


font-size:24px;


font-weight:950;


letter-spacing:4px;


color:white;


text-shadow:

0 0 15px rgba(255,255,255,.4);


z-index:2;


}




.op-logo span{


color:#ff2020;


margin-left:8px;


text-shadow:

0 0 15px red,
0 0 30px red;


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


font-weight:900;


letter-spacing:3px;


border-radius:30px;


border:

1px solid red;


background:

rgba(255,0,40,.12);


box-shadow:

0 0 20px rgba(255,0,40,.5);


transition:.35s;


animation:

buttonGlow 2s infinite;


}



.op-login:hover{


background:red;


transform:translateY(-3px);


box-shadow:

0 0 45px red;


}





@keyframes buttonGlow{


50%{

box-shadow:

0 0 35px rgba(255,0,60,.9);

}


}






.op-menu-btn{


width:48px;

height:48px;


border-radius:50%;


border:

1px solid red;


background:

rgba(255,0,60,.15);


display:flex;

flex-direction:column;


justify-content:center;

align-items:center;


gap:5px;


cursor:pointer;


box-shadow:

0 0 25px red;


transition:.35s;


}



.op-menu-btn span{


width:20px;


height:2px;


background:white;


border-radius:10px;


transition:.3s;


}




.op-menu-btn:hover{


transform:rotate(180deg) scale(1.1);


background:red;


box-shadow:

0 0 45px red;


}




.op-menu-btn:hover span{


background:white;


}






@media(max-width:768px){


.op-navbar{


height:70px;

padding:0 18px;


}



.op-navbar.scrolled{


width:calc(100% - 24px);

top:10px;


}



.op-logo{


font-size:14px;


letter-spacing:2px;


}



.op-login{


height:34px;

padding:0 15px;

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
