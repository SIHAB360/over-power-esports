"use client";

import { useEffect } from "react";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function PlayerDashboard() {
  const router = useRouter();
  const [player, setPlayer] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {

  checkUser();

}, []);
const loadPlayer = async (userId) => {

  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("user_id", userId)
    .single();


  if (error) {
    console.log(error);
    return;
  }


  setPlayer(data);
  setLoading(false);

};

const checkUser = async () => {

  const {
    data: { user }
  } = await supabase.auth.getUser();


  if (!user) {
    router.push("/login");
    return;
  }
loadPlayer(user.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();


  if (profile?.role !== "player") {
    router.push("/");
  }

};
  if (loading) {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:"#050505",
        color:"white",
        display:"flex",
        justifyContent:"center",
        alignItems:"center"
      }}
    >
      Loading Player...
    </main>
  );
}
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#ffffff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1>
  Welcome, {player?.full_name}
</h1>

<p>
  IGN: {player?.ign}
</p>
      </div>
    </main>
  );
}
