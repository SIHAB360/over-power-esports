"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";


export default function TournamentsPage() {


  const [tournaments, setTournaments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);



  const [form, setForm] = useState({

    name: "",
    banner: "",
    description: "",
    prize_pool: "",
    entry_fee: "",
    start_date: "",
    end_date: "",
    registration_deadline: "",
    max_teams: 30,
    status: "upcoming",

  });





  useEffect(() => {

    loadTournaments();

  }, []);







  async function loadTournaments() {


    const { data, error } = await supabase

      .from("tournaments")

      .select("*")

      .order("created_at", {
        ascending:false
      });




    if(error){

      console.log(error);

      return;

    }




    setTournaments(data || []);

    setLoading(false);



  }







  function handleChange(e){


    const {name,value}=e.target;


    setForm((prev)=>({

      ...prev,

      [name]:value

    }));


  }







  async function createTournament(e){


    e.preventDefault();




    if(!form.name){

      alert("Tournament name required");

      return;

    }




    setSaving(true);





    const {error}=await supabase

      .from("tournaments")

      .insert([

        {

          ...form,

          prize_pool:Number(form.prize_pool),

          entry_fee:Number(form.entry_fee),

          max_teams:Number(form.max_teams)

        }

      ]);





    if(error){

      alert(error.message);

      setSaving(false);

      return;

    }





    alert("Tournament Created Successfully");





    setForm({

      name:"",
      banner:"",
      description:"",
      prize_pool:"",
      entry_fee:"",
      start_date:"",
      end_date:"",
      registration_deadline:"",
      max_teams:30,
      status:"upcoming",

    });




    loadTournaments();


    setSaving(false);



  }






  return (

    <main className="page">


      <div className="glow glow-one"></div>

      <div className="glow glow-two"></div>



      <div className="container">


        <header className="header">


          <span>
            OVER POWER ESPORTS
          </span>


          <h1>
            TOURNAMENT MANAGEMENT
          </h1>


          <p>
            Create and manage esports tournaments
          </p>


        </header>
          <section className="panel">


          <h2>
            CREATE TOURNAMENT
          </h2>




          <form onSubmit={createTournament}>



            <div className="grid">


              <input
                name="name"
                placeholder="Tournament Name"
                value={form.name}
                onChange={handleChange}
              />



              <input
                name="banner"
                placeholder="Banner URL"
                value={form.banner}
                onChange={handleChange}
              />



              <input
                name="prize_pool"
                placeholder="Prize Pool"
                type="number"
                value={form.prize_pool}
                onChange={handleChange}
              />



              <input
                name="entry_fee"
                placeholder="Entry Fee"
                type="number"
                value={form.entry_fee}
                onChange={handleChange}
              />



              <input
                name="start_date"
                type="date"
                value={form.start_date}
                onChange={handleChange}
              />



              <input
                name="end_date"
                type="date"
                value={form.end_date}
                onChange={handleChange}
              />



              <input
                name="registration_deadline"
                type="date"
                value={form.registration_deadline}
                onChange={handleChange}
              />



              <input
                name="max_teams"
                type="number"
                placeholder="Maximum Teams"
                value={form.max_teams}
                onChange={handleChange}
              />



              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >

                <option value="upcoming">
                  Upcoming
                </option>


                <option value="ongoing">
                  Ongoing
                </option>


                <option value="completed">
                  Completed
                </option>


              </select>



            </div>





            <textarea

              name="description"

              placeholder="Tournament Description"

              value={form.description}

              onChange={handleChange}

            />






            <button className="create-btn">


              {

                saving

                ?

                "CREATING..."

                :

                "CREATE TOURNAMENT →"

              }


            </button>





          </form>




        </section>









        <section className="panel">


          <h2>
            TOURNAMENT HISTORY
          </h2>





          {

            loading ?


            <p>
              Loading tournaments...
            </p>





            :



            tournaments.length === 0 ?


            <p>
              No tournament created yet.
            </p>





            :





            <div className="tournament-list">





              {


                tournaments.map((tournament)=>(



                  <div

                    className="tournament-card"

                    key={tournament.id}

                  >




                    <div className="tournament-left">





                      <div className="banner">



                        {

                          tournament.banner ?

                          <img

                            src={tournament.banner}

                            alt={tournament.name}

                          />

                          :

                          <span>
                            OP
                          </span>


                        }



                      </div>





                      <div className="tournament-info">



                        <h3>
                          {tournament.name}
                        </h3>




                        <p>
                          Prize Pool:

                          <span>
                            ৳{tournament.prize_pool || 0}
                          </span>

                        </p>





                        <p>
                          Entry Fee:

                          <span>
                            ৳{tournament.entry_fee || 0}
                          </span>

                        </p>





                        <p>

                          Status:

                          <span>
                            {tournament.status}
                          </span>

                        </p>




                      </div>






                    </div>





                    <div className="date-box">


                      <p>
                        Start
                      </p>


                                         <strong>
                      {tournament.start_date || "N/A"}
                    </strong>


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
rgba(90,0,255,.18),
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


font-size:45px;

margin:15px 0;


text-shadow:

0 0 25px rgba(255,0,80,.5);


}





.header p{

color:#999;

}






.panel{


margin-top:25px;


padding:30px;


border-radius:30px;


background:

rgba(15,15,20,.75);


border:

1px solid rgba(255,0,80,.3);



backdrop-filter:blur(15px);



box-shadow:

0 20px 60px rgba(0,0,0,.5);


}






h2{

font-size:22px;

margin-bottom:25px;

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



padding:15px;


border-radius:14px;


color:white;


outline:none;


}







input:focus,
select:focus,
textarea:focus{


border-color:#ff174d;


box-shadow:

0 0 20px rgba(255,0,80,.3);


}






textarea{


margin-top:15px;


min-height:120px;


resize:none;


}






.create-btn{


width:100%;


margin-top:20px;


padding:16px;


border:none;


border-radius:30px;



background:

linear-gradient(
135deg,
#ff174d,
#7000ff
);



color:white;


font-weight:900;


cursor:pointer;



box-shadow:

0 0 30px rgba(255,0,80,.4);


transition:.3s;


}






.create-btn:hover{


transform:translateY(-3px);


box-shadow:

0 0 45px rgba(255,0,80,.7);


}







.tournament-list{


display:flex;


flex-direction:column;


gap:20px;


}






.tournament-card{


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

1px solid rgba(255,0,80,.25);



transition:.3s;


}





.tournament-card:hover{


transform:translateY(-5px);


box-shadow:

0 0 35px rgba(255,0,80,.3);


}





.tournament-left{


display:flex;


align-items:center;


gap:20px;


}





.banner{


width:90px;


height:90px;


border-radius:20px;


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


}




.banner img{


width:100%;


height:100%;


object-fit:cover;


}






.tournament-info h3{


margin:0 0 12px;


font-size:24px;


color:#ff315d;


}






.tournament-info p{


margin:6px 0;


color:#aaa;


}






.tournament-info span{


color:#45ff9a;


margin-left:5px;


}





.date-box{


background:

rgba(255,255,255,.05);


padding:15px 25px;


border-radius:18px;


text-align:center;


border:

1px solid rgba(255,255,255,.1);


}





.date-box p{


margin:0;


color:#999;


font-size:12px;


}





.date-box strong{


color:#fff;


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


right:-100px;


bottom:-100px;


}







@media(max-width:900px){


.grid{


grid-template-columns:1fr;


}



.tournament-card{


flex-direction:column;


align-items:stretch;


}



.date-box{


width:100%;


}


}






@media(max-width:600px){


.header h1{


font-size:30px;


}



.panel{


padding:20px;


}



.tournament-left{


flex-direction:column;


align-items:flex-start;


}



}




`}</style>


    </main>

  );


}
