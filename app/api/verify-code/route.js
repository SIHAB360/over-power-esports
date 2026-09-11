import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);



export async function POST(request) {


  try {


    const { code } = await request.json();


    if (!code) {

      return NextResponse.json({
        success:false,
        message:"Code required"
      });

    }



    const cleanCode = code.trim().toUpperCase();



    const { data, error } = await supabase

      .from("registration_codes")

      .select("*")

      .eq("code", cleanCode)

      .single();

console.log("INPUT CODE:", cleanCode);
console.log("DATABASE DATA:", data);
console.log("DATABASE ERROR:", error);

    if (error || !data) {


      return NextResponse.json({

        success:false,

        message:"Invalid registration code"

      });


    }




    const now = new Date();

    const expiry = new Date(data.expires_at);



    if (expiry < now) {


      return NextResponse.json({

        success:false,

        message:"Registration code expired"

      });


    }




    return NextResponse.json({

      success:true,

      message:"Code verified"

    });



  } catch(error) {


    return NextResponse.json({

      success:false,

      message:error.message

    });


  }


}
