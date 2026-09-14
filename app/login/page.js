"use client";

import { supabase } from "../lib/supabase";
import { useState } from "react";


export default function LoginPage() {


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);



  const handleLogin = async () => {


    if(!email || !password){

      alert("Please enter email and password");

      return;

    }



    setLoading(true);



    const { data, error } = await supabase.auth.signInWithPassword({

      email: email.trim(),

      password,

    });



    if(error){

      alert(error.message);

      setLoading(false);

      return;

    }



    const { data: profile, error: profileError } = await supabase

      .from("profiles")

      .select("role")

      .eq("id", data.user.id)

      .single();



    if(profileError){

      alert("Profile not found");

      setLoading(false);

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

      setLoading(false);


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

        disabled={loading}

      >

        {loading ? "Logging in..." : "Login"}

      </button>



    </main>

  );

}
