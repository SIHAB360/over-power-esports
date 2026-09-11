"use client";

import { useState } from "react";

export default function PlayerRegister(){

  const [form,setForm] = useState({
    full_name:"",
    ign:"",
    freefire_uid:"",
    email:"",
    phone:"",
    age:"",
    team_name:""
  });


  const [message,setMessage]=useState("");


  function handleChange(e){

    setForm({
      ...form,
      [e.target.name]:e.target.value
    });

  }



  async function submit(e){

    e.preventDefault();


    const res = await fetch("/api/register-player",{

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify(form)

    });


    const data = await res.json();


    if(data.success){

      setMessage("Registration Successful");

    }
    else{

      setMessage(data.message);

    }

  }



  return (

    <main>


      <h1>
        PLAYER REGISTRATION
      </h1>



      <form onSubmit={submit}>


        <input
        name="full_name"
        placeholder="Player Name"
        onChange={handleChange}
        />


        <input
        name="ign"
        placeholder="In Game Name"
        onChange={handleChange}
        />


        <input
        name="freefire_uid"
        placeholder="Free Fire UID"
        onChange={handleChange}
        />


        <input
        name="email"
        placeholder="Email"
        onChange={handleChange}
        />


        <input
        name="phone"
        placeholder="Phone Number"
        onChange={handleChange}
        />


        <input
        name="age"
        placeholder="Age"
        onChange={handleChange}
        />


        <input
        name="team_name"
        placeholder="Team Name"
        onChange={handleChange}
        />


        <button>
          Submit
        </button>


      </form>


      <p>{message}</p>


    </main>

  );

}
