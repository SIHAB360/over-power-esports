import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";
import PlayerRegister from "./PlayerRegister";

function validToken(token) {
  if (!token || !process.env.REGISTRATION_SESSION_SECRET) return false;

  const dot = token.lastIndexOf(".");
  if (dot === -1) return false;

  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);

  const expected = crypto
    .createHmac("sha256", process.env.REGISTRATION_SESSION_SECRET)
    .update(payload)
    .digest("hex");

  if (signature.length !== expected.length) return false;

  if (
    !crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    )
  ) {
    return false;
  }

  const expiry = Number(payload.split(".").pop());
  return expiry > Date.now();
}

export default async function Page() {
  const token = (await cookies()).get("registration_verified")?.value;

  if (!validToken(token)) {
    redirect("/register");
  }

  return <PlayerRegister />;
}
