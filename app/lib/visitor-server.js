import {createClient} from '@supabase/supabase-js';
// No privileged client is initialized while Next.js gathers build-time route config.
let client;
export function visitorAdminClient(){
 if(client)return client;
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL;
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)throw Object.assign(new Error('Visitor server credentials unavailable'),{status:503});
 client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 return client;
}
