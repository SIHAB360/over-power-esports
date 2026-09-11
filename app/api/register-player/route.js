import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";


const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);



export async function POST(request){

  try{


    const formData = await request.formData();


    const profileImage = formData.get("profile_image");
    const gameScreenshot = formData.get("game_id_screenshot");



    let profileImageUrl = null;
    let gameScreenshotUrl = null;



    // Upload Profile Image

    if(profileImage && profileImage.size > 0){


      const fileName =
      `profile-${Date.now()}-${profileImage.name}`;



      const { error } = await supabase.storage
      .from("player-images")
      .upload(fileName, profileImage);



      if(error){

        throw error;

      }



      const { data } =
      supabase.storage
      .from("player-images")
      .getPublicUrl(fileName);



      profileImageUrl = data.publicUrl;


    }




    // Upload Game Screenshot

    if(gameScreenshot && gameScreenshot.size > 0){


      const fileName =
      `game-${Date.now()}-${gameScreenshot.name}`;



      const { error } = await supabase.storage
      .from("game-screenshots")
      .upload(fileName, gameScreenshot);



      if(error){

        throw error;

      }



      const { data } =
      supabase.storage
      .from("game-screenshots")
      .getPublicUrl(fileName);



      gameScreenshotUrl = data.publicUrl;


    }




    const playerData = {


      full_name: formData.get("full_name"),

      ign: formData.get("ign"),

      freefire_uid: formData.get("freefire_uid"),

      email: formData.get("email"),

      phone: formData.get("phone"),

      age: formData.get("age"),

      birth_date: formData.get("birth_date"),

      primary_role: formData.get("primary_role"),

      secondary_role: formData.get("secondary_role"),

      device: formData.get("device"),

      internet_connection: formData.get("internet_connection"),

      practice_time: formData.get("practice_time"),

      game_experience: formData.get("game_experience"),

      tournament_experience: formData.get("tournament_experience"),

      joining_date: formData.get("joining_date"),

      average_br_kd_rate: formData.get("average_br_kd_rate"),

      expert_weapon: formData.get("expert_weapon"),

      previous_team: formData.get("previous_team"),

      social_media_link: formData.get("social_media_link"),

      full_address: formData.get("full_address"),

      team_name: formData.get("team_name"),


      profile_image: profileImageUrl,

      game_id_screenshot: gameScreenshotUrl


    };





    const { data, error } = await supabase
    .from("players")
    .insert([playerData])
    .select();




    if(error){

      throw error;

    }




    return NextResponse.json({

      success:true,

      data

    });



  }
  catch(error){


    return NextResponse.json({

      success:false,

      message:error.message

    });


  }


}
