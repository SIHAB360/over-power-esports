import {createClient} from "@supabase/supabase-js";
import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
export async function GET(request){
 const token=request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
 if(!token)return NextResponse.json({message:"Unauthorized"},{status:401});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,secret=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!anon||!secret)return NextResponse.json({message:"Staff access unavailable"},{status:503});
 const auth=createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:{user},error}=await auth.auth.getUser(token);
 if(error||!user)return NextResponse.json({message:"Unauthorized"},{status:401});
 const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error:queryError}=await admin.from("staff_access_grants").select("section,action").eq("user_id",user.id);
 if(queryError)return NextResponse.json({message:"Staff access is not enabled"},{status:503});
 return NextResponse.json({grants:data||[]},{headers:{"Cache-Control":"private, no-store"}});
}
