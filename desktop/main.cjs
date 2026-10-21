'use strict';
const {app,BrowserWindow,session,shell,Menu}=require('electron');
const path=require('node:path');
const HOME='https://over-power-esports.vercel.app/app';
const ORIGIN=new URL(HOME).origin;
let mainWindow;
function isOfficialUrl(raw){
 try{const u=new URL(raw);return u.protocol==='https:'&&u.origin===ORIGIN}catch{return false}
}
function externalOpen(raw){
 try{const u=new URL(raw);if(u.protocol==='https:'||u.protocol==='http:')shell.openExternal(raw).catch(()=>{})}catch{}
}
function makeWindow(){
 mainWindow=new BrowserWindow({
  width:1240,height:825,minWidth:365,minHeight:500,backgroundColor:'#0c1731',
  title:'OVER POWER ESPORTS',show:false,
  autoHideMenuBar:process.platform!=='darwin',
  webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,
   webSecurity:true,allowRunningInsecureContent:false,spellcheck:true,
   partition:'persist:over-power-esports'}
 });
 mainWindow.once('ready-to-show',()=>mainWindow?.show());
 const wc=mainWindow.webContents;
 wc.setWindowOpenHandler(({url})=>{
  if(isOfficialUrl(url))wc.loadURL(url).catch(()=>{});
  else externalOpen(url);
  return {action:'deny'};
 });
 wc.on('will-navigate',(event,url)=>{
  if(!isOfficialUrl(url)){event.preventDefault();externalOpen(url)}
 });
 wc.on('will-redirect',(event,url)=>{
  if(!isOfficialUrl(url)){event.preventDefault();externalOpen(url)}
 });
 wc.on('did-fail-load',(_event,code,_desc,url,isMainFrame)=>{
  if(!isMainFrame||code===-3||url.startsWith('file://'))return;
  if(mainWindow&&!mainWindow.isDestroyed())mainWindow.loadFile(path.join(__dirname,'offline.html')).catch(()=>{});
 });
 wc.on('page-title-updated',event=>{event.preventDefault();mainWindow?.setTitle('OVER POWER ESPORTS')});
 mainWindow.loadURL(HOME).catch(()=>{});
 mainWindow.on('closed',()=>{mainWindow=null});
}
app.whenReady().then(()=>{
 const s=session.fromPartition('persist:over-power-esports');
 // In-app match inbox works; desktop system-level push is not implemented.
 // No silent microphone/camera/notification permissions are granted.
 s.setPermissionRequestHandler((_wc,_permission,reply)=>reply(false));
 s.setPermissionCheckHandler(()=>false);
 if(process.platform==='darwin')Menu.setApplicationMenu(Menu.buildFromTemplate([
  {role:'appMenu'},{role:'editMenu'},{role:'viewMenu'},{role:'windowMenu'}
 ]));
 makeWindow();
 app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)makeWindow()});
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
