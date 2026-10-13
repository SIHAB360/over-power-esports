"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import logo from "../assets/logo.png";


export default function PageTransition(){

  const pathname = usePathname();

  const [show,setShow]=useState(false);


  useEffect(()=>{

    setShow(true);


    const timer=setTimeout(()=>{

      setShow(false);

    },1200);


    return ()=>clearTimeout(timer);


  },[pathname]);



  if(!show) return null;



return(

<div className="transition">


<div className="background-glow"></div>



<div className="orb">


<div className="threads">

{Array.from({length:20}).map((_,i)=>(

<span 
key={i}
style={{
"--i":i
}}
></span>

))}

</div>



<div className="ring"></div>



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

background:#020202;


display:flex;

align-items:center;

justify-content:center;


overflow:hidden;


animation:fade .4s ease;


}





.background-glow{


position:absolute;


width:350px;

height:350px;


background:

radial-gradient(
circle,
rgba(255,0,60,.35),
transparent 70%
);


filter:blur(90px);


animation:

glowPulse 2s infinite;


}





.orb{


position:relative;


width:120px;

height:120px;


display:flex;

align-items:center;

justify-content:center;


}





.logo-holder{


position:relative;


z-index:10;


width:84px;

height:84px;


border-radius:50%;


overflow:hidden;


background:#050505;


box-shadow:

0 0 25px rgba(255,0,60,.6);


animation:

logoIn .8s ease;


}





.logo{


width:100%;

height:100%;


object-fit:cover;


border-radius:50%;


}





.ring{


position:absolute;


inset:0;


border-radius:50%;


border:

1.5px solid rgba(255,0,60,.9);


box-shadow:

0 0 25px red;


animation:

rotate 2s linear infinite;


z-index:8;


}





/* 20 THIN ENERGY FIBERS */


.threads{


position:absolute;


inset:-900px;


z-index:3;


}





.threads span{


position:absolute;


left:50%;

top:50%;


width:1px;


height:900px;


background:

linear-gradient(
to top,
transparent,
rgba(255,255,255,.9),
rgba(255,0,80,.8)
);


transform-origin:

0 0;


opacity:0;


animation:

fiber 1.2s ease forwards;


animation-delay:

calc(var(--i) * .03s);


filter:

drop-shadow(0 0 5px rgba(255,0,80,.8));


}





.threads span:nth-child(1){
transform:rotate(0deg);
}


.threads span:nth-child(2){
transform:rotate(18deg);
}


.threads span:nth-child(3){
transform:rotate(36deg);
}


.threads span:nth-child(4){
transform:rotate(54deg);
}


.threads span:nth-child(5){
transform:rotate(72deg);
}


.threads span:nth-child(6){
transform:rotate(90deg);
}


.threads span:nth-child(7){
transform:rotate(108deg);
}


.threads span:nth-child(8){
transform:rotate(126deg);
}


.threads span:nth-child(9){
transform:rotate(144deg);
}


.threads span:nth-child(10){
transform:rotate(162deg);
}


.threads span:nth-child(11){
transform:rotate(180deg);
}


.threads span:nth-child(12){
transform:rotate(198deg);
}


.threads span:nth-child(13){
transform:rotate(216deg);
}


.threads span:nth-child(14){
transform:rotate(234deg);
}


.threads span:nth-child(15){
transform:rotate(252deg);
}


.threads span:nth-child(16){
transform:rotate(270deg);
}


.threads span:nth-child(17){
transform:rotate(288deg);
}


.threads span:nth-child(18){
transform:rotate(306deg);
}


.threads span:nth-child(19){
transform:rotate(324deg);
}


.threads span:nth-child(20){
transform:rotate(342deg);
}





@keyframes fiber{


0%{

height:0;

opacity:0;


}


30%{

opacity:1;


}


100%{

height:1000px;

opacity:0;


}


}




.shine{


position:absolute;


z-index:15;


width:140px;

height:18px;


background:

linear-gradient(
90deg,
transparent,
white,
transparent
);


transform:

translateX(-150px)
rotate(-30deg);


animation:

shineMove .8s ease;


}




@keyframes shineMove{


100%{

transform:

translateX(150px)
rotate(-30deg);


}


}





@keyframes rotate{


100%{

transform:rotate(360deg);


}


}





@keyframes logoIn{


from{

transform:scale(.5);

opacity:0;


}


to{

transform:scale(1);

opacity:1;


}


}





@keyframes glowPulse{


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
