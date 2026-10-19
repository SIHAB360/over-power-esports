import {createClient} from '@supabase/supabase-js';
import {NextResponse} from 'next/server';

export const moderatorJson=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}});
export const MODERATOR_ID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function moderatorJwtClient(request){
 const token=request.headers.get('authorization')?.match(/^Bearer\s+(\S+)$/i)?.[1];
 if(!token)throw Object.assign(new Error('Sign in to continue'),{status:401});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)throw Object.assign(new Error('Moderator service is unavailable'),{status:503});
 const auth=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:{user},error}=await auth.auth.getUser(token);
 if(error||!user?.id)throw Object.assign(new Error('Your sign-in has expired'),{status:401});
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:`Bearer ${token}`}}});
}

export function moderatorApiError(error,defaultMessage='Unable to complete request'){
 if(error?.status)return moderatorJson({message:error.message},error.status);
 const code=error?.code;
 return moderatorJson({message:code==='42501'?'Permission denied or account disabled':
   ['22023','23505','P0002','22P02','23503'].includes(code)?error.message:defaultMessage},
   code==='42501'?403:['22023','23505','P0002','22P02','23503'].includes(code)?400:503);
}
