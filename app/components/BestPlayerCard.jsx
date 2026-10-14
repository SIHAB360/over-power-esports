"use client";


export default function BestPlayerCard({ data }) {


  const {
    team,
    bestPlayer
  } = data;


  const {
    player,
    stats,
    score
  } = bestPlayer;



  return (

    <div className="vip-card">


      <div className="energy-border"></div>


      <div className="badge">

        🏆 BEST PLAYER

      </div>



      <div className="team">

        {team.name}

      </div>



      <div className="avatar-box">


        <div className="ring"></div>


        <img
          src={player.image}
          alt={player.ign}
        />


      </div>




      <h2>

        {player.ign}

      </h2>


      <p className="role">

        {player.role}

      </p>





      <div className="score">


        <span>
          PERFORMANCE SCORE
        </span>


        <strong>
          {score}
        </strong>


      </div>






      <div className="stats">


        <div>

          ⚔
          <small>KILLS</small>

          <b>
            {stats.kills}
          </b>

        </div>



        <div>

          💥
          <small>DAMAGE</small>

          <b>
            {stats.damage}
          </b>

        </div>



        <div>

          🎯
          <small>ASSIST</small>

          <b>
            {stats.assists}
          </b>

        </div>



        <div>

          🏆
          <small>MVP</small>

          <b>
            {stats.mvp}
          </b>

        </div>


      </div>




      <div className="rank">

        #1 TEAM PLAYER

      </div>





<style jsx>{`

.vip-card{

position:relative;

width:380px;

min-height:560px;

padding:35px;

border-radius:35px;

overflow:hidden;

text-align:center;


background:

linear-gradient(
145deg,
rgba(255,255,255,.12),
rgba(5,0,10,.95)
);


border:

1px solid rgba(255,215,74,.5);


box-shadow:

0 0 60px rgba(255,23,68,.25),
inset 0 0 40px rgba(139,92,255,.15);


transition:.5s;


}



.vip-card:hover{

transform:

translateY(-15px)
scale(1.03);


box-shadow:

0 0 80px rgba(255,215,74,.35),
0 0 120px rgba(139,92,255,.25);


}





.energy-border{


position:absolute;

inset:0;


border-radius:35px;


background:

linear-gradient(
90deg,
#FF1744,
#FFD54A,
#8B5CFF,
#00F5FF,
#FF1744
);


background-size:300%;


animation:borderMove 5s linear infinite;


z-index:-1;


}





.badge{


display:inline-block;


padding:10px 25px;


border-radius:50px;


background:

rgba(255,215,74,.12);


border:

1px solid #FFD54A;


color:#FFD54A;


font-weight:900;


letter-spacing:2px;


}




.team{


margin-top:25px;


color:#00F5FF;


font-weight:800;


letter-spacing:3px;


}





.avatar-box{


position:relative;


width:190px;

height:190px;


margin:35px auto;


}



.avatar-box img{


width:160px;

height:160px;


object-fit:cover;


border-radius:50%;


position:absolute;


top:15px;

left:15px;


border:6px solid #050505;


}





.ring{


position:absolute;


width:190px;

height:190px;


border-radius:50%;


background:

conic-gradient(
#FF1744,
#FFD54A,
#8B5CFF,
#00F5FF,
#FF1744
);


animation:spin 4s linear infinite;


}





h2{


margin-top:15px;


font-size:32px;


color:white;


letter-spacing:2px;


}





.role{


color:#FFD54A;


font-weight:700;


}





.score{


margin:30px 0;


padding:20px;


border-radius:25px;


background:

rgba(255,23,68,.12);


border:

1px solid rgba(255,215,74,.3);


}



.score span{


display:block;


font-size:12px;


color:#aaa;


}



.score strong{


font-size:55px;


color:#FFD54A;


text-shadow:

0 0 35px #FFD54A;


}





.stats{


display:grid;

grid-template-columns:1fr 1fr;


gap:15px;


}



.stats div{


padding:18px;


border-radius:18px;


background:

rgba(255,255,255,.06);


border:

1px solid rgba(255,255,255,.15);


}





.stats small{


display:block;


color:#aaa;


font-size:11px;


}



.stats b{


font-size:22px;


color:white;


}




.rank{


margin-top:30px;


font-weight:900;


color:#FF1744;


letter-spacing:3px;


}




@keyframes spin{


from{

transform:rotate(0deg);

}

to{

transform:rotate(360deg);

}


}



@keyframes borderMove{


0%{

background-position:0%;

}


100%{

background-position:300%;

}


}



@media(max-width:600px){


.vip-card{

width:100%;

}


}



`}</style>



    </div>

  );

}
