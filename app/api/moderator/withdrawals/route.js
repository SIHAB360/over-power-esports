import {moderatorJwtClient,moderatorJson,moderatorApiError} from '../../../lib/moderator-api-server';
export const dynamic='force-dynamic';
export async function GET(request){
 try{
  const q=new URL(request.url).searchParams;
  const filter=q.get('status')||null,rawPage=Number(q.get('page')||1);
  if((filter&&!['pending','approved','paid','rejected'].includes(filter))||!Number.isInteger(rawPage)||rawPage<1||rawPage>10000)
   return moderatorJson({message:'Invalid withdrawal filter'},400);
  const db=await moderatorJwtClient(request);
  const {data,error}=await db.rpc('moderator_withdrawal_queue',{p_status:filter,p_offset:(rawPage-1)*25});
  if(error)return moderatorApiError(error,'Unable to read withdrawal requests');
  return moderatorJson({...data,page:rawPage});
 }catch(e){return moderatorApiError(e)}
}
