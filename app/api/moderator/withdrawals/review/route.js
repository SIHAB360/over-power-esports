import {moderatorJwtClient,moderatorJson,moderatorApiError,MODERATOR_ID} from '../../../../lib/moderator-api-server';
export const dynamic='force-dynamic';
export async function POST(request){
 try{
  const {id,requestId,decision,reason}=await request.json().catch(()=>({}));
  const target=id||requestId;
  if(!MODERATOR_ID.test(String(target||''))||!['approved','rejected'].includes(decision)||
    (decision==='rejected'&&(!String(reason||'').trim()||String(reason).length>350)))
   return moderatorJson({message:'Invalid withdrawal review'},400);
  const db=await moderatorJwtClient(request);
  const {data,error}=await db.rpc('moderator_review_player_withdrawal',{
    p_request_id:target,p_decision:decision,p_rejection_reason:decision==='rejected'?String(reason).trim():null});
  if(error)return moderatorApiError(error,'Withdrawal review failed');
  return moderatorJson(data||{ok:true});
 }catch(e){return moderatorApiError(e)}
}
