"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useParams } from "next/navigation";


export default function TournamentDetails(){

  const params = useParams();

  const id = params.id;


  const [tournament,setTournament] = useState(null);
  const [loading,setLoading] = useState(true);
    const [teams,setTeams] = useState([]);
    const [showTeams,setShowTeams] = useState(false);



  useEffect(()=>{

    if(id){
      loadTournament();
    }

  },[id]);



  async function loadTournament(){

    const {data,error}=await supabase
    .from("tournaments")
    .select("*")
    .eq("id",id)
    .single();


    if(error){

      console.log(error);
      return;

    }


    setTournament(data);
    setLoading(false);

  }




  if(loading){

    return(
      <main className="page">
        Loading Tournament...
      </main>
    )

  }




  return(

    <main className="page">


      <div className="glow"></div>


      <div className="container">


        <header>

          <span>
            OVER POWER ESPORTS
          </span>


          <h1>
            {tournament.name}
          </h1>


          <p>
            Tournament Management Center
          </p>

        </header>





        <section className="card">


          <h2>
            TOURNAMENT OVERVIEW
          </h2>



          <div className="grid">


            <div>

              <label>
                PRIZE POOL
              </label>

              <strong>
                ৳{tournament.prize_pool}
              </strong>

            </div>



            <div>

              <label>
                ENTRY FEE
              </label>

              <strong>
                ৳{tournament.entry_fee}
              </strong>

            </div>



            <div>

              <label>
                STATUS
              </label>

              <strong className="green">
                {tournament.status}
              </strong>

            </div>



            <div>

              <label>
                START DATE
              </label>

              <strong>
                {tournament.start_date || "N/A"}
              </strong>

            </div>


          </div>


        </section>





        <section className="card">


          <h2>
            REGISTERED TEAMS
          </h2>



          <div className="empty">

            No team added yet.

          </div>



          <button>
            + ADD TEAM
          </button>


        </section>



      </div>




<style jsx>{`

.page{

min-height:100vh;
background:#050505;
color:white;
padding:40px 20px;
position:relative;

}


.container{

max-width:1000px;
margin:auto;
position:relative;
z-index:2;

}


.glow{

position:fixed;
width:400px;
height:400px;
background:#ff0055;
filter:blur(150px);
opacity:.25;
top:-100px;
left:-100px;

}


header{

text-align:center;
margin-bottom:40px;

}


header span{

color:#ff174d;
letter-spacing:4px;
font-size:12px;
font-weight:900;

}



header h1{

font-size:48px;
margin:15px 0;

}



header p{

color:#888;

}



.card{

background:rgba(255,255,255,.04);
border:1px solid rgba(255,23,77,.3);
border-radius:25px;
padding:30px;
margin-bottom:25px;

}



h2{

font-size:18px;
margin-bottom:25px;

}



.grid{

display:grid;
grid-template-columns:repeat(4,1fr);
gap:15px;

}



.grid div{

background:#111;
padding:20px;
border-radius:15px;

}



label{

display:block;
color:#888;
font-size:12px;

}



strong{

display:block;
margin-top:10px;
font-size:20px;

}


.green{

color:#22ff99;

}



.empty{

text-align:center;
padding:40px;
color:#888;

}



button{

width:100%;
padding:16px;
border:none;
border-radius:30px;

background:linear-gradient(
135deg,
#ff174d,
#7000ff
);

color:white;
font-weight:900;
cursor:pointer;

}



@media(max-width:700px){

.grid{

grid-template-columns:1fr;

}


header h1{

font-size:32px;

}

}



`}</style>


    </main>

  );


}
