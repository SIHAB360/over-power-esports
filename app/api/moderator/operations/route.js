import {moderatorJwtClient,moderatorJson,moderatorApiError,MODERATOR_ID} from '../../../lib/moderator-api-server';
import {isSupportedModeratorAction} from '../../../lib/moderator-capabilities';
export const dynamic='force-dynamic';
// Only explicitly audited operations. Never accept a client-supplied table name.
const ALLOWED={matches:['delete'],teams:['edit'],tournaments:['edit'],players:['approve'],
 profit:['delete'],achievements:['create','edit','delete','approve']};
export async function POST(request){
 try{
  const content=request.headers.get('content-length');
  if(content && Number(content)>18000)return moderatorJson({message:'Payload too large'},413);
  const body=await request.json().catch(()=>null);
  if(!body||typeof body!=='object'||Array.isArray(body))return moderatorJson({message:'Invalid operation'},400);
  const {section,action,id,data={}}=body;
  if(!ALLOWED[section]?.includes(action)||!isSupportedModeratorAction(section,action))return moderatorJson({message:'Operation unavailable'},403);
  if(action!=='create'&&!MODERATOR_ID.test(String(id||'')))return moderatorJson({message:'Invalid record'},400);
  if(action==='create' && id!=null)return moderatorJson({message:'Create may not specify record ID'},400);
  if(!data||typeof data!=='object'||Array.isArray(data))return moderatorJson({message:'Invalid operation data'},400);
  const db=await moderatorJwtClient(request);
  const {data:record,error}=await db.rpc('moderator_delegate_action',{p_section:section,p_action:action,
    p_record_id:action==='create'?null:id,p_payload:data});
  if(error)return moderatorApiError(error,'Unable to save delegated action');
  return moderatorJson({saved:true,record});
 }catch(e){return moderatorApiError(e)}
}
