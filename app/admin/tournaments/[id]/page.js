"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useParams } from "next/navigation";


export default function TournamentDetails(){

  const params = useParams();

  const id = params.id;


  const [tournament,setTournament] = useState(null);
  const [loading,setLoading] = useState(true);



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

        <h1>
          Loading Tournament...
        </h1>

      </main>

    );

  }




  if(!tournament){

    return(

      <main className="page">

        <h1>
          Tournament Not Found
        </h1>

      </main>

    );

  }



return (

<main className="page">


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
TOURNAMENT INFORMATION
</h2>


<div className="info-grid">


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

<strong>
{tournament.status}
</strong>

</div>




<div>

<label>
START DATE
</label>

<strong>
{tournament.start_date}
</strong>

</div>


</div>


</section>



</div>


</main>

);

}
