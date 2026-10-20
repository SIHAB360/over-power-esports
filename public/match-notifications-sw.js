/* OVER POWER ESPORTS PWA worker
 * Private dashboards, auth responses, APIs and finance data stay NETWORK ONLY.
 * Explicit push permission is controlled by the authenticated player UI.
 */
const STATIC_CACHE='op-public-static-v1';
const OFFLINE_PAGE='/offline.html';
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(STATIC_CACHE).then(cache=>cache.add(OFFLINE_PAGE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(Promise.all([
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('op-public-static-')&&k!==STATIC_CACHE).map(k=>caches.delete(k)))),
  self.clients.claim()
 ]));
});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin)return;
 if(request.mode==='navigate'){
  // Never cache HTML responses; particularly important for authenticated
  // player/admin screens, which must always load the current deployment.
  event.respondWith(fetch(request).catch(async()=>{
   return await caches.match(OFFLINE_PAGE)||Response.error();
  }));
  return;
 }
 if(url.pathname.startsWith('/api/')||url.pathname.startsWith('/auth/')
    ||url.pathname.includes('/_next/data/'))return;
 const isStatic=url.pathname.startsWith('/_next/static/')
   || /\.(png|jpe?g|webp|svg|gif|ico|woff2?)$/i.test(url.pathname)
   || /^\/pwa-icon\/(192|512)$/.test(url.pathname);
 if(!isStatic)return;
 // Network first to reflect new branding and player/team images immediately.
 // Only public static asset responses may be kept for offline reuse.
 event.respondWith(fetch(request).then(response=>{
  if(response.ok&&response.type==='basic'&&!response.headers.has('set-cookie')){
   const copy=response.clone();
   event.waitUntil(caches.open(STATIC_CACHE).then(cache=>cache.put(request,copy)));
  }
  return response;
 }).catch(()=>caches.match(request).then(r=>r||Response.error())));
});
self.addEventListener('push',event=>{
 let message={};
 try{message=event.data?.json()||{}}catch{message={title:'Match reminder',body:event.data?.text()||''}}
 const url=typeof message.url==='string'&&message.url.startsWith('/')&&!message.url.startsWith('//')
  ?message.url:'/player/dashboard#match-schedule';
 event.waitUntil(self.registration.showNotification(String(message.title||'OVER POWER Match Center').slice(0,90),{
  body:String(message.body||'Upcoming match schedule').slice(0,210),
  icon:'/pwa-icon/192',badge:'/pwa-icon/192',
  tag:String(message.tag||'match-schedule'),
  data:{url},renotify:true,vibrate:[130,65,130]
 }));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const path=event.notification.data?.url||'/player/dashboard#match-schedule';
 event.waitUntil((async()=>{
  const target=new URL(path,self.location.origin);
  const list=await clients.matchAll({type:'window',includeUncontrolled:true});
  for(const client of list){
   try{if(new URL(client.url).origin===target.origin){
     await client.focus();await client.navigate(target.href);return;
   }}catch{}
  }
  await clients.openWindow(target.href);
 })());
});
