"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ProfitPage() {

  const [financeData, setFinanceData] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchFinance();
  }, []);


  const fetchFinance = async () => {

    const { data, error } = await supabase
      .from("match_finance")
      .select("*")
      .order("created_at", { ascending: false });


    if(error){

      console.log(
        "PROFIT FETCH ERROR:",
        JSON.stringify(error, null, 2)
      );

      setLoading(false);

      return;
    }


    console.log("PROFIT FETCH DATA:", data);
    console.log("FINANCE COUNT:", data?.length);


    const matchIds = data.map(item => item.match_id);
    const teamIds = data.map(item => item.team_id);


    const { data: matchesData } = await supabase
  .from("matches")
  .select("*")
  .in("id", matchIds);


const { data: teamsData } = await supabase
  .from("teams")
  .select("*")
  .in("id", teamIds);


    const finalData = data.map(item => ({

      ...item,

      matches: matchesData?.find(
        match => match.id === item.match_id
      ),

      teams: teamsData?.find(
        team => team.id === item.team_id
      )

    }));


    console.log("FINAL FINANCE DATA:", finalData);


    setFinanceData(finalData);

    setLoading(false);

  };


  if(loading){

    return (
      <div>
        Loading Profit Data...
      </div>
    );

  }


  return (

    <main>

      <h1>
        PROFIT MANAGEMENT
      </h1>


      <section>

        <h2>
          Financial History
        </h2>


        {
          financeData.map((item)=>(

            <div key={item.id}>


              <p>
                Date: {
                  item.created_at
                  ? new Date(item.created_at).toLocaleDateString()
                  : "N/A"
                }
              </p>


              <p>
                Tournament: {
                  item.matches?.tournament || "N/A"
                }
              </p>


              <p>
                Team: {
                  item.teams?.name || "N/A"
                }
              </p>


              <p>
                Entry Fee: ৳{item.entry_fee}
              </p>


              <p>
                Prize Money: ৳{item.prize_money}
              </p>


              <p>
                Net Profit: ৳{item.profit}
              </p>


              <p>
                Player 70%: ৳{item.player_amount}
              </p>


              <p>
                Management 30%: ৳{item.management_amount}
              </p>


              <hr />


            </div>

          ))
        }


      </section>


    </main>

  );

}
