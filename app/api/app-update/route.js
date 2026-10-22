export const dynamic='force-dynamic';
// Public, read-only update manifest. Never publish a link until a real signed APK exists.
export async function GET(){
 try{
  const response=await fetch('https://api.github.com/repos/SIHAB360/over-power-esports/releases/latest',{
   headers:{Accept:'application/vnd.github+json','User-Agent':'OverPowerEsports-AppUpdate'},
   next:{revalidate:300}
  });
  if(!response.ok)return Response.json({available:false},{headers:{'Cache-Control':'no-store'}});
  const release=await response.json();
  const asset=release.assets?.find(item=>item.name==='over-power-esports.apk'&&item.state==='uploaded');
  const match=/^android-v(\d+)\.(\d+)\.(\d+)$/.exec(release.tag_name||'');
  if(!asset||!match||!asset.browser_download_url?.startsWith('https://github.com/SIHAB360/over-power-esports/releases/download/'))
   return Response.json({available:false},{headers:{'Cache-Control':'no-store'}});
  const versionCode=Number(match[1])*10000+Number(match[2])*100+Number(match[3]);
  return Response.json({available:true,version:match.slice(1).join('.'),versionCode,downloadUrl:asset.browser_download_url,notes:release.body?.slice(0,300)||''},{headers:{'Cache-Control':'public, max-age=0, s-maxage=300'}});
 }catch{return Response.json({available:false},{headers:{'Cache-Control':'no-store'}})}
}
