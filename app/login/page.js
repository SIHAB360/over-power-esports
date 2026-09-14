"use client";

import { supabase } from "../lib/supabase";
import { useState } from "react";


export default function LoginPage() {


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");



  const handleLogin = async () => {


    const { data, error } = await supabase.auth.signInWithPassword({

      email,

      password,

    });



    if(error){

      alert(error.message);

      return;

    }



    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();



    if(profileError){

      alert("Profile not found");

      return;

    }



    if(profile.role === "admin"){

      window.location.href="/admin/dashboard";

    }



    else if(profile.role === "player"){

      window.location.href="/player/dashboard";

    }



    else{

      alert("Invalid user role");

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
