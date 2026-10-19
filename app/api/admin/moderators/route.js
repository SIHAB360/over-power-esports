import {createClient} from "@supabase/supabase-js";
import {NextResponse} from "next/server";
import {normalizeModeratorGrants} from "../../../lib/moderator-capabilities";
export const dynamic="force-dynamic";
const json=(data,status=200)=>NextResponse.json(data,{status,headers:{"Cache-Control":"private, no-store"}});
function clients(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,secret=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!anon||!secret)throw Object.assign(new Error("Moderator service not configured"),{status:503});
  return {auth:createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false}}),admin:createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}})};
}
async function mainAdmin(request){
 const token=request.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1];
 if(!token)throw Object.assign(new Error("Login required"),{status:401});
 const {auth,admin}=clients();const {data:{user},error}=await auth.auth.getUser(token);
 if(error||!user?.id)throw Object.assign(new Error("Login required"),{status:401});
 const [{data:trusted,error:trustedError},{data:profile,error:profileError}]=await Promise.all([
  admin.auth.admin.getUserById(user.id),admin.from("profiles").select("role").eq("id",user.id).maybeSingle()
 ]);
 // Only app_metadata is immutable to the logged-in user; profiles.role alone is insufficient.
 if(trustedError||profileError||trusted?.user?.app_metadata?.role!=="admin"||String(profile?.role).toLowerCase()!=="admin")
   throw Object.assign(new Error("Verified Main Admin access required"),{status:403});
 return {admin,user};
}
const errorResult=e=>json({message:e?.status?e.message:"Moderator service unavailable"},e?.status||503);
export async function GET(request){
 try{
  const {admin}=await mainAdmin(request);
  const [p,m,g,a,o]=await Promise.all([
   admin.from("players").select("user_id,full_name,ign,status").not("user_id","is",null).order("created_at",{ascending:false}).limit(500),
   admin.from("moderator_accounts").select("user_id,enabled,updated_at").limit(500),
   admin.from("moderator_permissions").select("user_id,section,action").limit(1500),
   admin.from("moderator_permission_audit").select("actor_id,user_id,old_enabled,new_enabled,old_permissions,new_permissions,created_at").order("created_at",{ascending:false}).limit(40),
   admin.from("moderator_operation_audit").select("actor_id,section,action,record_id,created_at").order("created_at",{ascending:false}).limit(40),
  ]);
  if(p.error||m.error||g.error||a.error||o.error)return json({message:"Moderator database migration not ready"},503);
  const modIds=new Set((m.data||[]).map(x=>x.user_id));
  // Keep existing moderators selectable for revocation, even if their player approval changed.
  const players=p.data||[];
  for(const id of modIds)if(!players.some(x=>x.user_id===id))players.push({user_id:id,full_name:"Former/hidden player",ign:"",status:"not-approved"});
  return json({players,moderators:m.data||[],grants:g.data||[],audit:a.data||[],operationAudit:o.data||[]});
 }catch(e){return errorResult(e)}
}
export async function POST(request){
 try{
  const {admin,user}=await mainAdmin(request);
  const body=await request.json().catch(()=>null);
  if(!body||typeof body.userId!=="string"||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.userId)||typeof body.enabled!=="boolean")return json({message:"Invalid moderator request"},400);
  if(user.id===body.userId)return json({message:"Cannot change your own Main Admin account"},403);
  let grants;try{grants=normalizeModeratorGrants(body.grants)}catch(e){return json({message:e.message},400)}
  if(body.enabled&&!grants.length)return json({message:"Choose at least one view permission"},400);
  if(!body.enabled&&grants.length)return json({message:"Remove grants before deactivation"},400);
  const {error}=await admin.rpc("admin_set_moderator_grants",{p_actor:user.id,p_user_id:body.userId,p_enabled:body.enabled,p_grants:grants});
  if(error)return json({message:"Moderator permissions could not be updated"},503);
  return json({saved:true});
 }catch(e){return errorResult(e)}
}
