"use client";

export default function SideMenu({ open, close }) {
  return (
    <>
      <div
        className={`menu-overlay ${open ? "show" : ""}`}
        onClick={close}
      ></div>

      <div className={`side-menu ${open ? "active" : ""}`}>

        <button className="close-btn" onClick={close}>
          ✕
        </button>

        <div className="menu-logo">
          OVER POWER <span>ESPORTS</span>
        </div>


        <div className="menu-links">

          <a href="/">HOME</a>

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


        <div className="menu-footer">
          OVER POWER ESPORTS
          <br />
          PLAY WITH DISCIPLINE
        </div>

      </div>


      <style jsx>{`

        .menu-overlay {
          position: fixed;
          inset:0;
          background:rgba(0,0,0,0.55);
          backdrop-filter:blur(8px);
          opacity:0;
          pointer-events:none;
          transition:.4s;
          z-index:90;
        }


        .menu-overlay.show{
          opacity:1;
          pointer-events:auto;
        }


        .side-menu{

          position:fixed;
          top:0;
          right:-420px;

          width:380px;
          height:100vh;

          background:
          rgba(10,0,5,.85);

          border-left:
          1px solid rgba(255,0,60,.6);

          box-shadow:
          0 0 40px rgba(255,0,60,.5);

          backdrop-filter:blur(20px);

          padding:40px 35px;

          transition:.45s ease;

          z-index:100;

        }


        .side-menu.active{
          right:0;
        }



        .close-btn{

          position:absolute;
          right:25px;
          top:20px;

          background:none;
          border:none;

          color:white;
          font-size:28px;

          cursor:pointer;

        }



        .menu-logo{

          margin-top:40px;

          color:white;

          font-size:24px;

          font-weight:800;

          letter-spacing:2px;

        }


        .menu-logo span{

          color:#ff1744;

        }



        .menu-links{

          margin-top:50px;

          display:flex;

          flex-direction:column;

          gap:20px;

        }



        .menu-links a{

          color:white;

          text-decoration:none;

          font-size:18px;

          letter-spacing:2px;

          padding:12px;

          border-left:2px solid transparent;

          transition:.3s;

        }



        .menu-links a:hover{

          color:#ff1744;

          border-left:2px solid #ff1744;

          padding-left:25px;

          text-shadow:
          0 0 15px #ff1744;

        }



        .menu-footer{

          position:absolute;

          bottom:40px;

          color:#888;

          font-size:12px;

          letter-spacing:2px;

        }



        @media(max-width:600px){

          .side-menu{

            width:85%;

          }

        }


      `}</style>

    </>
  );
}
