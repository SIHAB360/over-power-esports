import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Supabase environment variables missing",
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await request.json();
    const cleanCode = String(body?.code || "")
      .trim()
      .toUpperCase();

    if (!cleanCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Code required",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("registration_codes")
      .select("*")
      .eq("code", cleanCode)
      .maybeSingle();

    if (error) {
      console.error("SUPABASE ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Database verification error",
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid registration code",
        },
        { status: 400 }
      );
    }

    if (data.expires_at) {
      const expiry = new Date(data.expires_at);

      if (!Number.isNaN(expiry.getTime()) && expiry <= new Date()) {
        return NextResponse.json(
          {
            success: false,
            message: "Registration code expired",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Code verified",
    });
  } catch (error) {
    console.error("VERIFY CODE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}
