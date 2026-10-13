"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";


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


<Image
src="/assets/logo.png"
alt="OP Logo"
width={90}
height={90}
className="logo"
/>


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


animation:

fade .3s ease;


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


animation:

pulse 1s infinite;


}





.orb{


position:relative;


width:120px;

height:120px;


display:flex;

align-items:center;

justify-content:center;


animation:

appear .8s ease;


}




.logo{


position:relative;


z-index:3;


border-radius:50%;


filter:

drop-shadow(0 0 25px red);


animation:

logoFloat .8s ease;


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


}




.ring:after{


content:"";


position:absolute;


inset:-10px;


border-radius:50%;


border:

1px solid rgba(255,0,60,.5);


}




.shine{


position:absolute;


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


transform:translateX(-150px) rotate(-30deg);


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

transform:translateX(150px) rotate(-30deg);

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
