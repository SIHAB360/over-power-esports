import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function uploadFile(file, bucket) {
  if (!file || file.size === 0) return null;

  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return data.publicUrl;
}


export async function POST(request) {
  try {
    const formData = await request.formData();

    const profileImage = formData.get("profile_image");
    const gameScreenshot = formData.get("game_id_screenshot");

    const profileImageUrl = await uploadFile(
      profileImage,
      "player-images"
    );

    const screenshotUrl = await uploadFile(
      gameScreenshot,
      "game-screenshots"
    );


    const playerData = {};

    for (const [key, value] of formData.entries()) {

      if (
        key !== "profile_image" &&
        key !== "game_id_screenshot"
      ) {
        playerData[key] = value;
      }
    }


    if (profileImageUrl) {
      playerData.profile_image = profileImageUrl;
      playerData.avatar_url = profileImageUrl;
    }

    if (screenshotUrl) {
      playerData.game_id_screenshot = screenshotUrl;
    }


    const { data, error } = await supabase
      .from("players")
      .insert(playerData)
      .select()
      .single();


    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 400 }
      );
    }


    return NextResponse.json(
      {
        success: true,
        message: "Registration Successful",
        data,
      },
      { status: 200 }
    );


  } catch (error) {

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Server error",
      },
      { status: 500 }
    );

  }
}
