"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";


export default function TeamsPage() {


  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);


  const [form, setForm] = useState({

    team_name: "",
    logo: "",
    description: "",
    coach_name: "",
    manager_name: "",
    country: "Bangladesh",
    founded_year: "",
    status: "active",

  });



  useEffect(() => {

    loadTeams();

  }, []);





  async function loadTeams() {


    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .order("created_at", {
        ascending: false
      });



    if (error) {

      console.log(error);
      return;

    }


    setTeams(data || []);
    setLoading(false);


  }







  function handleChange(e) {


    const { name, value } = e.target;


    setForm((prev) => ({

      ...prev,

      [name]: value

    }));


  }







  async function createTeam(e) {


    e.preventDefault();



    if (!form.team_name) {

      alert("Team name required");
      return;

    }



    setSaving(true);




    const { error } = await supabase
      .from("teams")
      .insert([

        {

          ...form,

          total_winnings: 0

        }

      ]);





    if (error) {


      alert(error.message);

      setSaving(false);

      return;

    }






    alert("Team Created Successfully");




    setForm({

      team_name: "",
      logo: "",
      description: "",
      coach_name: "",
      manager_name: "",
      country: "Bangladesh",
      founded_year: "",
      status: "active",

    });




    loadTeams();


    setSaving(false);



  }





  return (

    <main className="page">


      <div className="glow glow-one"></div>
      <div className="glow glow-two"></div>
      <div className="glow glow-three"></div>



      <div className="container">



        <header className="header">


          <span>
            OVER POWER ESPORTS
          </span>


          <h1>
            TEAM MANAGEMENT
          </h1>


          <p>
            Create and manage your esports teams
          </p>


        </header>





        <section className="panel">


          <h2>
            CREATE NEW TEAM
          </h2>




          <form onSubmit={createTeam}>


            <div className="grid">


              <input
                name="team_name"
                placeholder="Team Name"
                value={form.team_name}
                onChange={handleChange}
              />



              <input
                name="logo"
                placeholder="Logo URL"
                value={form.logo}
                onChange={handleChange}
              />



              <input
                name="coach_name"
                placeholder="Coach Name"
                value={form.coach_name}
                onChange={handleChange}
              />



              <input
                name="manager_name"
                placeholder="Manager Name"
                value={form.manager_name}
                onChange={handleChange}
              />
              <input
                name="country"
                placeholder="Country"
                value={form.country}
                onChange={handleChange}
              />



              <input
                name="founded_year"
                placeholder="Founded Year"
                type="number"
                value={form.founded_year}
                onChange={handleChange}
              />



              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >

                <option value="active">
                  Active
                </option>


                <option value="pending">
                  Pending
                </option>


                <option value="inactive">
                  Inactive
                </option>


              </select>


            </div>




            <textarea

              name="description"

              placeholder="Team Description"

              value={form.description}

              onChange={handleChange}

            />




            <button className="create-btn">

              {
                saving
                ?
                "CREATING..."
                :
                "CREATE TEAM →"
              }

            </button>



          </form>


        </section>







        <section className="panel">


          <h2>
            YOUR TEAMS
          </h2>





          {
            loading ?

            <p className="loading">
              Loading...
            </p>



            :

            teams.length === 0 ?

            <p className="empty">
              No team created yet.
            </p>



            :



            <div className="team-list">



              {

                teams.map((team)=>(


                  <div
                    className="team-card"
                    key={team.id}
                  >



                    <div className="team-left">



                      <div className="team-logo">


                        {

                          team.logo ?

                          <img
                            src={team.logo}
                            alt={team.team_name}
                          />


                          :


                          <span>
                            OP
                          </span>


                        }


                      </div>





                      <div className="team-info">


                        <h3>
                          {team.team_name}
                        </h3>




                        <p>
                          Coach:
                          <span>
                            {team.coach_name || "N/A"}
                          </span>
                        </p>




                        <p>
                          Manager:
                          <span>
                            {team.manager_name || "N/A"}
                          </span>
                        </p>




                        <p>
                          Country:
                          <span>
                            {team.country || "N/A"}
                          </span>
                        </p>



                      </div>



                    </div>






                    <div className="team-right">



                      <div className="status">

                        ● {team.status}

                      </div>




                      <button

                        className="manage-btn"

                        onClick={()=>{

                          window.location.href =
                          `/admin/teams/${team.id}`;

                        }}

                      >

                        MANAGE PLAYERS →

                      </button>



                    </div>





                  </div>


                ))

              }



            </div>


          }





        </section>
      </div>



      <style jsx>{`

      .page{

        min-height:100vh;

        background:
        radial-gradient(
          circle at top left,
          rgba(255,0,70,.18),
          transparent 35%
        ),
        radial-gradient(
          circle at bottom right,
          rgba(100,0,255,.18),
          transparent 35%
        ),
        #050505;

        color:white;

        padding:40px 20px;

        position:relative;

        overflow:hidden;

      }



      .container{

        max-width:1200px;

        margin:auto;

        position:relative;

        z-index:2;

      }




      .header{

        text-align:center;

        margin-bottom:40px;

      }




      .header span{

        color:#ff174d;

        font-size:12px;

        letter-spacing:5px;

        font-weight:900;

      }




      .header h1{

        font-size:48px;

        margin:15px 0;

        text-shadow:

        0 0 25px rgba(255,0,70,.5);

      }




      .header p{

        color:#999;

        font-size:16px;

      }






      .panel{

        margin-top:25px;

        padding:30px;

        border-radius:30px;


        background:

        rgba(15,15,20,.75);


        border:

        1px solid rgba(255,0,70,.25);


        backdrop-filter:blur(15px);


        box-shadow:

        0 20px 60px rgba(0,0,0,.5);


      }






      h2{

        margin-bottom:25px;

        font-size:22px;

      }







      .grid{

        display:grid;

        grid-template-columns:

        repeat(3,1fr);

        gap:15px;

      }






      input,
      select,
      textarea{


        width:100%;


        background:#08080d;


        border:

        1px solid rgba(255,255,255,.15);


        color:white;


        padding:15px;


        border-radius:14px;


        outline:none;


        font-size:15px;


      }





      input:focus,
      select:focus,
      textarea:focus{

        border-color:#ff174d;

        box-shadow:

        0 0 20px rgba(255,0,70,.25);

      }







      textarea{

        margin-top:15px;

        min-height:120px;

        resize:none;

      }







      .create-btn,
      .manage-btn{


        border:none;


        color:white;


        font-weight:900;


        cursor:pointer;


        background:

        linear-gradient(
          135deg,
          #ff174d,
          #7000ff
        );


        transition:.3s;


        box-shadow:

        0 0 25px rgba(255,0,80,.35);


      }




      .create-btn{


        width:100%;


        margin-top:20px;


        padding:16px;


        border-radius:30px;


      }






      .create-btn:hover,
      .manage-btn:hover{


        transform:

        translateY(-3px);


        box-shadow:

        0 0 45px rgba(255,0,80,.6);

      }







      .team-list{

        display:flex;

        flex-direction:column;

        gap:20px;

      }







      .team-card{


        display:flex;


        align-items:center;


        justify-content:space-between;


        gap:25px;


        padding:22px;


        border-radius:25px;


        background:

        linear-gradient(
          135deg,
          rgba(255,255,255,.06),
          rgba(255,255,255,.02)
        );


        border:

        1px solid rgba(255,0,70,.25);


        transition:.35s;


      }






      .team-card:hover{


        transform:

        translateY(-5px);


        border-color:#ff174d;


        box-shadow:

        0 0 35px rgba(255,0,70,.3);


      }






      .team-left{


        display:flex;

        align-items:center;

        gap:20px;


      }






      .team-logo{


        width:80px;

        height:80px;


        border-radius:22px;


        overflow:hidden;


        display:flex;


        align-items:center;


        justify-content:center;


        background:

        linear-gradient(
          135deg,
          #ff174d,
          #7000ff
        );


        font-size:30px;


        font-weight:900;


        box-shadow:

        0 0 30px rgba(255,0,80,.45);


      }






      .team-logo img{


        width:100%;


        height:100%;


        object-fit:cover;


      }






      .team-info h3{


        margin:0 0 10px;


        color:#ff315d;


        font-size:24px;


      }






      .team-info p{


        margin:5px 0;


        color:#aaa;


      }






      .team-info span{


        color:#45ff9a;


        margin-left:5px;


      }






      .team-right{


        display:flex;


        align-items:center;


        gap:20px;


      }






      .status{


        color:#45ff9a;


        font-weight:900;


        font-size:13px;


        text-transform:uppercase;


      }






      .manage-btn{


        padding:14px 25px;


        border-radius:30px;


        white-space:nowrap;


      }






      .glow{


        position:fixed;


        width:350px;


        height:350px;


        filter:blur(140px);


        opacity:.35;


      }






      .glow-one{


        background:red;


        top:-100px;


        left:-100px;


      }






      .glow-two{


        background:blue;


        bottom:-100px;


        right:-100px;


      }






      .glow-three{


        background:#ff00aa;


        top:40%;


        left:40%;


      }






      @media(max-width:900px){


        .grid{


          grid-template-columns:1fr;

        }




        .team-card{


          flex-direction:column;

          align-items:stretch;

        }




        .team-right{


          flex-direction:column;

        }




        .manage-btn{


          width:100%;

        }


      }






      @media(max-width:600px){


        .header h1{

          font-size:32px;

        }



        .panel{

          padding:20px;

        }



        .team-left{

          flex-direction:column;

          align-items:flex-start;

        }


      }


      `}</style>



    </main>

  );


}
