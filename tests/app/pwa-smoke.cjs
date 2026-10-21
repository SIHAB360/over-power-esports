'use strict';
const assert=require('node:assert/strict');
const base=process.env.APP_TEST_BASE||'http://127.0.0.1:3158';
async function get(path){
 const res=await fetch(base+path,{redirect:'manual',headers:{'Cache-Control':'no-cache'}});
 return res;
}
(async()=>{
 const manifest=await get('/manifest.webmanifest');
 assert.equal(manifest.status,200,'PWA manifest must be served');
 const m=await manifest.json();
 assert.equal(m.name,'OVER POWER ESPORTS');
 assert.equal(m.start_url,'/app');
 assert.equal(m.display,'standalone');
 assert(m.icons?.some(i=>i.sizes==='192x192'&&i.type==='image/png'));
 assert(m.icons?.some(i=>i.sizes==='512x512'&&i.type==='image/png'));
 for(const size of [192,512]){
  const image=await get('/pwa-icon/'+size);
  assert.equal(image.status,200,'PNG icon '+size+' must be served');
  const bytes=new Uint8Array(await image.arrayBuffer());
  assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10],'Icon needs a real PNG header');
 }
 const officialLogo=await get('/over-power-logo.png');
 assert.equal(officialLogo.status,200,'Original homepage brand logo must be served');
 const brandBytes=new Uint8Array(await officialLogo.arrayBuffer());
 assert.deepEqual([...brandBytes.subarray(0,8)],[137,80,78,71,13,10,26,10]);
 const offline=await get('/offline.html');
 assert.equal(offline.status,200);
 assert((await offline.text()).includes('offline'));
 const worker=await get('/match-notifications-sw.js');
 assert.equal(worker.status,200);
 const sw=await worker.text();
 assert(sw.includes("addEventListener('push'"),'Existing match push handler preserved');
 assert(sw.includes('caches.open'),'PWA offline fallback is provided');
 assert(sw.includes("request.mode==='navigate'"),'Navigation must stay network-first');
 assert(sw.includes("url.pathname.startsWith('/api/')"),'Sensitive APIs must never be cached');
 const software=await get('/app');
 assert.equal(software.status,200,'Dedicated software home should exist');
 const appHtml=await software.text();
 assert(appHtml.includes('OVER POWER')||appHtml.includes('account'),'App has its own branded view');
 const unauth=await get('/api/software/overview');
 assert.equal(unauth.status,401,'Private software overview must require login');
 const install=await get('/install');
 assert.equal(install.status,200,'Cross-device install route');
 const installHtml=await install.text();
 assert(installHtml.includes('Windows PC')&&installHtml.includes('iPhone'),'Must show multiple platform support');
 const links=await get('/.well-known/assetlinks.json');
 assert.equal(links.status,404,'Unsigned build cannot falsely publish a trusted-app relationship');
 console.log('PASS cross-platform PWA: manifest, PNG icons, offline safety, push, device installer, signing protections');
})().catch(e=>{console.error(e);process.exit(1)});
