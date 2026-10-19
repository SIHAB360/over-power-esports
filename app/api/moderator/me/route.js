import {createClient} from "@supabase/supabase-js";
import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
const json=(b,s=200)=>NextResponse.json(b,{status:s,headers:{"Cache-Control":"private, no-store"}});
export async function GET(request){
 const token=request.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1];if(!token)return json({message:"Login required"},401);
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,secret=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!anon||!secret)return json({message:"Moderator service unavailable"},503);
 const auth=createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:{user},error}=await auth.auth.getUser(token);if(error||!user)return json({message:"Login required"},401);
 const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 const [membership,player]=await Promise.all([
  admin.from("moderator_accounts").select("enabled").eq("user_id",user.id).maybeSingle(),
  admin.from("players").select("status").eq("user_id",user.id).eq("status","approved").maybeSingle()
 ]);
 if(membership.error||player.error)return json({message:"Moderator service unavailable"},503);
 if(!membership.data?.enabled||!player.data)return json({message:"Moderator access not enabled"},403);
 const {data,error:permissionError}=await admin.from("moderator_permissions").select("section,action").eq("user_id",user.id).limit(60);
 if(permissionError)return json({message:"Moderator access unavailable"},503);
 return json({enabled:true,permissions:data||[]});
}
