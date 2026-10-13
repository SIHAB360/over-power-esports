"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import logo from "../assets/logo.png";

export default function PageTransition(){

  const pathname = usePathname();

  const [show,setShow] = useState(false);


  useEffect(()=>{

    setShow(true);


    const timer=setTimeout(()=>{

      setShow(false);

    },850);


    return ()=>clearTimeout(timer);


  },[pathname]);



  if(!show) return null;



return(

<div className="transition">


<div className="glow"></div>



<div className="orb">


<div className="ring"></div>



<div className="threads">

<span></span>
<span></span>
<span></span>
<span></span>
<span></span>
<span></span>
<span></span>
<span></span>

</div>




<div className="logo-holder">

<Image
src={logo}
alt="OP Logo"
width={84}
height={84}
className="logo"
/>

</div>



<div className="shine"></div>


</div>



<style jsx>{`


.transition{

position:fixed;

inset:0;

z-index:999999;

background:#030303;

display:flex;

align-items:center;

justify-content:center;

overflow:hidden;

animation:fade .3s ease;

}





.glow{

position:absolute;

width:300px;

height:300px;


background:

radial-gradient(
circle,
rgba(255,0,60,.35),
transparent 70%
);


filter:blur(60px);


animation:pulse 1s infinite;

}





.orb{

position:relative;

width:120px;

height:120px;

display:flex;

align-items:center;

justify-content:center;


animation:appear .8s ease;

}





.logo-holder{

position:relative;

z-index:5;


width:84px;

height:84px;


border-radius:50%;


overflow:hidden;


display:flex;

align-items:center;

justify-content:center;


background:#050505;


box-shadow:

0 0 18px rgba(255,0,0,.35),

inset 0 0 12px rgba(255,0,0,.18);


animation:

logoFloat .8s ease;


}





.logo{


width:100%;

height:100%;


object-fit:cover;


display:block;


border-radius:50%;


filter:

drop-shadow(0 0 18px rgba(255,0,0,.45));

}





.ring{

position:absolute;


inset:0;


border-radius:50%;


border:

2px solid transparent;


border-top-color:#ff2020;

border-right-color:#ff2020;


box-shadow:

0 0 20px red;


animation:

rotate 1s linear infinite;


z-index:4;


}





.ring:after{


content:"";


position:absolute;


inset:-10px;


border-radius:50%;


border:

1px solid rgba(255,0,60,.5);


}





/* COLOR ENERGY THREAD */


.threads{

position:absolute;

inset:-180px;


z-index:1;


animation:

threadRotate 3s linear infinite;


}





.threads span{


position:absolute;


left:50%;

top:50%;


width:2px;


height:180px;


transform-origin:center bottom;


background:linear-gradient(
to top,
transparent,
#ff004c,
#fff,
#00ffff
);


box-shadow:

0 0 12px currentColor;


animation:

threadMove .8s ease forwards;


opacity:.8;


}





.threads span:nth-child(1){

transform:rotate(0deg);

background:linear-gradient(
to top,
transparent,
red,
yellow
);

}


.threads span:nth-child(2){

transform:rotate(45deg);

background:linear-gradient(
to top,
transparent,
#00ffff,
blue
);

}



.threads span:nth-child(3){

transform:rotate(90deg);

background:linear-gradient(
to top,
transparent,
lime,
green
);

}



.threads span:nth-child(4){

transform:rotate(135deg);

background:linear-gradient(
to top,
transparent,
purple,
pink
);

}



.threads span:nth-child(5){

transform:rotate(180deg);

background:linear-gradient(
to top,
transparent,
orange,
red
);

}



.threads span:nth-child(6){

transform:rotate(225deg);

background:linear-gradient(
to top,
transparent,
cyan,
blue
);

}



.threads span:nth-child(7){

transform:rotate(270deg);

background:linear-gradient(
to top,
transparent,
white,
yellow
);

}



.threads span:nth-child(8){

transform:rotate(315deg);

background:linear-gradient(
to top,
transparent,
magenta,
red
);

}




@keyframes threadRotate{


100%{

transform:rotate(360deg);

}


}





@keyframes threadMove{


0%{

height:20px;

opacity:0;

}


50%{

height:220px;

opacity:1;

}


100%{

height:180px;

opacity:0;

}


}





.shine{


position:absolute;


z-index:6;


width:140px;


height:20px;


background:

linear-gradient(
90deg,
transparent,
white,
transparent
);


opacity:.7;


transform:

translateX(-150px) rotate(-30deg);


animation:

shineMove .8s ease;


}





@keyframes rotate{


100%{

transform:rotate(360deg);

}


}





@keyframes appear{


from{

transform:scale(.3);

opacity:0;

}


to{

transform:scale(1);

opacity:1;

}


}





@keyframes logoFloat{


50%{

transform:scale(1.08);

}


}




@keyframes shineMove{


100%{

transform:

translateX(150px) rotate(-30deg);


}


}





@keyframes pulse{


50%{

transform:scale(1.3);


}


}





@keyframes fade{


from{

opacity:0;

}


to{

opacity:1;


}


}



`}</style>


</div>


);


}
