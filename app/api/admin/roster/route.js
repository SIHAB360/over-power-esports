import {NextResponse} from 'next/server';
import {visitorAdminClient} from '../../../lib/visitor-server';

export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store, max-age=0'};
const respond=(body,status=200)=>NextResponse.json(body,{status,headers});
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function requireMainAdmin(request){
 const token=request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
 if(!token)throw Object.assign(new Error('Sign in as Main Admin first.'),{status:401});
 const db=visitorAdminClient();
 const {data:{user},error}=await db.auth.getUser(token);
 if(error||!user?.id)throw Object.assign(new Error('Admin session expired.'),{status:401});
 const {data:profile,error:profileError}=await db.from('profiles').select('role').eq('id',user.id).maybeSingle();
 if(profileError)throw Object.assign(new Error('Unable to verify Main Admin access.'),{status:503});
 if(String(profile?.role||'').toLowerCase()!=='admin')
  throw Object.assign(new Error('Only Main Admin can edit roster controls.'),{status:403});
 return db;
}
function fail(error){
 return respond({message:error?.status?error.message:'Roster update failed. Please retry.'},error?.status||500);
}
export async function GET(request){
 try{
  const db=await requireMainAdmin(request);
  const [teams,players]=await Promise.all([
   db.from('teams').select('id,team_name,status,show_on_homepage,logo').order('team_name'),
   db.from('players').select('id,ign,full_name,team_id,team_name,status,is_active,primary_role,profile_image,avatar_url').order('created_at')
  ]);
  if(teams.error||players.error)throw Object.assign(new Error('Could not load roster.'),{status:503});
  return respond({teams:teams.data||[],players:players.data||[]});
 }catch(e){return fail(e)}
}
export async function POST(request){
 try{
  const db=await requireMainAdmin(request);
  const body=await request.json().catch(()=>null);
  if(!body||typeof body!=='object')return respond({message:'Invalid action payload.'},400);
  if(body.action==='player_active'){
   if(!uuid.test(String(body.playerId||''))||typeof body.active!=='boolean')
    return respond({message:'Player and active state required.'},400);
   const {data,error}=await db.from('players').update({is_active:body.active})
    .eq('id',body.playerId).select('id,is_active').maybeSingle();
   if(error)return respond({message:error.message},400);
   if(!data)return respond({message:'Player not found.'},404);
   return respond({updated:data});
  }
  if(body.action==='squad_visibility'){
   if(!uuid.test(String(body.teamId||''))||typeof body.visible!=='boolean')
    return respond({message:'Squad and visibility required.'},400);
   const {data,error}=await db.from('teams').update({show_on_homepage:body.visible})
    .eq('id',body.teamId).select('id,show_on_homepage').maybeSingle();
   if(error)return respond({message:error.message},400);
   if(!data)return respond({message:'Squad not found.'},404);
   return respond({updated:data});
  }
  if(body.action==='move_player'){
   if(!uuid.test(String(body.playerId||''))||
      (body.teamId!==null&&!uuid.test(String(body.teamId||''))))
    return respond({message:'Valid player and destination squad required.'},400);
   // Team ID and legacy display name are updated together, so homepage, Teams
   // and Match Center read the same roster. Historical matches remain unchanged.
   let teamName=null;
   if(body.teamId){
    const {data:team,error}=await db.from('teams').select('team_name').eq('id',body.teamId).maybeSingle();
    if(error||!team)return respond({message:'Destination squad not found.'},404);
    teamName=team.team_name;
   }
   const {data,error}=await db.from('players').update({team_id:body.teamId,team_name:teamName})
    .eq('id',body.playerId).select('id,team_id,team_name').maybeSingle();
   if(error)return respond({message:error.message},400);
   if(!data)return respond({message:'Player not found.'},404);
   return respond({updated:data});
  }
  return respond({message:'Unsupported roster action.'},400);
 }catch(e){return fail(e)}
}
