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
const [registeredTeams,setRegisteredTeams] = useState([]);


 useEffect(()=>{

  if(id){

    loadTournament();
    loadTeams();
    loadRegisteredTeams();

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
async function loadTeams(){

  const {data,error}=await supabase

  .from("teams")

  .select("*"); 


  if(error){

    console.log(error);

    return;

  }


  setTeams(data || []);

}


  async function loadRegisteredTeams(){

  const {data,error}=await supabase

  .from("tournament_teams")

  .select(`
    id,
    status,
    teams (
      id,
      team_name,
      logo
    )
  `)

  .eq("tournament_id",id);



  if(error){

    console.log(error);

    return;

  }


  setRegisteredTeams(data || []);

}
  
async function addTeam(teamId){


  const {data:existing}=await supabase

  .from("tournament_teams")

  .select("id")

  .eq("tournament_id",id)

  .eq("team_id",teamId);



  if(existing && existing.length > 0){

    alert("Team already added");

    return;

  }



  const {error}=await supabase

  .from("tournament_teams")

  .insert([

    {
      tournament_id:id,
      team_id:teamId,
      status:"registered"
    }

  ]);



  if(error){

    alert(error.message);

    return;

  }



  alert("Team Added Successfully");

  loadRegisteredTeams();

}



async function removeTeam(teamId){

  const {error}=await supabase

  .from("tournament_teams")

  .delete()

  .eq("id",teamId);


  if(error){

    alert(error.message);

    return;

  }


  alert("Team Removed Successfully");

  loadRegisteredTeams();

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



          {
registeredTeams.length === 0 ?

<div className="empty">
No team added yet.
</div>

:

<div className="registered-list">

{
registeredTeams.map((item)=>(

<div
key={item.id}
className="registered-team"
>


<div>

<h3>
{item.teams?.team_name}
</h3>


<p>
Status: {item.status}
</p>

</div>



<button
onClick={()=>removeTeam(item.id)}
>
REMOVE
</button>


</div>

))

}

</div>

}



          <button
onClick={()=>{

  setShowTeams(!showTeams);

}}
>
+ ADD TEAM
</button>
  {
showTeams && (

<div className="team-selector">


{
teams.map((team)=>(

<div
key={team.id}
className="team-option"
>


<h3>
{team.team_name}
</h3>


{
registeredTeams.some(
(item)=>item.teams?.id === team.id
)

?

<button disabled>
ADDED
</button>

:

<button
onClick={()=>addTeam(team.id)}
>
ADD
</button>

}


</div>

))

}


</div>

)
}


        </section>



      </div>




<style jsx>{`

/* PREMIUM TEAM DESIGN */

.registered-list{

display:flex;
flex-direction:column;
gap:18px;

}



.registered-team{

background:
linear-gradient(
135deg,
rgba(255,23,77,.15),
rgba(112,0,255,.15)
);

border:1px solid rgba(255,23,77,.35);

border-radius:22px;

padding:22px;

display:flex;

justify-content:space-between;

align-items:center;

transition:.3s;

}



.registered-team:hover{

transform:translateY(-5px);

box-shadow:
0 15px 40px rgba(255,23,77,.25);

}



.registered-team h3{

margin:0;

font-size:22px;

color:#ff174d;

}



.registered-team p{

color:#22ff99;

margin-top:8px;

}



.registered-team button{

width:150px;

background:

linear-gradient(
135deg,
#ff174d,
#ff0055
);

}





.team-selector{

margin-top:25px;

}



.team-option{

background:

linear-gradient(
145deg,
#151515,
#0a0a0a
);

border:1px solid #292929;

border-radius:20px;

padding:20px;

display:flex;

justify-content:space-between;

align-items:center;

margin-bottom:15px;

transition:.3s;

}



.team-option:hover{

border-color:#7000ff;

transform:translateY(-3px);

}



.team-option h3{

margin:0;

font-size:18px;

}



.team-option button{

width:150px;

background:

linear-gradient(
135deg,
#00c853,
#00ff99
);

color:#050505;

}



button:hover{

transform:scale(1.03);

box-shadow:

0 0 25px rgba(255,23,77,.5);

}



@media(max-width:700px){


.registered-team,
.team-option{

flex-direction:column;

gap:15px;

}


.registered-team button,
.team-option button{

width:100%;

}

}


`}</style>


    </main>

  );


}
