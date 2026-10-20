import {timingSafeEqual} from 'node:crypto';
import {visitorAdminClient} from '../../../lib/visitor-server';
import {flushPush} from '../../../lib/match-push-server';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export const maxDuration=60;
export async function POST(req){
 const expected=process.env.MATCH_CRON_SECRET;
 const supplied=req.headers.get('authorization')?.replace(/^Bearer\s+/i,'')||'';
 if(!expected||Buffer.byteLength(expected)!==Buffer.byteLength(supplied)||
   !timingSafeEqual(Buffer.from(expected),Buffer.from(supplied)))
  return Response.json({message:'Unauthorized'},{status:401});
 try{
  const db=visitorAdminClient();
  const {data:created,error}=await db.rpc('op_claim_due_match_reminders');
  if(error)throw error;
  const delivery=await flushPush(db,220);
  return Response.json({newNotifications:(created||[]).length,...delivery},{
    headers:{'Cache-Control':'no-store'}
  });
 }catch(e){
  console.error('Match reminder worker failed',e.message);
  return Response.json({message:'Reminder worker unavailable'},{status:503});
 }
}
export async function GET(){
 return Response.json({message:'Use signed scheduled POST'},{status:405});
}
