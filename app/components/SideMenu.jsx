"use client";

import Link from "next/link";

export default function SideMenu({ open, close }) {

  const menus = [
    { name: "HOME", href: "/" },
    { name: "PLAYERS", href: "/players" },
    { name: "TEAMS", href: "/teams" },
    { name: "TOURNAMENTS", href: "/tournaments" },
    { name: "RANKINGS", href: "/rankings" },
    { name: "JOIN TEAM", href: "/join-team" },
    { name: "LOGIN", href: "/login" },
  ];


  return (
    <>

      {open && (
        <div
          className="op-overlay"
          onClick={close}
        />
      )}



      <aside className={`op-side-menu ${open ? "open" : ""}`}>


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
                href={item.href}
                key={index}
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


/* OVERLAY */

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

top:30px;

left:-430px;


width:360px;


height:calc(100vh - 60px);


padding:

70px 35px 40px;


border-radius:35px;



background:

linear-gradient(

135deg,

rgba(255,255,255,.12),

rgba(20,0,10,.75)

);



backdrop-filter:

blur(35px);



border:

1px solid rgba(255,255,255,.18);



box-shadow:

0 0 60px rgba(255,0,80,.3),

inset 0 0 40px rgba(255,0,80,.08);



transition:.5s;


z-index:9999;


overflow:hidden;

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

1px solid #ff1744;



background:

rgba(255,255,255,.08);



color:white;


font-size:32px;


cursor:pointer;



box-shadow:

0 0 25px rgba(255,0,80,.5);


transition:.3s;

}



.op-close:hover{

transform:

rotate(90deg) scale(1.1);


background:#ff1744;

}





/* LOGO */


.op-side-logo{


font-size:28px;


font-weight:900;


letter-spacing:4px;


color:white;

}



.op-side-logo span{


display:block;


color:#ff1744;


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


gap:16px;

}



.op-menu-links a{


height:55px;


display:flex;


align-items:center;


gap:15px;


padding:0 20px;



border-radius:18px;



color:white !important;


text-decoration:none !important;



font-size:18px;


font-weight:700;


letter-spacing:2px;



background:

rgba(255,255,255,.06);



border:

1px solid rgba(255,255,255,.12);



backdrop-filter:

blur(15px);



transition:.35s;


}



.op-menu-links a:hover{


transform:

translateX(12px);


color:#ff1744 !important;



border-color:#ff1744;



box-shadow:

0 0 25px rgba(255,0,80,.5);


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


width:

calc(100% - 40px);


}



}


`}</style>



      </aside>


    </>

  );

}
