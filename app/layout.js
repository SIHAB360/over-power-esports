import "./globals.css";

import { Orbitron, Rajdhani } from "next/font/google";


const orbitron = Orbitron({

  subsets:["latin"],

  weight:[
    "400",
    "500",
    "700",
    "800",
    "900"
  ],

  variable:"--font-orbitron",

});



const rajdhani = Rajdhani({

  subsets:["latin"],

  weight:[
    "400",
    "500",
    "600",
    "700"
  ],

  variable:"--font-rajdhani",

});




export const metadata = {

  title: "Over Power Esports",

  description: "Victory is our Mission",

};




export default function RootLayout({ children }) {


return (

<html lang="en">


<head>

<link
rel="stylesheet"
href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
/>

</head>




<body className={`${orbitron.variable} ${rajdhani.variable}`}>

{children}

</body>




</html>

);

}
