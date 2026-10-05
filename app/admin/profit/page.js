"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";


/* =========================================================
   PREMIUM DASHBOARD STYLES
========================================================= */


const inputStyle = {

  flex: "1 1 190px",

  minWidth: "180px",

  height: "48px",

  padding: "0 16px",

  borderRadius: "14px",

  border:
    "1px solid rgba(255,255,255,0.14)",

  background:
    "rgba(10,10,18,0.85)",

  color:"#ffffff",

  outline:"none",

  fontSize:"14px",

};



const selectStyle = {

  ...inputStyle,

  cursor:"pointer",

};




function money(value){

  const amount =
    Number(value || 0);


  return `৳${amount.toLocaleString(
    "en-BD",
    {
      minimumFractionDigits:2,
      maximumFractionDigits:2,
    }
  )}`;

}




/* =========================================================
   SUMMARY CARD
========================================================= */


function SummaryCard({
  title,
  value,
  color,
  icon,
}){


return (

<div
style={{

position:"relative",

overflow:"hidden",

padding:"26px",

borderRadius:"22px",

minHeight:"145px",

background:
"linear-gradient(145deg,rgba(255,255,255,.08),rgba(255,255,255,.025))",

border:
`1px solid ${color}66`,

backdropFilter:
"blur(18px)",

boxShadow:

`
0 0 25px ${color}22,
inset 0 0 20px rgba(255,255,255,.04)
`

}}

>



<div
style={{

position:"absolute",

width:"120px",

height:"120px",

right:"-40px",

top:"-40px",

background:color,

filter:"blur(70px)",

opacity:.35,

}}

></div>



<div
style={{

fontSize:"14px",

fontWeight:700,

color,

letterSpacing:"1px",

textTransform:"uppercase",

marginBottom:"14px",

}}

>

{icon} {title}

</div>




<div
style={{

fontSize:"34px",

fontWeight:900,

color:"#ffffff",

textShadow:
`0 0 18px ${color}88`

}}

>

{money(value)}

</div>



</div>

);


}






/* =========================================================
   MAIN COMPONENT
========================================================= */


export default function ProfitPage(){



const [financeData,setFinanceData]
=
useState([]);



const [loading,setLoading]
=
useState(true);



const [errorMessage,setErrorMessage]
=
useState("");



const [selectedTeam,setSelectedTeam]
=
useState("");



const [selectedTournament,setSelectedTournament]
=
useState("");



const [selectedMonth,setSelectedMonth]
=
useState("");



const [selectedMatchType,setSelectedMatchType]
=
useState("");



const [selectedProfitStatus,setSelectedProfitStatus]
=
useState("");



const [playerStatsMap,setPlayerStatsMap]
=
useState({});



const [openPerformance,setOpenPerformance]
=
useState(null);



const [loadingStats,setLoadingStats]
=
useState(null);






useEffect(()=>{

fetchFinance();

},[]);






async function fetchFinance(){


setLoading(true);

setErrorMessage("");



const {

data,

error

}

=

await supabase

.from("match_finance")

.select(

`

*,

matches!match_finance_match_id_fkey (

id,

tournament_id,

match_type,

created_at,

tournaments (

id,

name

)

),


teams!match_finance_team_id_fkey (

id,

team_name

)

`

)

.order(
"created_at",
{
ascending:false
}
);



if(error){


console.error(
"PROFIT FETCH ERROR:",
error
);


setFinanceData([]);

setErrorMessage(
error.message ||
"Profit data load failed."
);


setLoading(false);

return;


}



setFinanceData(
data || []
);


setLoading(false);



}






async function fetchPlayerStats(matchId){


if(!matchId)
return;



if(
Object.prototype.hasOwnProperty.call(
playerStatsMap,
matchId
)
){

return;

}




setLoadingStats(matchId);




const {

data:stats,

error

}

=

await supabase

.from("match_player_stats")

.select(

`

id,

match_id,

player_id,

kills,

assists,

damage,

mvp,

placement,

players (

ign,

full_name

)

`

)

.eq(
"match_id",
matchId
);



if(error){


console.error(
"PLAYER STATS ERROR:",
error
);



setPlayerStatsMap(
prev=>({

...prev,

[matchId]:[]

})
);


}

else{


setPlayerStatsMap(
prev=>({

...prev,

[matchId]:
stats || []

})
);


}



setLoadingStats(null);



}






function handleTogglePerformance(item){


const matchId =
item.match_id ||
item.matches?.id;



if(openPerformance === item.id){


setOpenPerformance(null);

return;


}



setOpenPerformance(item.id);


fetchPlayerStats(matchId);



}
// =========================================================
// FILTER OPTIONS
// =========================================================


const teamOptions = [
  ...new Set(
    financeData
      .map(
        item =>
          item.teams?.team_name
      )
      .filter(Boolean)
  ),
];



const tournamentOptions = [
  ...new Set(
    financeData
      .map(
        item =>
          item.matches
          ?.tournaments
          ?.name
      )
      .filter(Boolean)
  ),
];



const matchTypeOptions = [
  ...new Set(
    financeData
      .map(
        item =>
          item.matches
          ?.match_type
      )
      .filter(Boolean)
  ),
];





const filteredData =
financeData.filter(
(item)=>{


if(
selectedTeam &&
item.teams?.team_name !== selectedTeam
){

return false;

}



if(
selectedTournament &&
item.matches?.tournaments?.name !== selectedTournament
){

return false;

}



if(
selectedMatchType &&
item.matches?.match_type !== selectedMatchType
){

return false;

}




if(selectedProfitStatus){

const profit =
Number(item.profit || 0);



if(
selectedProfitStatus==="profit"
&&
profit<=0
){

return false;

}



if(
selectedProfitStatus==="loss"
&&
profit>=0
){

return false;

}



if(
selectedProfitStatus==="break_even"
&&
profit!==0
){

return false;

}


}




if(selectedMonth){


const date =
item.created_at
?
new Date(item.created_at)
:
null;



if(
!date ||
Number.isNaN(date.getTime())
){

return false;

}



const month =
`${date.getFullYear()}-${String(
date.getMonth()+1
).padStart(2,"0")}`;



if(month !== selectedMonth){

return false;

}


}



return true;


}

);






const totalProfit =
filteredData.reduce(
(sum,item)=>
sum + Number(item.profit || 0),
0
);



const totalPlayer =
filteredData.reduce(
(sum,item)=>
sum + Number(item.player_amount || 0),
0
);



const totalManagement =
filteredData.reduce(
(sum,item)=>
sum + Number(item.management_amount || 0),
0
);






function clearFilters(){


setSelectedTeam("");

setSelectedTournament("");

setSelectedMonth("");

setSelectedMatchType("");

setSelectedProfitStatus("");


}






if(loading){


return (

<div

style={{

minHeight:"100vh",

display:"flex",

alignItems:"center",

justifyContent:"center",

background:

"radial-gradient(circle at top,#450a0a,#050505)",

color:"#fbbf24",

fontSize:"28px",

fontWeight:800

}}

>

Loading Profit Dashboard...

</div>

);


}






return (

<main

style={{

minHeight:"100vh",

padding:"50px 20px 100px",

color:"#fff",

fontFamily:
"'Segoe UI',sans-serif",

background:

`

radial-gradient(
circle at 10% 10%,
rgba(255,0,0,.18),
transparent 30%
),

radial-gradient(
circle at 90% 20%,
rgba(59,130,246,.15),
transparent 35%
),

linear-gradient(
160deg,
#120000,
#050505 55%,
#090914
)

`,

position:"relative",

overflow:"hidden"

}}

>



<div

style={{

position:"absolute",

inset:0,

backgroundImage:

`

linear-gradient(
rgba(255,255,255,.025) 1px,
transparent 1px
),

linear-gradient(
90deg,
rgba(255,255,255,.025) 1px,
transparent 1px
)

`,

backgroundSize:"40px 40px",

pointerEvents:"none",

opacity:.25

}}

></div>







<h1

style={{

position:"relative",

textAlign:"center",

fontSize:
"clamp(36px,5vw,56px)",

fontWeight:1000,

letterSpacing:"3px",

marginBottom:"45px",

background:

"linear-gradient(90deg,#fbbf24,#f472b6,#60a5fa,#34d399)",

WebkitBackgroundClip:"text",

WebkitTextFillColor:"transparent",

textShadow:
"0 0 30px rgba(251,191,36,.35)"

}}

>

💰 PROFIT MANAGEMENT

</h1>






{errorMessage && (

<div

style={{

maxWidth:"1000px",

margin:"0 auto 30px",

padding:"18px",

borderRadius:"16px",

background:
"rgba(127,29,29,.35)",

border:
"1px solid rgba(248,113,113,.5)",

color:"#fecaca"

}}

>

<strong>
Data Load Error:
</strong>

{" "}

{errorMessage}

</div>

)}







{/* SUMMARY CARDS */}



<div

style={{

maxWidth:"1200px",

margin:"0 auto 45px",

display:"grid",

gridTemplateColumns:

"repeat(auto-fit,minmax(280px,1fr))",

gap:"25px",

position:"relative"

}}

>



<SummaryCard

title="Total Profit"

value={totalProfit}

color="#fbbf24"

icon="💰"

/>




<SummaryCard

title="Player Share 70%"

value={totalPlayer}

color="#34d399"

icon="👥"

/>




<SummaryCard

title="Management Share 30%"

value={totalManagement}

color="#60a5fa"

icon="🏢"

/>



</div>








{/* FILTER BOX */}



<div

style={{

maxWidth:"1000px",

margin:"0 auto 45px",

padding:"25px",

borderRadius:"24px",

background:

"rgba(255,255,255,.05)",

border:

"1px solid rgba(255,255,255,.12)",

backdropFilter:"blur(20px)",

boxShadow:

"0 20px 50px rgba(0,0,0,.35)"

}}

>



<h3

style={{

color:"#fbbf24",

marginBottom:"18px",

fontSize:"16px",

letterSpacing:"1px"

}}

>

🔎 FILTER FINANCIAL RECORDS

</h3>





<div

style={{

display:"flex",

gap:"14px",

flexWrap:"wrap"

}}

>


<input

type="month"

value={selectedMonth}

onChange={
e=>setSelectedMonth(e.target.value)
}

style={inputStyle}

/>





<select

value={selectedTeam}

onChange={
e=>setSelectedTeam(e.target.value)
}

style={selectStyle}

>

<option value="">
All Teams
</option>


{
teamOptions.map(team=>(

<option

key={team}

value={team}

>

{team}

</option>

))

}

</select>





<select

value={selectedTournament}

onChange={
e=>setSelectedTournament(e.target.value)
}

style={selectStyle}

>

<option value="">
All Tournaments
</option>


{
tournamentOptions.map(item=>(

<option

key={item}

value={item}

>

{item}

</option>

))

}


</select>





<select

value={selectedMatchType}

onChange={
e=>setSelectedMatchType(e.target.value)
}

style={selectStyle}

>

<option value="">
All Match Types
</option>


{
matchTypeOptions.map(item=>(

<option

key={item}

value={item}

>

{item}

</option>

))

}


</select>





<select

value={selectedProfitStatus}

onChange={
e=>setSelectedProfitStatus(e.target.value)
}

style={selectStyle}

>

<option value="">
All Profit Status
</option>


<option value="profit">
🟢 Profit
</option>


<option value="loss">
🔴 Loss
</option>


<option value="break_even">
⚪ Break Even
</option>


</select>




</div>


</div>
{/* =========================================================
      FINANCIAL HISTORY
========================================================= */}


<div

style={{

maxWidth:"1200px",

margin:"0 auto",

position:"relative"

}}

>



<h2

style={{

fontSize:"32px",

fontWeight:900,

marginBottom:"30px",

letterSpacing:"2px",

color:"#ffffff",

textAlign:"center"

}}

>

📊 FINANCIAL HISTORY

</h2>





{
filteredData.length === 0 ? (


<div

style={{

padding:"50px",

textAlign:"center",

borderRadius:"22px",

background:
"rgba(255,255,255,.05)",

border:
"1px solid rgba(255,255,255,.1)",

color:"#aaa"

}}

>

No financial records found.

</div>


)

:

(


<div

style={{

display:"grid",

gap:"25px"

}}

>



{

filteredData.map(
(item)=>{


const matchId =
item.match_id ||
item.matches?.id;



const profit =
Number(item.profit || 0);



return (


<div

key={item.id}

style={{

borderRadius:"26px",

padding:"30px",

background:

`

linear-gradient(
145deg,
rgba(255,255,255,.08),
rgba(255,255,255,.025)
)

`,

border:

`

1px solid

${profit >=0

?

"rgba(52,211,153,.35)"

:

"rgba(248,113,113,.35)"

}

`,

boxShadow:

profit >=0

?

"0 0 35px rgba(52,211,153,.12)"

:

"0 0 35px rgba(248,113,113,.12)",


backdropFilter:
"blur(18px)"

}}

>



<div

style={{

display:"flex",

justifyContent:"space-between",

gap:"20px",

flexWrap:"wrap",

marginBottom:"25px"

}}

>


<div>

<div

style={{

color:"#94a3b8",

fontSize:"13px",

letterSpacing:"1px"

}}

>

TOURNAMENT

</div>


<h3

style={{

margin:"8px 0",

fontSize:"24px"

}}

>

{
item.matches
?.tournaments
?.name ||

"N/A"

}

</h3>


</div>





<div

style={{

textAlign:"right"

}}

>

<div

style={{

color:"#94a3b8",

fontSize:"13px"

}}

>

DATE

</div>


<strong>

{
new Date(
item.created_at
)
.toLocaleDateString()
}

</strong>


</div>


</div>








<div

style={{

display:"grid",

gridTemplateColumns:

"repeat(auto-fit,minmax(180px,1fr))",

gap:"15px"

}}

>



<div className="finance-mini-card">

<span>
TEAM
</span>

<strong>

{
item.teams?.team_name ||
"N/A"
}

</strong>

</div>




<div className="finance-mini-card">

<span>
ENTRY FEE
</span>

<strong>

{money(item.entry_fee)}

</strong>

</div>




<div className="finance-mini-card">

<span>
PRIZE MONEY
</span>

<strong>

{money(item.prize_money)}

</strong>

</div>




<div className="finance-mini-card">

<span>
NET PROFIT
</span>


<strong

style={{

color:

profit>=0

?

"#34d399"

:

"#f87171"

}}

>

{money(profit)}

</strong>


</div>



</div>








<div

style={{

marginTop:"25px",

paddingTop:"25px",

borderTop:

"1px solid rgba(255,255,255,.1)",

display:"flex",

justifyContent:"space-between",

flexWrap:"wrap",

gap:"20px"

}}

>


<div>

<span
style={{
color:"#94a3b8"
}}
>
PLAYER SHARE
</span>


<h3
style={{
color:"#34d399"
}}
>

{money(item.player_amount)}

</h3>


</div>




<div>

<span
style={{
color:"#94a3b8"
}}
>
MANAGEMENT SHARE
</span>


<h3
style={{
color:"#60a5fa"
}}
>

{money(item.management_amount)}

</h3>


</div>



<button

onClick={()=>handleTogglePerformance(item)}

style={{

padding:"12px 24px",

borderRadius:"14px",

border:"1px solid #fbbf24",

background:"transparent",

color:"#fbbf24",

cursor:"pointer",

fontWeight:800

}}

>


{
openPerformance===item.id

?

"Hide Performance"

:

"View Performance"

}


</button>


</div>








{
openPerformance===item.id && (


<div

style={{

marginTop:"25px",

padding:"20px",

borderRadius:"18px",

background:"rgba(0,0,0,.35)"

}}

>


<h3>
  🎮 PLAYER PERFORMANCE
</h3>


{

loadingStats === matchId ? (

<p>
  Loading player stats...
</p>

)

:

(

playerStatsMap[matchId]?.length > 0 ? (

<div

style={{

display:"grid",

gridTemplateColumns:
"repeat(auto-fit,minmax(220px,1fr))",

gap:"15px"

}}

>

{

playerStatsMap[matchId].map(

(player)=>(


<div

key={player.id}

style={{

padding:"18px",

borderRadius:"16px",

background:
"rgba(255,255,255,.06)",

border:
"1px solid rgba(255,255,255,.1)"

}}

>


<h4>

{
player.players?.ign ||
player.players?.full_name ||
"Player"

}

</h4>



<p>

Kills:
{" "}
<b>
{player.kills}
</b>

</p>



<p>

Damage:
{" "}
<b>
{player.damage}
</b>

       {
openPerformance===item.id && (

<div

style={{

marginTop:"25px",

padding:"20px",

borderRadius:"18px",

background:"rgba(0,0,0,.35)"

}}

>

<h3>
🎮 PLAYER PERFORMANCE
</h3>


{

loadingStats === matchId ? (

<p>
Loading player stats...
</p>

)

:

(

playerStatsMap[matchId]?.length > 0 ? (

<div

style={{

display:"grid",

gridTemplateColumns:
"repeat(auto-fit,minmax(220px,1fr))",

gap:"15px"

}}

>

{

playerStatsMap[matchId].map(

(player)=>(

<div

key={player.id}

style={{

padding:"18px",

borderRadius:"16px",

background:
"rgba(255,255,255,.06)",

border:
"1px solid rgba(255,255,255,.1)"

}}

>

<h4>

{
player.players?.ign ||
player.players?.full_name ||
"Player"

}

</h4>


<p>
Kills:
{" "}
<b>{player.kills}</b>
</p>


<p>
Damage:
{" "}
<b>{player.damage}</b>
</p>


<p>
Assist:
{" "}
<b>{player.assists}</b>
</p>


</div>

)

)

}

</div>

)

:

(

<p>
No player performance data.
</p>

)

)

}


</div>

)

}
</div>

</main>

);

}
