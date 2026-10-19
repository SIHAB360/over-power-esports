import {moderatorJwtClient,moderatorJson,moderatorApiError} from '../../../lib/moderator-api-server';
export const dynamic='force-dynamic';
export async function GET(request){
 try{
  const db=await moderatorJwtClient(request);
  const {data,error}=await db.rpc('moderator_verification_codes');
  if(error)return moderatorApiError(error,'Could not load verification codes');
  return moderatorJson(data||{codes:[]});
 }catch(error){return moderatorApiError(error)}
}
