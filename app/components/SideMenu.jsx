"use client";

export default function SideMenu({ open, close }) {

  return (
    <>

      <div
        className={`overlay ${open ? "active" : ""}`}
        onClick={close}
      />


      <aside className={`side-menu ${open ? "show" : ""}`}>

        <button
          className="close"
          onClick={close}
        >
          ✕
        </button>


        <div className="side-logo">
          OVER POWER <span>ESPORTS</span>
        </div>


        <div className="links">

          <a href="/">HOME</a>

          <a href="/players">PLAYERS</a>

          <a href="/teams">TEAMS</a>

          <a href="/tournaments">
            TOURNAMENTS
          </a>

          <a href="/rankings">
            RANKINGS
          </a>

          <a href="/join-team">
            JOIN TEAM
          </a>

          <a href="/login">
            LOGIN
          </a>


        </div>



        <div className="footer">
          OVER POWER ESPORTS
          <br/>
          PLAY WITH DISCIPLINE
        </div>



      </aside>



<style jsx>{`

.overlay{

position:fixed;

inset:0;

background:rgba(0,0,0,.55);

backdrop-filter:blur(5px);

opacity:0;

pointer-events:none;

transition:.4s;

z-index:90;

}


.overlay.active{

opacity:1;

pointer-events:auto;

}



.side-menu{


position:fixed;


top:0;

right:-420px;


width:360px;

height:100vh;


background:

rgba(8,0,5,.96);


border-left:

1px solid rgba(255,0,60,.5);


box-shadow:

-10px 0 40px rgba(255,0,60,.35);



padding:90px 40px 40px;



transition:.45s ease;


z-index:100;


}



.side-menu.show{

right:0;

}



.close{


position:absolute;

top:25px;

right:25px;


width:40px;

height:40px;


border-radius:50%;


background:

rgba(255,0,60,.1);


border:

1px solid #ff1744;


color:white;


font-size:20px;


cursor:pointer;


}



.side-logo{


font-size:24px;

font-weight:800;

letter-spacing:2px;

color:white;

}



.side-logo span{

color:#ff1744;

}



.links{


display:flex;

flex-direction:column;


gap:22px;


margin-top:50px;


}



.links a{


color:white;


text-decoration:none;


font-size:18px;


letter-spacing:2px;


transition:.3s;


}



.links a:hover{


color:#ff1744;


padding-left:15px;


text-shadow:

0 0 15px #ff1744;


}



.footer{


position:absolute;


bottom:40px;


color:#777;


font-size:12px;


letter-spacing:2px;


}



@media(max-width:600px){


.side-menu{

width:85%;

padding:85px 30px 30px;

}



.side-logo{

font-size:18px;

}



.links a{

font-size:16px;

}



}


`}</style>


    </>
  );
}
