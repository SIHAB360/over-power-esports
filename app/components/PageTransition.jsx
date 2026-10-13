"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";


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

<div className="portal-screen">


<div className="portal-glow"></div>


<div className="portal">


<div className="core"></div>


</div>



<style jsx>{`


.portal-screen{

position:fixed;

inset:0;


z-index:999999;


background:#000;


display:flex;

align-items:center;

justify-content:center;


overflow:hidden;


animation:

fadeIn .35s ease;


}



.portal{


width:20px;

height:20px;


border-radius:50%;


background:

radial-gradient(
circle,
white 0%,
#ff2020 25%,
red 50%,
transparent 70%
);


box-shadow:

0 0 40px red,
0 0 100px red;


animation:

warp 0.85s ease forwards;


}



.portal::before{


content:"";


position:absolute;


inset:-20px;


border-radius:50%;


border:2px solid rgba(255,0,0,.8);


animation:

ring 0.85s ease forwards;


}



.portal-glow{


position:absolute;


width:500px;

height:500px;


background:

radial-gradient(
circle,
rgba(255,0,0,.45),
transparent 65%
);


filter:blur(80px);


animation:

glow 0.85s ease;


}



.core{


width:100%;

height:100%;


background:white;


border-radius:50%;


opacity:.8;


}




@keyframes warp{


0%{

transform:scale(.1);

opacity:1;

}



70%{

transform:scale(35);

opacity:1;

}



100%{

transform:scale(70);

opacity:0;

}



}





@keyframes ring{


0%{

transform:scale(.1);

opacity:1;

}



100%{

transform:scale(45);

opacity:0;

}


}





@keyframes glow{


0%{

transform:scale(.3);

opacity:0;

}



50%{

opacity:1;

}



100%{

transform:scale(3);

opacity:0;

}


}





@keyframes fadeIn{


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
