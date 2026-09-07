export default function Teams(){

const teams = [

{
name:"OVER POWER MAIN TEAM",
slogan:"Born To Dominate",

players:[
{
name:"APPELO",
role:"PRIMARY",
image:"/players/appelo.png",
position:"center top",
social:{
facebook:"https://www.facebook.com/share/19XKoR58cb/?mibextid=wwXIfr",
instagram:"https://www.instagram.com/_appelo_ff?stkn=ZjBta2pzMmJodjU2&utm_source=qr",
youtube:"https://youtube.com/@appelo_ff?si=xNMDlDdjx7jQ2Bqp",
tiktok:"https://www.tiktok.com/@appelo_offical_?_r=1&_t=ZS-99XT4cbGFoj"
}
},

{
name:"OGGY",
role:"SECONDARY",
image:"/players/oggy.png",
position:"center top",
social:{
facebook:"",
instagram:"",
youtube:"",
tiktok:""
}
},

{
name:"ITACHIx",
role:"BOMBER",
image:"/players/itachix.png",
position:"center top",
social:{
facebook:"https://www.facebook.com/profile.php?id=61590102347309",
instagram:"",
youtube:"https://youtube.com/@itachiontop-r2p?si=59-V9LBT1yH7d-L5",
tiktok:"https://www.tiktok.com/@itachix074?_r=1&_t=ZS-99XT9LGrTPM"
}
},

{
name:"REJWAN",
role:"IGL+SUPPORTER",
image:"/players/rejwan.png",
position:"center top",
social:{
facebook:"",
instagram:"",
youtube:"",
tiktok:""
}
},

{
name:"FixFIRE",
role:"SNIPER",
image:"/players/fixfire.png",
position:"center top",
social:{
facebook:"https://www.facebook.com/share/1DYEWmWzRr/",
instagram:"https://www.instagram.com/xr_jisan09?stkn=b3d6a2Y4MTZuMXg1",
youtube:"https://www.youtube.com/@fixfire09",
tiktok:"tiktok.com/@fixfire09"
}
}
]

},


{
name:"OVER POWER ELITE",
slogan:"Victory Is Our Language",

players:[
{
name:"FOYSAL",
role:"PRIMARY",
image:"/players/rfntc.png",
position:"center top"
},

{
name:"JELLAL",
role:"SECONDARY",
image:"/players/jellal.png",
position:"center 15%"
},

{
name:"SOJIB",
role:"BOMBER",
image:"/players/sojib.png",
position:"center top"
},

{
name:"NAFIZ",
role:"SUPPORTER",
image:"/players/nafiz.jpeg",
position:"center 20%"
},

{
name:"BAYMAX",
role:"SNIPER",
image:"/players/baymax.png",
position:"center top"
}
]

},


{
name:"OVER POWER RISING",
slogan:"Future Champions",

players:[
{name:"PLAYER ONE",role:"RISING STAR"},
{name:"PLAYER TWO",role:"ASSAULTER"},
{name:"PLAYER THREE",role:"SNIPER"},
{name:"PLAYER FOUR",role:"ALL ROUNDER"},
{name:"PLAYER FIVE",role:"SUPPORT"}
]

}

]


return(

<section className="teams">


<h2>
OUR TEAMS
</h2>


{
teams.map((team,index)=>(

<div className="team-block" key={index}>


<h3>
{team.name}
</h3>


<p>
{team.slogan}
</p>



<div className="team-players">


{
team.players.map((player,i)=>(


<div className="player-card" key={i}>


<div className="player-image">

<img 
src={player.image}
alt={player.name}
/>

</div>


<h4>
{player.name}
</h4>


<span>
{player.role}
</span>



<div className="social-links">


<a href="#">
<i className="fa-brands fa-facebook-f"></i>
</a>


<a href="#">
<i className="fa-brands fa-instagram"></i>
</a>


<a href="#">
<i className="fa-brands fa-youtube"></i>
</a>


<a href="#">
<i className="fa-brands fa-tiktok"></i>
</a>


</div>



<button>
VIEW PROFILE
</button>


</div>


))

}


</div>


</div>

))

}


</section>

)

}
