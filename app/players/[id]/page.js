return(

<section className="player-profile premium">


{/* TOP HEADER */}

<div className="profile-top">


<div>

<h1>
{player.name}
</h1>

<p>
{player.name} is a professional esports player currently playing for Over Power Esports.
</p>

</div>



<div className="winnings">

<span>
TOTAL WINNINGS
</span>

<h2>
$16,015
</h2>

</div>


</div>





<div className="profile-body">



{/* LEFT SIDEBAR */}

<div className="profile-sidebar">


<div className="player-image-box">

<img
src={player.image}
alt={player.name}
/>

</div>



<h2>
PLAYER INFORMATION
</h2>


<div className="info-row">
<span>Name</span>
{player.name}
</div>


<div className="info-row">
<span>Nationality</span>
🇧🇩 Bangladesh
</div>


<div className="info-row">
<span>Status</span>
Active
</div>


<div className="info-row">
<span>Role</span>
{player.role}
</div>


<div className="info-row">
<span>Team</span>
{player.team}
</div>




<h2>
LINKS
</h2>


<div className="social-links">


{player.facebook &&
<a href={player.facebook} target="_blank">
f
</a>
}


{player.instagram &&
<a href={player.instagram} target="_blank">
◎
</a>
}


{player.youtube &&
<a href={player.youtube} target="_blank">
▶
</a>
}


{player.tiktok &&
<a href={player.tiktok} target="_blank">
♪
</a>
}


</div>



<h2>
TEAM HISTORY
</h2>


<p className="history">
2026-06-18 - Present
<br/>
Over Power Main Team
</p>


</div>






{/* RIGHT SIDE */}


<div className="profile-content">



<div className="table-card">


<h2>
🏆 ACHIEVEMENTS
</h2>


<table>

<tbody>

<tr>
<td>2026-06-21</td>
<td>A-Tier</td>
<td>Free Fire MAX Asia Invitational</td>
<td>$120</td>
</tr>


<tr>
<td>2026-06-06</td>
<td>A-Tier</td>
<td>Free Fire World Series</td>
<td>$181</td>
</tr>


<tr>
<td>2026-05-30</td>
<td>C-Tier</td>
<td>Liquid Esports Invitational</td>
<td>$48</td>
</tr>


</tbody>

</table>


</div>





<div className="table-card">


<h2>
🏅 AWARDS
</h2>


<table>

<tbody>

<tr>

<td>
2026-01-30
</td>

<td>
C-Tier
</td>

<td>
Free Fire Road To Glory
</td>

<td>
CONTENT LEGEND
</td>

</tr>


</tbody>

</table>


</div>



</div>


</div>


</section>

)
