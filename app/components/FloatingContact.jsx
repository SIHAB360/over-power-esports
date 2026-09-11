"use client";

import { useState } from "react";
import headset from "../assets/headset.png";


export default function FloatingContact() {


const [open, setOpen] = useState(false);


  

const links = [

{
name:"WhatsApp",
icon:"fa-brands fa-whatsapp",
url:"https://chat.whatsapp.com/KyKkUE0g17X5w7PJXtfM3E",
className:"whatsapp"
},

{
name:"Discord",
icon:"fa-brands fa-discord",
url:"https://discord.gg/4HrJ5zRCh",
className:"discord"
}

];



return (

<div

className={`floating-contact ${open ? "is-open" : ""}`}

onMouseEnter={()=>setOpen(true)}

onMouseLeave={()=>setOpen(false)}

>


<div className="floating-links">


{

links.map((link)=>(


<a

key={link.name}

href={link.url}

target="_blank"

rel="noopener noreferrer"

className={`floating-link ${link.className}`}

aria-label={link.name}

>


<i className={link.icon}></i>


</a>


))

}


</div>





<button

type="button"

className="floating-main-button"

onClick={()=>setOpen(!open)}

aria-label="Contact Menu"

>


<img

src={headset.src}

alt="Contact"

className="contact-icon"

/>


</button>



</div>


);


}
