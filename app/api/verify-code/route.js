import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export async function POST(request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const sessionSecret = process.env.REGISTRATION_SESSION_SECRET;

    if (!supabaseUrl || !supabaseKey || !sessionSecret) {
      return NextResponse.json(
        {
          success: false,
          message: "Server configuration error",
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

    const expiresAt = Date.now() + 30 * 60 * 1000;
    const payload = `verified.${expiresAt}`;

    const signature = crypto
      .createHmac("sha256", sessionSecret)
      .update(payload)
      .digest("hex");

    const token = `${payload}.${signature}`;

    const response = NextResponse.json({
      success: true,
      message: "Code verified",
    });

    response.cookies.set("registration_verified", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 60,
      path: "/",
    });

    return response;
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
