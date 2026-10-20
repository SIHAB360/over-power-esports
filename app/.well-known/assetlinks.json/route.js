// Android Digital Asset Links must be bound to a REAL release signing
// certificate (Google Play App Signing certificate for Play builds).
// Do not emit fake or debug SHA-256 fingerprints.
export const dynamic='force-dynamic';
const sha256=/^([0-9A-F]{2}:){31}[0-9A-F]{2}$/;
export function GET(){
 const fingerprints=String(process.env.ANDROID_TWA_SHA256_FINGERPRINTS||'')
  .split(',').map(x=>x.trim().toUpperCase()).filter(Boolean);
 if(!fingerprints.length||fingerprints.some(s=>!sha256.test(s))){
  return Response.json({error:'Android app certificate not configured'},{status:404,
   headers:{'Cache-Control':'no-store'}});
 }
 return Response.json([{
  relation:['delegate_permission/common.handle_all_urls'],
  target:{namespace:'android_app',package_name:'com.overpower.esports',
   sha256_cert_fingerprints:[...new Set(fingerprints)]}
 }],{headers:{'Cache-Control':'public, max-age=3600'}});
}
