import ProfileLoader from "./ProfileLoader";

import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTiktok
} from "react-icons/fa";


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
facebook:"https://www.facebook.com/share/19XKoR58cb/",
instagram:"https://www.instagram.com/_appelo_ff",
youtube:"https://youtube.com/@appelo_ff",
tiktok:"https://www.tiktok.com/@appelo_offical_"
}
},

{
name:"OGGY",
role:"SECONDARY",
image:"/players/oggy.png",
position:"center top",
social:{
facebook:"https://www.facebook.com/share/1JEkiAK2J6/",
instagram:"https://www.instagram.com/being_ogggyy",
youtube:"https://youtube.com/@being_ogggyy",
tiktok:"https://www.tiktok.com/@being_ogggyy"
}
},

{
name:"ITACHIx",
role:"BOMBER",
image:"/players/itachix.png",
position:"center top",
social:{
facebook:"https://www.facebook.com/profile.php?id=61590102347309",
youtube:"https://youtube.com/@itachiontop-r2p",
tiktok:"https://www.tiktok.com/@itachix074"
}
},

{
name:"REJWAN",
role:"IGL+SUPPORTER",
image:"/players/rejwan.png",
position:"center top",
social:{
facebook:"https://www.facebook.com/rejwan.ahammed11",
instagram:"https://www.instagram.com/rahammed_",
youtube:"https://youtube.com/@rejwan-ff6711",
tiktok:"https://www.tiktok.com/@rejwanahammed"
}
},

{
name:"FixFIRE",
role:"SNIPER",
image:"/players/fixfire.png",
position:"center top",
social:{
facebook:"https://www.facebook.com/share/1DYEWmWzRr/",
instagram:"https://www.instagram.com/xr_jisan09",
youtube:"https://www.youtube.com/@fixfire09",
tiktok:"https://tiktok.com/@fixfire09"
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
position:"center top",
social:{
facebook:"",
instagram:"",
youtube:"",
tiktok:""
}
}

{
name:"JELLAL",
role:"SECONDARY",
image:"/players/jellal.png",
position:"center 15%",
social:{
facebook:"",
instagram:"",
youtube:"",
tiktok:""
}
}

{
name:"SOJIB",
role:"BOMBER",
image:"/players/sojib.png",
position:"center top",
social:{
facebook:"",
instagram:"",
youtube:"",
tiktok:""
}
}

{
name:"NAFIZ",
role:"SUPPORTER",
image:"/players/nafiz.jpeg",
position:"center 20%",
social:{
facebook:"",
instagram:"",
youtube:"",
tiktok:""
}
}

{
name:"BAYMAX",
role:"SNIPER",
image:"/players/baymax.png",
position:"center top",
social:{
facebook:"",
instagram:"",
youtube:"",
tiktok:""
}
}

]
},
  

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
style={{
objectPosition:player.position || "center"
}}
/>

</div>



<h4>
{player.name}
</h4>


<span>
{player.role}
</span>



<div className="social-links">


{
player.social.facebook &&

<a
href={player.social.facebook}
target="_blank"
rel="noopener noreferrer"
className="facebook"
>
<FaFacebookF/>
</a>

}



{
player.social.instagram &&

<a
href={player.social.instagram}
target="_blank"
rel="noopener noreferrer"
className="instagram"
>
<FaInstagram/>
</a>

}



{
player.social.youtube &&

<a
href={player.social.youtube}
target="_blank"
rel="noopener noreferrer"
className="youtube"
>
<FaYoutube/>
</a>

}



{
player.social.tiktok &&

<a
href={player.social.tiktok}
target="_blank"
rel="noopener noreferrer"
className="tiktok"
>
<FaTiktok/>
</a>

}


</div>

<a
href={`/players/${player.name.toLowerCase()}`}
className="profile-btn"
>
VIEW PROFILE
</a>


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
