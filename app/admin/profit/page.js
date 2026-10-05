// FINAL CODE PART 1
// app/admin/profit/page.js

"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";


function money(value){

  return `৳${Number(value || 0).toLocaleString(
    "en-BD",
    {
      minimumFractionDigits:2,
      maximumFractionDigits:2,
    }
  )}`;

}



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
        "linear-gradient(145deg,rgba(255,255,255,.08),rgba(255,255,255,.03))",
        border:`1px solid ${color}66`,
        backdropFilter:"blur(18px)",
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
          opacity:.35
        }}
      />


      <div
        style={{
          color,
          fontSize:"14px",
          fontWeight:800,
          letterSpacing:"1px",
          marginBottom:"15px"
        }}
      >

        {icon} {title}

      </div>


      <div
        style={{
          fontSize:"34px",
          fontWeight:900,
          color:"#fff"
        }}
      >

        {money(value)}

      </div>


    </div>

  );

}





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

loadFinance();

},[]);






async function loadFinance(){


setLoading(true);



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

match_type,

created_at,

tournaments (

name

)

),

teams!match_finance_team_id_fkey (

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

setErrorMessage(
error.message
);

setFinanceData([]);

}

else{

setFinanceData(
data || []
);

}



setLoading(false);


}






async function loadPlayerStats(matchId){


if(!matchId)
return;



if(playerStatsMap[matchId])
return;



setLoadingStats(matchId);



const {

data,

error

}

=
await supabase

.from("match_player_stats")

.select(

`

id,

kills,

assists,

damage,

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

[matchId]:data || []

})
);

}



setLoadingStats(null);


}





function togglePerformance(item){


const matchId =
item.match_id ||
item.matches?.id;



if(openPerformance===item.id){

setOpenPerformance(null);

return;

}



setOpenPerformance(item.id);

loadPlayerStats(matchId);


}





const teamOptions =
[

...new Set(

financeData

.map(
item=>item.teams?.team_name
)

.filter(Boolean)

)

];



const tournamentOptions =
[

...new Set(

financeData

.map(
item=>item.matches?.tournaments?.name
)

.filter(Boolean)

)

];



const matchTypeOptions =
[

...new Set(

financeData

.map(
item=>item.matches?.match_type
)

.filter(Boolean)

)

];
// FINAL CODE PART 2


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
new Date(item.created_at);



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





if(loading){


return (

<div

style={{

minHeight:"100vh",

display:"flex",

alignItems:"center",

justifyContent:"center",

background:"#050505",

color:"#fbbf24",

fontSize:"28px",

fontWeight:900

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

background:

`

radial-gradient(
circle at top left,
rgba(255,0,0,.25),
transparent 35%
),

radial-gradient(
circle at bottom right,
rgba(59,130,246,.18),
transparent 35%
),

linear-gradient(
160deg,
#120000,
#050505
)

`

}}

>



<h1

style={{

textAlign:"center",

fontSize:
"clamp(36px,5vw,58px)",

fontWeight:1000,

letterSpacing:"3px",

marginBottom:"45px",

background:
"linear-gradient(90deg,#fbbf24,#ef4444,#60a5fa)",

WebkitBackgroundClip:"text",

WebkitTextFillColor:"transparent"

}}

>

💰 PROFIT MANAGEMENT

</h1>





{

errorMessage && (

<div

style={{

padding:"18px",

marginBottom:"25px",

borderRadius:"16px",

background:"rgba(127,29,29,.4)",

border:"1px solid #ef4444"

}}

>

{errorMessage}

</div>

)

}






<div

style={{

maxWidth:"1200px",

margin:"0 auto 40px",

display:"grid",

gridTemplateColumns:

"repeat(auto-fit,minmax(260px,1fr))",

gap:"25px"

}}

>


<SummaryCard

title="Total Profit"

value={totalProfit}

color="#fbbf24"

icon="💰"

/>


<SummaryCard

title="Player Share"

value={totalPlayer}

color="#34d399"

icon="👥"

/>


<SummaryCard

title="Management Share"

value={totalManagement}

color="#60a5fa"

icon="🏢"

/>


</div>






<div

style={{

maxWidth:"1200px",

margin:"0 auto 40px",

padding:"25px",

borderRadius:"24px",

background:"rgba(255,255,255,.05)",

border:"1px solid rgba(255,255,255,.12)",

backdropFilter:"blur(20px)"

}}

>


<h3>
🔎 FILTER FINANCIAL RECORDS
</h3>



<div

style={{

display:"flex",

gap:"15px",

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

teamOptions.map(

(team)=>(

<option

key={team}

value={team}

>

{team}

</option>

)

)

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
All Tournament
</option>


{

tournamentOptions.map(

(item)=>(

<option

key={item}

value={item}

>

{item}

</option>

)

)

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
All Match Type
</option>


{

matchTypeOptions.map(

(item)=>(

<option

key={item}

value={item}

>

{item}

</option>

)

)

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
All Status
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
// FINAL CODE PART 3


<div

style={{

maxWidth:"1200px",

margin:"0 auto"

}}

>


<h2

style={{

textAlign:"center",

fontSize:"32px",

fontWeight:900,

marginBottom:"30px"

}}

>

📊 FINANCIAL HISTORY

</h2>





{

filteredData.length===0 ? (

<div

style={{

padding:"40px",

textAlign:"center",

borderRadius:"20px",

background:"rgba(255,255,255,.05)"

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

(item)=>(


<div

key={item.id}

style={{

padding:"30px",

borderRadius:"24px",

background:

"linear-gradient(145deg,rgba(255,255,255,.08),rgba(255,255,255,.03))",

border:

"1px solid rgba(255,255,255,.12)",

backdropFilter:"blur(18px)"

}}

>



<div

style={{

display:"flex",

justifyContent:"space-between",

flexWrap:"wrap",

gap:"20px"

}}

>


<div>

<p>
TOURNAMENT
</p>


<h3>

{
item.matches
?.tournaments
?.name ||
"N/A"

}

</h3>


</div>



<div>

<p>
TEAM
</p>


<h3>

{
item.teams?.team_name ||
"N/A"

}

</h3>


</div>


</div>






<div

style={{

display:"grid",

gridTemplateColumns:

"repeat(auto-fit,minmax(180px,1fr))",

gap:"15px",

marginTop:"25px"

}}

>


<div className="finance-mini-card">

ENTRY FEE

<br/>

<b>
{money(item.entry_fee)}
</b>

</div>



<div className="finance-mini-card">

PRIZE MONEY

<br/>

<b>
{money(item.prize_money)}
</b>

</div>



<div className="finance-mini-card">

NET PROFIT

<br/>

<b>

{money(item.profit)}

</b>

</div>


<div className="finance-mini-card">

DATE

<br/>

<b>

{
new Date(
item.created_at
)
.toLocaleDateString()
}

</b>

</div>



</div>








<div

style={{

display:"flex",

justifyContent:"space-between",

alignItems:"center",

flexWrap:"wrap",

gap:"20px",

marginTop:"25px"

}}

>


<div>

<p>
PLAYER SHARE
</p>


<h3
style={{
color:"#34d399"
}}
>

{money(item.player_amount)}

</h3>


</div>



<div>

<p>
MANAGEMENT SHARE
</p>


<h3
style={{
color:"#60a5fa"
}}
>

{money(item.management_amount)}

</h3>


</div>





<button

onClick={()=>togglePerformance(item)}

style={{

padding:"12px 24px",

borderRadius:"14px",

background:"transparent",

border:"1px solid #fbbf24",

color:"#fbbf24",

fontWeight:800,

cursor:"pointer"

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

loadingStats ===
(item.match_id || item.matches?.id)

?

(

<p>
Loading player stats...
</p>

)

:

(

playerStatsMap[
(item.match_id || item.matches?.id)
]?.length > 0

?

(

<div

style={{

display:"grid",

gridTemplateColumns:

"repeat(auto-fit,minmax(220px,1fr))",

gap:"15px"

}}

>


{

playerStatsMap[
(item.match_id || item.matches?.id)
]

.map(

(player)=>(


<div

key={player.id}

style={{

padding:"18px",

borderRadius:"16px",

background:"rgba(255,255,255,.06)",

border:"1px solid rgba(255,255,255,.1)"

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

</p>



<p>

Assist:
{" "}
<b>
{player.assists}
</b>

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

)

}

</div>


</main>

);

}
