"use client";

import { useEffect, useState } from "react";


export default function PreLoader(){

  const [progress,setProgress] = useState(0);
  const [hide,setHide] = useState(false);


  useEffect(()=>{

    const interval = setInterval(()=>{

      setProgress(prev=>{

        if(prev >= 100){

          clearInterval(interval);

          setTimeout(()=>{

            setHide(true);

          },400);


          return 100;

        }


        return prev + 5;

      });


    },50);



    return ()=>clearInterval(interval);


  },[]);



  if(hide) return null;



  return(

    <div className="loader">


      <div className="loader-light"></div>


      <div className="logo">

        OP

      </div>



      <h1>
        WELCOME TO
        <span>
          OVER POWER
        </span>
      </h1>



      <div className="loading-text">

        Loading...

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
#300000,
#000
);


display:flex;

flex-direction:column;

align-items:center;

justify-content:center;


z-index:999999;


overflow:hidden;


color:white;


}



.loader-light{

position:absolute;


width:400px;

height:400px;


background:red;


filter:blur(150px);


opacity:.25;


animation:pulse 2s infinite;


}



@keyframes pulse{


50%{

transform:scale(1.4);

opacity:.5;

}


}



.logo{

width:100px;

height:100px;


border-radius:50%;


display:flex;

align-items:center;

justify-content:center;


font-size:45px;

font-weight:900;


border:3px solid red;


box-shadow:

0 0 30px red,
0 0 70px red;


margin-bottom:35px;


}



h1{


font-size:24px;

letter-spacing:4px;

text-align:center;


}



h1 span{

display:block;

color:#ff2020;

font-size:38px;


text-shadow:

0 0 20px red;


}




.loading-text{


margin-top:35px;

font-size:18px;


}



.bar{


margin-top:15px;


width:280px;

height:8px;


background:#222;


border-radius:20px;


overflow:hidden;


border:1px solid #444;


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

0 0 20px red;


transition:.1s;


}




.percent{

margin-top:12px;

font-weight:bold;


}



p{


margin-top:25px;

font-size:12px;


letter-spacing:5px;

color:#aaa;


}



`}</style>



    </div>


  );

}
