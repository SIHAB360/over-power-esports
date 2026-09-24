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
      .order("created_at", {
        ascending:false
      });


    if(error){

      console.log(
        "PROFIT FETCH ERROR:",
        error
      );

      setLoading(false);
      return;
    }


    setFinanceData(data || []);
    setLoading(false);

  };



  if(loading){

    return (
      <div className="p-10 text-xl">
        Loading Profit Data...
      </div>
    );

  }



  const totalProfit = financeData.reduce(
    (sum,item)=> sum + Number(item.profit || 0),
    0
  );


  const totalPlayer = financeData.reduce(
    (sum,item)=> sum + Number(item.player_amount || 0),
    0
  );


  const totalManagement = financeData.reduce(
    (sum,item)=> sum + Number(item.management_amount || 0),
    0
  );



  return (

    <main className="min-h-screen bg-gradient-to-b from-red-950 to-black p-6 text-white">


      <h1 className="text-4xl font-bold text-center mb-8">
        PROFIT MANAGEMENT
      </h1>



      <div className="grid md:grid-cols-3 gap-5 mb-8">


        <div className="bg-red-900 rounded-xl p-5">
          <h3>Total Profit</h3>
          <p className="text-3xl font-bold">
            ৳{totalProfit.toFixed(2)}
          </p>
        </div>



        <div className="bg-green-900 rounded-xl p-5">
          <h3>Player Share (70%)</h3>
          <p className="text-3xl font-bold">
            ৳{totalPlayer.toFixed(2)}
          </p>
        </div>



        <div className="bg-blue-900 rounded-xl p-5">
          <h3>Management (30%)</h3>
          <p className="text-3xl font-bold">
            ৳{totalManagement.toFixed(2)}
          </p>
        </div>


      </div>




      <h2 className="text-2xl font-bold mb-5">
        Financial History
      </h2>





      <div className="space-y-5">


      {
        financeData.map((item)=>(


          <div
          key={item.id}
          className="bg-black/40 border border-gray-700 rounded-xl p-6"
          >


            <div className="grid md:grid-cols-2 gap-3">


              <p>
                📅 Date:
                {" "}
                {
                  new Date(
                    item.created_at
                  ).toLocaleDateString()
                }
              </p>


              <p>
                🏆 Tournament:
                {" "}
                {
                  item.matches?.tournament_id || "N/A"
                }
              </p>


              <p>
                🎮 Match Type:
                {" "}
                {
                  item.matches?.match_type || "N/A"
                }
              </p>


              <p>
                👥 Team:
                {" "}
                {
                  item.teams?.team_name || "N/A"
                }
              </p>


            </div>



            <hr className="my-4 border-gray-600"/>



            <div className="grid md:grid-cols-2 gap-3">


              <p>
                💰 Entry Fee:
                {" "}
                ৳{item.entry_fee}
              </p>


              <p>
                🏆 Prize Money:
                {" "}
                ৳{item.prize_money}
              </p>


              <p className="text-yellow-400 font-bold">
                📈 Net Profit:
                {" "}
                ৳{item.profit}
              </p>


              <p className="text-green-400">
                👤 Player 70%:
                {" "}
                ৳{Number(item.player_amount || 0).toFixed(2)}
              </p>


              <p className="text-blue-400">
                🏢 Management 30%:
                {" "}
                ৳{Number(item.management_amount || 0).toFixed(2)}
              </p>


            </div>



          </div>


        ))
      }


      </div>



    </main>

  );

}
