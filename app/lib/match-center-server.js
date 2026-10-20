import {visitorAdminClient} from './visitor-server';

export const noStore={'Cache-Control':'private, no-store, max-age=0'};
export class HttpError extends Error{constructor(message,status=400){super(message);this.status=status}}
export const errResponse=e=>Response.json({message:e instanceof HttpError?e.message:'Match Center temporarily unavailable'},{status:e instanceof HttpError?e.status:500,headers:noStore});
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function identity(req,admin=false){
 const token=req.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
 if(!token)throw new HttpError('Please sign in.',401);
 const db=visitorAdminClient();
 const {data,error}=await db.auth.getUser(token);
 if(error||!data?.user?.id)throw new HttpError('Session expired.',401);
 const user=data.user;
 const {data:profile,error:pe}=await db.from('profiles').select('role').eq('id',user.id).maybeSingle();
 if(pe)throw new HttpError('Unable to verify account.',503);
 const role=String(profile?.role||'').toLowerCase();
 if(admin&&role!=='admin')throw new HttpError('Main Admin only.',403);
 if(!admin&&role!=='player'&&role!=='admin')throw new HttpError('Player access required.',403);
 return {db,user,role};
}
export async function playerFor(db,userId){
 const {data,error}=await db.from('players').select('id,team_id,status,is_active').eq('user_id',userId).maybeSingle();
 if(error||!data||data.status!=='approved'||!data.is_active)throw new HttpError('Approved active player account required.',403);
 return data;
}
export const goodUuid=v=>typeof v==='string'&&uuid.test(v);
export const sanitizeSchedule=r=>({
 id:r.id,title:r.title,starts_at:r.starts_at,entry_fee:Number(r.entry_fee),
 prize_pool:r.prize_pool,lobby_details:r.lobby_details,notes:r.notes,
 team_id:r.team_id,status:r.status,created_at:r.created_at
});
export async function recipients(db,teamId){
 let q=db.from('players').select('user_id').eq('status','approved').eq('is_active',true).not('user_id','is',null);
 if(teamId)q=q.eq('team_id',teamId);
 const {data,error}=await q.limit(1000);
 if(error)throw new HttpError('Unable to load player recipients.',503);
 return [...new Set((data||[]).map(p=>p.user_id).filter(Boolean))];
}
export function scheduleInput(input){
 const title=String(input?.title||'').trim(),prize=String(input?.prize_pool||'').trim(),
  details=String(input?.lobby_details||'').trim(),notes=String(input?.notes||'').trim();
 // Format yyyy-mm-ddThh:mm is a local Bangladesh wall clock; +06:00 required.
 const wall=String(input?.local_time||'');
 if(!/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(wall))throw new HttpError('Enter a valid Bangladesh date and time.');
 const dt=new Date(wall+':00+06:00');
 if(!Number.isFinite(dt.getTime())||new Date(dt.getTime()+6*3600000).toISOString().slice(0,16)!==wall)
   throw new HttpError('Invalid Bangladesh date or time.');
 if(dt.getTime()<Date.now()+2*60000||dt.getTime()>Date.now()+365*86400000)
   throw new HttpError('Schedule matches at least 2 minutes ahead and within one year.');
 const fee=Number(input?.entry_fee);
 if(!Number.isFinite(fee)||fee<0||fee>1000000||Math.round(fee*100)!==fee*100)throw new HttpError('Enter a valid entry fee.');
 if(title.length<3||title.length>120||prize.length>160||details.length>500||notes.length>1000)
   throw new HttpError('Match title, prize or notes exceed allowed length.');
 if(input.team_id!=null&&!goodUuid(input.team_id))throw new HttpError('Invalid squad.');
 return {title,starts_at:dt.toISOString(),entry_fee:fee,prize_pool:prize||'—',
  lobby_details:details,notes,team_id:input.team_id||null};
}
