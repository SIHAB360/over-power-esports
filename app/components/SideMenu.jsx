"use client";

export default function SideMenu({ open, close }) {

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

        </div>



        <div className="op-menu-links">


          <a href="/">
            HOME
          </a>


          <a href="/players">
            PLAYERS
          </a>


          <a href="/teams">
            TEAMS
          </a>


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



        <div className="op-side-footer">

          OVER POWER ESPORTS

          <br/>

          PLAY WITH DISCIPLINE

        </div>




<style jsx>{`



.op-overlay{


position:fixed;


inset:0;


background:

rgba(0,0,0,.55);


backdrop-filter:

blur(8px);


transition:.4s;


z-index:1000;


}

.op-side-menu{


position:fixed;


top:0;


left:-420px;


width:380px;


height:100vh;



padding:90px 40px 40px;



background:

rgba(10,10,10,.45);



backdrop-filter:

blur(25px);



border-right:

1px solid rgba(255,0,60,.45);



box-shadow:


20px 0 50px rgba(255,0,60,.25),


inset -10px 0 40px rgba(255,0,60,.08);




transition:.45s ease;


z-index:1001;



overflow:hidden;


}



.op-side-menu.open{


left:0;


}






.op-close{


position:absolute;


top:25px;


right:25px;



width:42px;


height:42px;



border-radius:50%;



border:

1px solid rgba(255,0,60,.7);



background:

rgba(255,0,60,.12);



color:white;


font-size:28px;


cursor:pointer;



box-shadow:

0 0 20px rgba(255,0,60,.5);


}





.op-side-logo{


font-size:26px;


font-weight:900;


letter-spacing:3px;


color:white;



}


.op-side-logo span{


display:block;


color:#ff2020;


text-shadow:

0 0 20px red;



}






.op-menu-links{


margin-top:55px;



display:flex;


flex-direction:column;



gap:18px;



}




.op-menu-links a{


position:relative;


color:white;


text-decoration:none;


font-size:18px;


font-weight:700;



letter-spacing:2px;



padding:12px 0;



transition:.3s;



}




.op-menu-links a::before{


content:"";


position:absolute;


left:0;


bottom:0;



width:0;


height:2px;


background:#ff2020;



box-shadow:

0 0 15px red;



transition:.3s;



}



.op-menu-links a:hover{


color:#ff2020;


padding-left:15px;



text-shadow:

0 0 15px red;


}



.op-menu-links a:hover::before{


width:100%;


}






.op-side-footer{


position:absolute;


bottom:35px;


left:40px;



font-size:11px;


letter-spacing:2px;


color:#777;



}








@media(max-width:600px){



.op-side-menu{


width:85%;


padding:80px 28px 30px;



}




.op-side-logo{


font-size:20px;



}



.op-menu-links{


margin-top:40px;


gap:15px;



}



.op-menu-links a{


font-size:16px;


}



.op-side-footer{


left:28px;


}



}







`}</style>



      </aside>



    </>
  );
}
