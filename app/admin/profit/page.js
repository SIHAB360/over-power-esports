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
      .select(`
        *,
        matches!match_finance_match_id_fkey (
          id,
          tournament_id,
          match_type,
          created_at
        ),
        teams!match_finance_team_id_fkey (
          id,
          team_name
        )
      `)
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
    console.log(
      "FIRST ITEM:",
      JSON.stringify(data?.[0], null, 2)
    );


    setFinanceData(data || []);
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
                Match Type: {
                  item.matches?.match_type || "N/A"
                }
              </p>


              <p>
                Team: {
                  item.teams?.team_name || "N/A"
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
                Player 70%: ৳{
                  Number(item.player_amount).toFixed(2)
                }
              </p>


              <p>
                Management 30%: ৳{
                  Number(item.management_amount).toFixed(2)
                }
              </p>


              <hr/>


            </div>

          ))
        }


      </section>


    </main>

  );

}
