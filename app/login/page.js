"use client";

import { supabase } from "../lib/supabase";
import { useState } from "react";


export default function LoginPage() {


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");



  const handleLogin = async () => {


    console.log("EMAIL:", email);
    console.log("PASSWORD:", password);



    const { data, error } = await supabase.auth.signInWithPassword({

      email: email.trim(),

      password,

    });



    console.log("DATA:", data);
    console.log("ERROR:", error);



    if(error){

      alert(error.message);

      return;

    }



    alert("Auth Success");



    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();



    console.log("PROFILE:", profile);
    console.log("PROFILE ERROR:", profileError);



    if(profileError){

      alert(profileError.message);

      return;

    }



    if(profile.role === "admin"){


      window.location.href="/admin/dashboard";


    }


    else if(profile.role === "player"){


      window.location.href="/player/dashboard";


    }


    else{


      alert("Invalid Role");


    }



  };



  return (

    <main>


      <h1>
        Login
      </h1>



      <input

        type="email"

        placeholder="Email"

        value={email}

        onChange={(e)=>setEmail(e.target.value)}

      />



      <input

        type="password"

        placeholder="Password"

        value={password}

        onChange={(e)=>setPassword(e.target.value)}

      />



      <button

        onClick={handleLogin}

      >

        Login

      </button>



    </main>

  );

}
