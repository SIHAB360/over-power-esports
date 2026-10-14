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

    <div className="best-card">


      <div className="champion-badge">
        🏆 BEST PLAYER
      </div>



      <div className="team-name">

        {team.name}

      </div>




      <div className="player-glow">


        <img

          src={player.image}

          alt={player.ign}

        />


      </div>




      <h2>

        {player.ign}

      </h2>



      <span className="role">

        {player.role}

      </span>




      <div className="score-box">


        <small>
          PERFORMANCE SCORE
        </small>


        <strong>
          {score}
        </strong>


      </div>





      <div className="stats">


        <div>

          ⚔

          <span>
            KILLS
          </span>

          <b>
            {stats.kills}
          </b>


        </div>




        <div>

          💥

          <span>
            DAMAGE
          </span>

          <b>
            {stats.damage}
          </b>


        </div>




        <div>

          🎯

          <span>
            ASSIST
          </span>

          <b>
            {stats.assists}
          </b>


        </div>




        <div>

          🏆

          <span>
            MVP
          </span>

          <b>
            {stats.mvp}
          </b>


        </div>


      </div>



      <div className="rank">

        #1 TEAM PLAYER

      </div>




      <style jsx>{`


.best-card{

position:relative;

width:320px;

padding:35px 25px;

border-radius:28px;


background:

linear-gradient(
145deg,
rgba(255,255,255,.08),
rgba(5,5,5,.9)
);


border:

1px solid rgba(255,215,74,.5);


box-shadow:

0 0 40px rgba(255,23,68,.25),
inset 0 0 30px rgba(255,215,74,.08);


text-align:center;


overflow:hidden;


transition:.4s;


}



.best-card:hover{

transform:translateY(-12px);


box-shadow:

0 0 60px rgba(255,215,74,.45);


}





.champion-badge{


display:inline-block;


padding:8px 18px;


border-radius:50px;


background:

rgba(255,215,74,.12);


border:

1px solid #FFD54A;


color:#FFD54A;


font-weight:800;


font-size:12px;


letter-spacing:2px;


}




.team-name{


margin-top:20px;


color:#00F5FF;


font-size:14px;


letter-spacing:2px;


}




.player-glow{


margin:25px auto;


width:150px;

height:150px;


border-radius:50%;


padding:5px;


background:

linear-gradient(
45deg,
#FF1744,
#8B5CFF,
#00F5FF,
#FFD54A
);


animation:rotate 5s linear infinite;


}




.player-glow img{


width:100%;

height:100%;


object-fit:cover;


border-radius:50%;


border:5px solid #080808;


}





h2{


color:white;


font-size:26px;


margin:15px 0 5px;


}





.role{


color:#FFD54A;


font-weight:700;


}




.score-box{


margin:25px 0;


padding:18px;


border-radius:18px;


background:

rgba(255,23,68,.12);


}



.score-box small{


display:block;

color:#aaa;


}



.score-box strong{


font-size:48px;


color:#FFD54A;


text-shadow:

0 0 25px #FFD54A;


}




.stats{


display:grid;


grid-template-columns:1fr 1fr;


gap:12px;


}




.stats div{


padding:12px;


border-radius:15px;


background:

rgba(255,255,255,.05);


border:

1px solid rgba(255,255,255,.1);


}




.stats span{


display:block;

font-size:10px;

color:#aaa;


}




.stats b{


display:block;


color:white;


font-size:18px;


}





.rank{


margin-top:25px;


color:#FF1744;


font-weight:900;


letter-spacing:2px;


}




@keyframes rotate{


from{

transform:rotate(0deg);

}

to{

transform:rotate(360deg);

}


}



`}</style>


    </div>

  );

}
