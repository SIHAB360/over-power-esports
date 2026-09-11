export default function Tournaments(){

const tournaments=[

{
name:"Pro Leguage S4 2026",
game:"Battel Royal",
prize:"10,00000 BDT",
status:"Running",
icon:"🔥"
},

{
name:"Free Fire World Series 2026",
game:"Battel Royal",
prize:"20,00000 BDT",
status:"Live",
icon:"⚡"
},

{
name:"Metal Blade Champion Rush",
game:"Live Cast",
prize:"100,000 BDT",
status:"UPCOMING",
icon:"🏆"
}

];


return(

<section className="tournaments">


<div className="tournament-header">

<h2>
Upcoming Tournaments
</h2>


<p>
Compete • Dominate • Become Champion
</p>


</div>




<div className="tournament-container">


{

tournaments.map((item,index)=>(


<div

className="tournament-card"

key={index}

>




<div className="tournament-top">


<span className="status">

{item.status}

</span>



<span className="tournament-icon">

{item.icon}

</span>



</div>





<h3>

{item.name}

</h3>






<div className="tournament-info">


<p>

<span>
🎮 Game:
</span>

{item.game}

</p>




<p>

<span>
🏆 Prize:
</span>

{item.prize}

</p>



</div>






<button>

VIEW DETAILS

</button>





</div>


))

}



</div>



</section>


)

}
