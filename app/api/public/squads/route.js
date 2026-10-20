import {NextResponse} from 'next/server';
import {visitorAdminClient} from '../../../lib/visitor-server';

export const dynamic='force-dynamic';
export async function GET(){
 try{
  // Server returns only safe public presentation fields. Never expose admin
  // roster switches for pending/rejected players or confidential profile data.
  const db=visitorAdminClient();
  const [teams,players]=await Promise.all([
   db.from('teams').select('id,team_name,status,show_on_homepage').order('created_at'),
   db.from('players')
    .select('id,ign,full_name,team_id,team_name,profile_image,avatar_url,primary_role,facebook_link,instagram_link,youtube_link,tiktok_link,status,is_active')
    .order('created_at')
  ]);
  if(teams.error||players.error)throw Error('Unable to load public squads');
  const allowed=(teams.data||[]).filter(t=>t.show_on_homepage!==false
    && ['active','approved'].includes(String(t.status||'').toLowerCase()));
  const shown=(players.data||[]).filter(p=>p.is_active!==false
    && ['approved','active'].includes(String(p.status||'').toLowerCase()));
  const data=allowed.map(t=>({
   id:t.id,name:t.team_name,
   players:shown.filter(p=>p.team_id===t.id).map(p=>({
    id:p.id,name:p.ign||p.full_name||'PLAYER',
    role:p.primary_role||'PLAYER',image:p.profile_image||p.avatar_url||'/players/default.png',
    social:{
     facebook:p.facebook_link||'',instagram:p.instagram_link||'',
     youtube:p.youtube_link||'',tiktok:p.tiktok_link||''
    }
   }))
  }));
  return NextResponse.json({teams:data},{headers:{
    'Cache-Control':'no-store, max-age=0','X-Content-Type-Options':'nosniff'
  }});
 }catch{
  return NextResponse.json({message:'Squad overview temporarily unavailable'},{status:503,
    headers:{'Cache-Control':'no-store'}});
 }
}
