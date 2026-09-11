import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const formData = await request.formData();

    const requiredFields = [
      "full_name",
      "ign",
      "freefire_uid",
      "email",
      "phone",
      "age",
      "birth_date",
      "primary_role",
      "secondary_role",
      "device",
      "internet_connection",
      "practice_time",
      "game_experience",
      "tournament_experience",
      "joining_date",
      "average_br_kd_rate",
      "expert_weapon",
      "previous_team",
      "full_address",
      "team_name",
      "facebook_link", // শুধু Facebook required
    ];

    for (const field of requiredFields) {
      const value = formData.get(field);
      if (!value || value.toString().trim() === "") {
        return NextResponse.json({
          success: false,
          message: `${field} is required`,
        });
      }
    }

    const profileImage = formData.get("profile_image");
    const gameScreenshot = formData.get("game_id_screenshot");

    if (!profileImage || profileImage.size === 0) {
      return NextResponse.json({
        success: false,
        message: "Profile image is required",
      });
    }

    if (!gameScreenshot || gameScreenshot.size === 0) {
      return NextResponse.json({
        success: false,
        message: "Game ID screenshot is required",
      });
    }

    // Upload profile image
    const profileFileName = `profile-${Date.now()}-${profileImage.name}`;
    const { error: profileError } = await supabase.storage
      .from("player-images")
      .upload(profileFileName, profileImage);

    if (profileError) {
      throw profileError;
    }

    const { data: profileURL } = supabase.storage
      .from("player-images")
      .getPublicUrl(profileFileName);

    // Upload game screenshot
    const screenshotFileName = `game-${Date.now()}-${gameScreenshot.name}`;
    const { error: screenshotError } = await supabase.storage
      .from("game-screenshots")
      .upload(screenshotFileName, gameScreenshot);

    if (screenshotError) {
      throw screenshotError;
    }

    const { data: screenshotURL } = supabase.storage
      .from("game-screenshots")
      .getPublicUrl(screenshotFileName);

    const playerData = {
      full_name: formData.get("full_name"),
      ign: formData.get("ign"),
      freefire_uid: formData.get("freefire_uid"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      age: Number(formData.get("age")),
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
      full_address: formData.get("full_address"),
      team_name: formData.get("team_name"),

      // নতুন সোশ্যাল মিডিয়া ফিল্ড
      facebook_link: formData.get("facebook_link"),
      instagram_link: formData.get("instagram_link") || null,
      tiktok_link: formData.get("tiktok_link") || null,
      youtube_link: formData.get("youtube_link") || null,

      profile_image: profileURL.publicUrl,
      game_id_screenshot: screenshotURL.publicUrl,
    };

    const { data, error } = await supabase
      .from("players")
      .insert([playerData])
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Registration Successful",
      data,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}
