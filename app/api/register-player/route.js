import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";


const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);


export async function POST(request){

  try{

    const body = await request.json();


    const { data, error } = await supabase
      .from("players")
      .insert([body])
      .select();


    if(error){

      return NextResponse.json({
        success:false,
        message:error.message
      });

    }


    return NextResponse.json({
      success:true,
      data
    });


  }catch(error){

    return NextResponse.json({
      success:false,
      message:error.message
    });

  }

}
