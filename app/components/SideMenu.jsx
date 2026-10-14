"use client";

import Link from "next/link";

export default function SideMenu({ open, close }) {

  const menus = [
    {name:"HOME", href:"/"},
    {name:"PLAYERS", href:"/players"},
    {name:"TEAMS", href:"/teams"},
    {name:"TOURNAMENTS", href:"/tournaments"},
    {name:"RANKINGS", href:"/rankings"},
    {name:"JOIN TEAM", href:"/join-team"},
    {name:"LOGIN", href:"/login"},
  ];


  return (
    <>

      {open && (
        <div
          className="op-overlay"
          onClick={close}
        />
      )}



      <aside className={`op-side-menu ${open ? "open":""}`}>



        <button
          className="op-close"
          onClick={close}
        >
          ×
        </button>



        <div className="op-side-logo">

          OVER POWER

          <span>
            ESPORTS
          </span>


          <div className="logo-line"></div>

        </div>





        <div className="op-menu-links">


        {
          menus.map((item,index)=>(

            <Link
              key={index}
              href={item.href}
              onClick={close}
            >

              <span className="menu-dot"></span>

              {item.name}


            </Link>

          ))
        }


        </div>





        <div className="op-side-footer">

          OVER POWER ESPORTS
          <br/>
          PLAY WITH DISCIPLINE

        </div>





<style jsx>{`


*{
box-sizing:border-box;
}



/* BACKGROUND */


.op-overlay{

position:fixed;

inset:0;

background:

rgba(0,0,0,.65);

backdrop-filter:

blur(12px);


z-index:9998;


}




/* GLASS PANEL */


.op-side-menu{


position:fixed;


top:20px;

left:-430px;


width:390px;

height:calc(100vh - 40px);



padding:

70px 35px 40px;



border-radius:30px;



background:

linear-gradient(

135deg,

rgba(255,255,255,.10),

rgba(20,0,10,.75)

);



backdrop-filter:

blur(35px);



border:

1px solid rgba(255,255,255,.18);



box-shadow:


0 0 50px rgba(255,0,80,.25),

inset 0 0 40px rgba(255,0,80,.08);



transition:

.55s cubic-bezier(.77,0,.18,1);



z-index:9999;


overflow:hidden;


}




.op-side-menu:before{


content:"";


position:absolute;


inset:-2px;


border-radius:30px;


background:

linear-gradient(

90deg,

transparent,

#ff1744,

transparent

);


opacity:.4;


animation:

borderMove 4s linear infinite;


z-index:-1;


}



@keyframes borderMove{


0%{

transform:translateX(-100%);

}


100%{

transform:translateX(100%);

}


}




.op-side-menu.open{


left:20px;


}





/* CLOSE */


.op-close{


position:absolute;


top:25px;

right:25px;



width:50px;

height:50px;



border-radius:50%;


border:

1px solid rgba(255,0,80,.8);



background:

rgba(255,255,255,.08);



color:white;


font-size:32px;


cursor:pointer;



backdrop-filter:

blur(20px);



box-shadow:

0 0 25px rgba(255,0,80,.6);



transition:.35s;


}




.op-close:hover{


transform:

rotate(90deg) scale(1.1);


background:#ff1744;


}





/* LOGO */


.op-side-logo{


font-size:28px;


font-weight:1000;


letter-spacing:4px;


color:white;


text-shadow:

0 0 20px rgba(255,255,255,.3);


}



.op-side-logo span{


display:block;


color:#ff1744;


margin-top:5px;


text-shadow:

0 0 25px #ff1744;


}




.logo-line{


width:120px;


height:3px;


margin-top:18px;


background:

linear-gradient(

90deg,

#ff1744,

transparent

);



}





/* MENU */


.op-menu-links{


margin-top:55px;


display:flex;


flex-direction:column;


gap:18px;


}



.op-menu-links a{


height:55px;


display:flex;


align-items:center;


gap:15px;


padding:0 20px;


border-radius:18px;



color:white;


text-decoration:none;


font-size:18px;


font-weight:700;


letter-spacing:2px;



background:

rgba(255,255,255,.05);



border:

1px solid rgba(255,255,255,.08);



transition:.35s;



position:relative;



overflow:hidden;


}





.op-menu-links a:hover{


transform:

translateX(10px);


border-color:#ff1744;


box-shadow:

0 0 25px rgba(255,0,80,.5);


color:#ff1744;


}





.menu-dot{


width:10px;

height:10px;


border-radius:50%;


background:#ff1744;



box-shadow:

0 0 15px #ff1744;



animation:

blink 1.5s infinite;


}



.op-menu-links a:nth-child(2) .menu-dot{

background:#00ffff;

box-shadow:0 0 15px #00ffff;

}



.op-menu-links a:nth-child(3) .menu-dot{

background:#9b5cff;

box-shadow:0 0 15px #9b5cff;

}



.op-menu-links a:nth-child(4) .menu-dot{

background:#ffd000;

box-shadow:0 0 15px #ffd000;

}





@keyframes blink{


50%{

opacity:.3;

transform:scale(.7);

}


}





/* FOOTER */


.op-side-footer{


position:absolute;


bottom:35px;


font-size:11px;


letter-spacing:3px;


color:#888;


}





@media(max-width:600px){


.op-side-menu{


width:calc(100% - 40px);


}



}



`}</style>



      </aside>

    </>
  );
}
