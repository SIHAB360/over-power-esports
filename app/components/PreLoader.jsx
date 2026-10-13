"use client";

import { useEffect, useState } from "react";


export default function PreLoader(){

  const [progress,setProgress] = useState(0);
  const [hide,setHide] = useState(false);
  const [exit,setExit] = useState(false);



  useEffect(()=>{


    // Check how user entered the page

    const navigation =
    window.performance.getEntriesByType("navigation")[0];



    // Browser back / forward navigation
    // Home loader বন্ধ থাকবে

    if(
      navigation &&
      navigation.type === "back_forward"
    ){

      setHide(true);

      return;

    }



    // Internal Next.js navigation হলে বন্ধ

    const referrer =
    document.referrer;


    if(
      referrer &&
      referrer.includes(
        window.location.hostname
      )
    ){

      setHide(true);

      return;

    }



    // Direct entry হলে loader চলবে


    const timer=setInterval(()=>{


      setProgress(prev=>{


        if(prev >= 100){


          clearInterval(timer);



          setTimeout(()=>{


            setExit(true);



            setTimeout(()=>{

              setHide(true);

            },700);



          },300);



          return 100;

        }



        return prev + 4;


      });



    },45);



    return ()=>clearInterval(timer);



  },[]);




  if(hide) return null;



  return(

<div className={`loader ${exit ? "exit" : ""}`}>


<div className="laser"></div>

<div className="energy"></div>



<div className="logo-wrap">


<div className="ring"></div>


<div className="logo">

OP

</div>


</div>



<h1>

WELCOME TO

<span>
OVER POWER
</span>


</h1>



<div className="loading">


<div className="loading-title">

LOADING...

</div>



<div className="bar">


<div

className="fill"

style={{

width:`${progress}%`

}}

></div>



</div>



<div className="percent">

{progress}%

</div>



</div>



<p>

EVERY SECOND MATTERS

</p>
  <style jsx>{`

.loader{

position:fixed;

inset:0;


background:

radial-gradient(
circle at center,
#520000,
#050505 60%
);


display:flex;

flex-direction:column;

justify-content:center;

align-items:center;


z-index:999999;


overflow:hidden;


color:white;


transition:.7s;


}



.loader.exit{


opacity:0;


transform:scale(1.08);


}




.laser{


position:absolute;


width:900px;


height:2px;


background:

linear-gradient(
90deg,
transparent,
red,
yellow,
transparent
);



top:45%;


left:-100%;



animation:

laserMove 3s infinite;



}




@keyframes laserMove{


100%{


left:120%;


}


}






.energy{


position:absolute;


width:500px;


height:500px;



background:red;



opacity:.15;



filter:blur(160px);



animation:

energyPulse 3s infinite;



}




@keyframes energyPulse{


50%{


transform:scale(1.4);


opacity:.3;


}


}





.logo-wrap{


position:relative;


width:160px;


height:160px;



display:flex;


align-items:center;


justify-content:center;



margin-bottom:35px;



}





.ring{


position:absolute;


inset:0;



border-radius:50%;



background:

conic-gradient(
red,
yellow,
red,
transparent,
red
);



animation:

rotate 3s linear infinite;



}





.logo{


width:130px;


height:130px;



border-radius:50%;



background:#090909;



display:flex;


align-items:center;


justify-content:center;



font-size:55px;



font-weight:1000;



border:2px solid red;




box-shadow:



0 0 30px red,

inset 0 0 30px red;



z-index:2;



}





h1{


font-size:28px;



letter-spacing:5px;



text-align:center;



animation:

textShow 1s;



}





h1 span{


display:block;



font-size:55px;



color:#ff2020;



text-shadow:



0 0 20px red;



}






@keyframes textShow{


from{


opacity:0;


transform:translateY(30px);



}



to{


opacity:1;


transform:translateY(0);



}


}






.loading{


margin-top:40px;



text-align:center;



}





.loading-title{


letter-spacing:5px;



font-size:14px;



margin-bottom:15px;



}





.bar{


width:350px;



height:10px;



background:#1b1b1b;



border-radius:20px;



overflow:hidden;



border:1px solid #555;



box-shadow:

0 0 20px rgba(255,0,0,.5);



}





.fill{


height:100%;



background:



linear-gradient(
90deg,
red,
yellow,
red
);



box-shadow:

0 0 25px red;



transition:.1s;



}





.percent{


margin-top:15px;



font-weight:900;



font-size:20px;



}





p{


margin-top:35px;



letter-spacing:8px;



font-size:12px;



color:#aaa;



}






@keyframes rotate{


100%{


transform:rotate(360deg);



}


}





@keyframes energyPulse{


50%{


transform:scale(1.4);



opacity:.3;



}


}





@media(max-width:600px){



.logo-wrap{


width:120px;


height:120px;



}



.logo{


width:100px;


height:100px;



font-size:40px;



}



h1{


font-size:20px;



}



h1 span{


font-size:38px;



}



.bar{


width:260px;



}



}



`}</style>


</div>

  );

}
