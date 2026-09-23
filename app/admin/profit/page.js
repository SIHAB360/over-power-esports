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
  *
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
  "FIRST ITEM JSON:",
  JSON.stringify(data[0], null, 2)
);
    console.log("FINANCE COUNT:", data?.length);


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
