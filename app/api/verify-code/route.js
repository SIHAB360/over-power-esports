import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";


const supabase = createClient(

process.env.NEXT_PUBLIC_SUPABASE_URL,

process.env.SUPABASE_SERVICE_ROLE_KEY

);



export async function POST(request){


try{


const { code } = await request.json();



if(!code){

return NextResponse.json({

success:false,

message:"Code required"

});

}




const { data, error } = await supabase

.from("registration_codes")

.select("*")

.eq("code",code)

.single();





if(error || !data){


return NextResponse.json({

success:false

});


}




const now = new Date();

const expiry = new Date(data.expires_at);




if(expiry < now){


return NextResponse.json({

success:false,

message:"Code expired"

});


}




return NextResponse.json({

success:true

});





}

catch(error){


return NextResponse.json({

success:false,

error:error.message

});


}


}
