import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
export const dynamic="force-dynamic";
const reply=(body,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"no-store"}});
async function context(request){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL, key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 const secret=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key||!secret)return {failure:reply({message:"Staff service not configured"},503)};
 const token=request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
 if(!token)return {failure:reply({message:"Authentication required"},401)};
 const auth=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:{user},error}=await auth.auth.getUser(token);
 if(error||!user)return {failure:reply({message:"Authentication required"},401)};
 const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:profile,error:roleError}=await admin.from("profiles").select("role").eq("id",user.id).maybeSingle();
 if(roleError||profile?.role?.toLowerCase()!=="admin")return {failure:reply({message:"Only main admin can manage staff"},403)};
 return {admin,user};
}
export async function GET(request){
 const ctx=await context(request);if(ctx.failure)return ctx.failure;
 const {data,error}=await ctx.admin.from("staff_permissions").select("user_id,match_view,match_create,match_edit,updated_at").order("updated_at",{ascending:false}).limit(100);
 if(error)return reply({message:"Staff permission storage unavailable"},503);
 return reply({permissions:data||[]});
}
export async function POST(request){
 const ctx=await context(request);if(ctx.failure)return ctx.failure;
 const body=await request.json().catch(()=>null);
 if(!body||typeof body.userId!=="string"||!/^[0-9a-f-]{36}$/i.test(body.userId)||!["view","create","edit"].every(k=>typeof body[k]==="boolean"))
   return reply({message:"Invalid staff permission"},400);
 if((body.create||body.edit)&&!body.view)return reply({message:"View permission is required for create/edit"},400);
 if(body.userId===ctx.user.id)return reply({message:"Admin permissions cannot be edited here"},400);
 const {data:player,error:playerError}=await ctx.admin.from("players").select("id").eq("user_id",body.userId).eq("status","approved").maybeSingle();
 if(playerError||!player)return reply({message:"Approved registered player required"},400);
 const {error}=await ctx.admin.from("staff_permissions").upsert({
   user_id:body.userId,match_view:body.view,match_create:body.create,match_edit:body.edit,
   updated_at:new Date().toISOString(),granted_by:ctx.user.id
 },{onConflict:"user_id"});
 if(error)return reply({message:"Could not save permissions"},503);
 return reply({saved:true});
}
