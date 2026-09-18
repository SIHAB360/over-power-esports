"use client";

import { useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function PlayerDashboard() {
  const router = useRouter();

useEffect(() => {

  checkUser();

}, []);


const checkUser = async () => {

  const {
    data: { user }
  } = await supabase.auth.getUser();


  if (!user) {
    router.push("/login");
    return;
  }


  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();


  if (profile?.role !== "player") {
    router.push("/");
  }

};
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
        <h1>PLAYER DASHBOARD</h1>
        <p>Welcome to Over Power Esports</p>
      </div>
    </main>
  );
}
