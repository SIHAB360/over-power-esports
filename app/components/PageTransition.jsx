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

    },900);


    return ()=>clearTimeout(timer);


  },[pathname]);



  if(!show) return null;



  return(

    <div className="transition-screen">


      <div className="flash"></div>


      <div className="op-mark">

        OP

      </div>


      <h2>
        Loading
        <span>
          Here
        </span>
      </h2>


      <div className="line"></div>



<style jsx>{`

.transition-screen{

position:fixed;

inset:0;

background:

radial-gradient(
circle,
#400000,
#000 65%
);


z-index:999999;


display:flex;

flex-direction:column;

align-items:center;

justify-content:center;


animation:fade .9s;


}




.flash{


position:absolute;


width:500px;

height:500px;


background:red;


filter:blur(150px);


opacity:.25;


animation:pulse 1s infinite;


}



.op-mark{


width:90px;

height:90px;


border-radius:50%;


display:flex;

align-items:center;

justify-content:center;


font-size:45px;

font-weight:900;


border:3px solid red;


box-shadow:

0 0 30px red;


animation:zoom .8s;


}




h2{


margin-top:30px;


font-size:20px;


letter-spacing:5px;


color:white;


text-align:center;


}



h2 span{


display:block;


font-size:38px;


color:#ff2020;


text-shadow:

0 0 25px red;


}



.line{


margin-top:35px;


width:250px;

height:4px;


background:

linear-gradient(
90deg,
transparent,
red,
yellow,
transparent
);


animation:move 1s infinite;


}




@keyframes fade{


from{

opacity:0;

}

to{

opacity:1;

}


}



@keyframes zoom{


from{

transform:scale(.3);

}


to{

transform:scale(1);

}


}



@keyframes pulse{


50%{

transform:scale(1.3);

}


}



@keyframes move{


from{

transform:translateX(-100px);

}


to{

transform:translateX(100px);

}


}



`}</style>


    </div>

  );

}
