import {moderatorJwtClient,moderatorJson,moderatorApiError,MODERATOR_ID} from '../../../../lib/moderator-api-server';
export const dynamic='force-dynamic';
export async function POST(request){
 try{
  const {id,transferFee,reference,note,confirmed}=await request.json().catch(()=>({}));
  if(!MODERATOR_ID.test(String(id||''))||!confirmed||!Number.isFinite(Number(transferFee))||Number(transferFee)<0||
    String(reference||'').trim().length<5||String(reference||'').trim().length>100)
   return moderatorJson({message:'Manual payout requires confirmed transfer and reference'},400);
  const db=await moderatorJwtClient(request);
  const {data,error}=await db.rpc('moderator_confirm_manual_withdrawal',{
    p_request_id:id,p_transfer_fee:Number(transferFee),p_transaction_reference:String(reference).trim(),
    p_payment_note:String(note||'').trim()||null});
  if(error)return moderatorApiError(error,'Unable to confirm manual payout');
  return moderatorJson(data||{ok:true});
 }catch(e){return moderatorApiError(e)}
}
