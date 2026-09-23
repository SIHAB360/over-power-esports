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
      console.log("PROFIT FETCH ERROR:", error);
      setLoading(false);
      return;
    }


    console.log("PROFIT FETCH DATA:", data);


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
        Match ID: {item.match_id}
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

      <hr/>

    </div>

  ))
}


      </section>


    </main>

  );
}
