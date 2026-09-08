"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";


export default function ProfileLoader({id}){


const router = useRouter();

const [loading,setLoading] = useState(false);



function openProfile(){

setLoading(true);


setTimeout(()=>{

router.push(`/players/${id}`);

},1200);


}



return(

<>


<button
className="profile-btn"
onClick={openProfile}
>

View Profile

</button>



{

loading &&

<div className="profile-loading">


<div className="loader-content">


<div className="loader-circle"></div>


<h2>
LOADING PROFILE
</h2>


<p>
Preparing Player Data...
</p>


</div>


</div>


}


</>

)


}
