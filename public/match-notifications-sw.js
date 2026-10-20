/* Dedicated opt-in match schedule push service worker. */
self.addEventListener('push',event=>{
 let message={};
 try{message=event.data?.json()||{}}catch{message={title:'Match reminder',body:event.data?.text()||''}}
 const url=typeof message.url==='string'&&message.url.startsWith('/')&&!message.url.startsWith('//')
  ?message.url:'/player/dashboard#match-schedule';
 event.waitUntil(self.registration.showNotification(String(message.title||'OVER POWER Match Center').slice(0,90),{
  body:String(message.body||'Upcoming match schedule').slice(0,210),
  icon:'/contact-mascot.webp',badge:'/contact-mascot.webp',
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
