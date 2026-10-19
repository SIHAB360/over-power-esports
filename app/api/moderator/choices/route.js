import {moderatorJwtClient,moderatorJson,moderatorApiError} from '../../../lib/moderator-api-server';
export const dynamic='force-dynamic';
export async function GET(request){
 try{
  const section=new URL(request.url).searchParams.get('section');
  if(!['teams','tournaments'].includes(section))return moderatorJson({message:'Unsupported management section'},400);
  const db=await moderatorJwtClient(request);
  const {data,error}=await db.rpc('moderator_roster_choices',{p_section:section});
  if(error)return moderatorApiError(error,'Management options unavailable');
  return moderatorJson(data||{});
 }catch(e){return moderatorApiError(e)}
}