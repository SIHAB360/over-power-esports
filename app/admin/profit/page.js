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

<main style={{
  minHeight:"100vh",
  background:"linear-gradient(#400000,#000)",
  padding:"30px",
  color:"white"
}}>


<h1 style={{
  textAlign:"center",
  fontSize:"40px",
  fontWeight:"bold",
  marginBottom:"30px"
}}>
PROFIT MANAGEMENT
</h1>



<div style={{
 display:"flex",
 gap:"20px",
 marginBottom:"30px"
}}>


<div style={{
 flex:1,
 background:"#7f1d1d",
 padding:"20px",
 borderRadius:"15px"
}}>
<h3>Total Profit</h3>
<h2>
৳{
financeData.reduce(
(sum,item)=>sum+Number(item.profit||0),0
).toFixed(2)
}
</h2>
</div>



<div style={{
 flex:1,
 background:"#14532d",
 padding:"20px",
 borderRadius:"15px"
}}>
<h3>Player Share</h3>
<h2>
৳{
financeData.reduce(
(sum,item)=>sum+Number(item.player_amount||0),0
).toFixed(2)
}
</h2>
</div>



<div style={{
 flex:1,
 background:"#1e3a8a",
 padding:"20px",
 borderRadius:"15px"
}}>
<h3>Management Share</h3>
<h2>
৳{
financeData.reduce(
(sum,item)=>sum+Number(item.management_amount||0),0
).toFixed(2)
}
</h2>
</div>


</div>





<h2>
Financial History
</h2>



{
financeData.map((item)=>(

<div
key={item.id}
style={{
background:"#111",
border:"1px solid #555",
borderRadius:"15px",
padding:"20px",
marginTop:"20px"
}}
>


<p>📅 Date: {new Date(item.created_at).toLocaleDateString()}</p>

<p>
🏆 Tournament:
{item.matches?.tournament_id || "N/A"}
</p>

<p>
🎮 Match Type:
{item.matches?.match_type || "N/A"}
</p>


<p>
👥 Team:
{item.teams?.team_name || "N/A"}
</p>


<hr/>


<p>
💰 Entry Fee: ৳{item.entry_fee}
</p>

<p>
🏆 Prize Money: ৳{item.prize_money}
</p>

<p style={{color:"#facc15"}}>
📈 Net Profit: ৳{item.profit}
</p>


<p style={{color:"#22c55e"}}>
👤 Player 70%:
৳{Number(item.player_amount||0).toFixed(2)}
</p>


<p style={{color:"#60a5fa"}}>
🏢 Management 30%:
৳{Number(item.management_amount||0).toFixed(2)}
</p>


</div>

))
}



</main>

);
