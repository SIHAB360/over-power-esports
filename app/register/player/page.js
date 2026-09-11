"use client";

import { useState } from "react";

export default function PlayerRegister(){

  const [name,setName]=useState("");
  const [team,setTeam]=useState("");

  function submit(e){
    e.preventDefault();

    console.log({
      name,
      team
    });
  }


  return (

    <main>

      <h1>
        PLAYER REGISTRATION
      </h1>


      <form onSubmit={submit}>

        <input
          placeholder="Player Name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
        />


        <input
          placeholder="Team Name"
          value={team}
          onChange={(e)=>setTeam(e.target.value)}
        />


        <button>
          Submit
        </button>

      </form>


    </main>

  );

}
