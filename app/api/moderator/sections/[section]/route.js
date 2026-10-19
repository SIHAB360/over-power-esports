import {createClient} from "@supabase/supabase-js";
import {NextResponse} from "next/server";
import {isSupportedModeratorAction} from "../../../../lib/moderator-capabilities";
export const dynamic="force-dynamic";
const send=(body,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
async function authorizedClient(request){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 const token=request.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1];
 if(!token)throw {status:401,message:"লগইন প্রয়োজন"};
 if(!url||!key)throw {status:503,message:"Moderator service unavailable"};
 const auth=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:{user},error}=await auth.auth.getUser(token);
 if(error||!user?.id)throw {status:401,message:"সেশন শেষ হয়েছে"};
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:`Bearer ${token}`}}});
}
async function handler(request,context,action){
 try{
  const {section}=await context.params;
  if(!isSupportedModeratorAction(section,action))return send({message:"এই কাজ এখনো চালু হয়নি"},403);
  const db=await authorizedClient(request);
  if(action==='view'){
   const choices=section==='matches'&&new URL(request.url).searchParams.get('kind')==='team-choices';
   const {data,error}=await (choices?db.rpc('moderator_match_team_choices'):db.rpc('moderator_list_section',{p_section:section}));
   if(error)return send({message:error.code==='42501'?"এই সেকশনের অনুমতি নেই":"তথ্য লোড করা যাচ্ছে না"},error.code==='42501'?403:503);
   return send({section,records:Array.isArray(data)?data:[]});
  }
  const body=await request.json().catch(()=>null);
  if(!body||typeof body!=="object"||Array.isArray(body)||!body.data||typeof body.data!=="object"||Array.isArray(body.data))return send({message:"অবৈধ ফর্ম"},400);
  const id=action==='edit'?body.recordId:null;
  if(action==='edit'&&(!UUID.test(String(id||""))))return send({message:"বৈধ রেকর্ড আইডি প্রয়োজন"},400);
  if(action==='create'&&body.recordId!=null)return send({message:"নতুন রেকর্ডে আইডি দেওয়া যাবে না"},400);
  const {data,error}=await db.rpc('moderator_write_section',{p_section:section,p_action:action,p_record_id:id,p_payload:body.data});
  if(error)return send({message:error.code==='42501'?"এই কাজের অনুমতি নেই":error.code==='22023'?"তথ্য যাচাই করুন":"সংরক্ষণ করা যাচ্ছে না"},error.code==='42501'?403:error.code==='22023'?400:503);
  return send({saved:true,record:data});
 }catch(e){return send({message:e.status?e.message:"Moderator request failed"},e.status||503)}
}
export async function GET(request,context){return handler(request,context,'view')}
export async function POST(request,context){return handler(request,context,'create')}
export async function PATCH(request,context){return handler(request,context,'edit')}
