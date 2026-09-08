export default function PlayerProfile({params}){

const players = {

appelo:{
name:"APPELO",
role:"PRIMARY",
team:"OVER POWER MAIN TEAM",
image:"/players/appelo.png",
facebook:"https://www.facebook.com/share/19XKoR58cb/?mibextid=wwXIfr",
instagram:"https://www.instagram.com/_appelo_ff",
youtube:"https://youtube.com/@appelo_ff",
tiktok:"https://www.tiktok.com/@appelo_offical"
},
 

oggy:{
name:"OGGY",
role:"SECONDARY",
team:"OVER POWER MAIN TEAM",
image:"/players/oggy.png",
position:"center top",
facebook:"https://www.facebook.com/share/1JEkiAK2J6/",
instagram:"https://www.instagram.com/being_ogggyy?stkn=MTRuemcwaDJjaWdvMg==",
youtube:"https://youtube.com/@being_ogggyy?si=UHNwx-WcCr4kVwFz",
tiktok:"https://www.tiktok.com/@being_ogggyy?_r=1&_t=ZS-99Z8hvW8Hxd"
},


itachix:{
name:"ITACHIx",
role:"BOMBER",
team:"OVER POWER MAIN TEAM",
image:"/players/itachix.png",
facebook:"https://www.facebook.com/profile.php?id=61590102347309",
instagram:"",
youtube:"https://youtube.com/@itachiontop-r2p",
tiktok:"https://www.tiktok.com/@itachix074"
},


rejwan:{
name:"REJWAN",
role:"IGL+SUPPORTER",
team:"OVER POWER MAIN TEAM",
image:"/players/rejwan.png",
position:"center top",
facebook:"https://www.facebook.com/rejwan.ahammed11?mibextid=wwXIfr",
instagram:"https://www.instagram.com/rahammed_",
youtube:"https://youtube.com/@rejwan-ff6711",
tiktok:"https://www.tiktok.com/@rejwanahammed"
},


fixfire:{
name:"FixFIRE",
role:"SNIPER",
team:"OVER POWER MAIN TEAM",
image:"/players/fixfire.png",
facebook:"https://www.facebook.com/share/1DYEWmWzRr/",
instagram:"https://www.instagram.com/xr_jisan09",
youtube:"https://www.youtube.com/@fixfire09",
tiktok:"https://tiktok.com/@fixfire09"
}

}



const player = players[params.id];


if(!player){

return(
<h1>
Player Not Found
</h1>
)

}



return(

<section className="player-profile premium">


<img 
src={player.image}
alt={player.name}
/>


<h1>
{player.name}
</h1>


<h3>
{player.role}
</h3>


<h4>
{player.team}
</h4>



<div>


{player.facebook &&
<a href={player.facebook} target="_blank">
Facebook
</a>
}


{player.instagram &&
<a href={player.instagram} target="_blank">
Instagram
</a>
}


{player.youtube &&
<a href={player.youtube} target="_blank">
YouTube
</a>
}


{player.tiktok &&
<a href={player.tiktok} target="_blank">
TikTok
</a>
}


</div>


</section>

)

}
