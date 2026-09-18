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
      <main>
        Loading Tournament...
      </main>
    )

  }



  return(

    <main>

      <h1>
        {tournament?.name}
      </h1>

      <h3>
        Prize Pool: ৳{tournament?.prize_pool}
      </h3>

      <h3>
        Status: {tournament?.status}
      </h3>


    </main>

  );


}
