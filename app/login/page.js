"use client";

import { supabase } from "../lib/supabase";
import { useState } from "react";


export default function LoginPage() {


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");



 const handleLogin = async () => {

  alert("Button clicked");


  const { data, error } = await supabase.auth.signInWithPassword({

    email,

    password,

  });



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



  if(profileError){

    alert(profileError.message);

    return;

  }



  alert("Role: " + profile.role);



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
