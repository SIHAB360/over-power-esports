"use client";

import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";


export default function AdminDashboard() {


  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);



  useEffect(()=>{


    checkAdmin();


  },[]);



  const checkAdmin = async()=>{


    const { data:{ user } } = await supabase.auth.getUser();



    if(!user){

      window.location.href="/login";

      return;

    }



    const { data:profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();



    if(profile?.role !== "admin"){

      window.location.href="/login";

      return;

    }



    setUser(user);

    setLoading(false);



  };




  const logout = async()=>{


    await supabase.auth.signOut();


    window.location.href="/login";


  };



  if(loading){

    return (

      <main>

        <h1>
          Loading Admin Panel...
        </h1>

      </main>

    );

  }




  return (

    <main className="admin">


      <header className="top">

        <h1>
          OVER POWER ADMIN PANEL
        </h1>


        <button onClick={logout}>
          Logout
        </button>


      </header>



      <section className="cards">


        <div className="card">

          <h2>
            Players
          </h2>

          <p>
            Manage all players
          </p>

        </div>



        <div className="card">

          <h2>
            Matches
          </h2>

          <p>
            Create and manage matches
          </p>

        </div>



        <div className="card">

          <h2>
            Profit
          </h2>

          <p>
            Control tournament profit
          </p>

        </div>



        <div className="card">

          <h2>
            Salaries
          </h2>

          <p>
            Manage player salary
          </p>

        </div>



      </section>




<style jsx>{`

.admin{

min-height:100vh;

padding:40px;

background:
linear-gradient(
135deg,
#400000,
#050505
);

color:white;

}



.top{

display:flex;

justify-content:space-between;

align-items:center;

margin-bottom:40px;

}



.top h1{

font-size:32px;

}



button{

background:#ff2020;

color:white;

border:none;

padding:12px 25px;

border-radius:25px;

cursor:pointer;

}



.cards{

display:grid;

grid-template-columns:repeat(4,1fr);

gap:25px;

}



.card{

background:

rgba(255,255,255,.08);

border:

1px solid rgba(255,0,60,.4);

padding:30px;

border-radius:20px;

box-shadow:

0 0 30px rgba(255,0,60,.2);

}



.card h2{

color:#ff2020;

}



@media(max-width:800px){

.cards{

grid-template-columns:1fr;

}


}



`}</style>


    </main>

  );


}
