'use strict';
// Fully synthetic E2E tests; no real players, credentials, payments or phone push.
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const BASE='http://127.0.0.1:3158',SUPABASE='https://op-app-qa.invalid';
const UID='55555555-5555-4555-8555-555555555555';
const encode=v=>Buffer.from(JSON.stringify(v)).toString('base64url');
const jwt=[encode({alg:'HS256',typ:'JWT'}),encode({
 sub:UID,aud:'authenticated',role:'authenticated',exp:Math.floor(Date.now()/1000)+36000
}),'synthetic-qa-only'].join('.');
const usr={id:UID,email:'qa-user@fixture.invalid',aud:'authenticated',
 role:'authenticated',app_metadata:{provider:'email'},user_metadata:{}};
const sess={access_token:jwt,refresh_token:'qa-never-real',token_type:'bearer',
 expires_at:Math.floor(Date.now()/1000)+36000,expires_in:36000,user:usr};
const json=body=>({status:200,contentType:'application/json',headers:{
 'access-control-allow-origin':'*','access-control-allow-headers':'*',
 'access-control-allow-methods':'GET,POST,PATCH,OPTIONS',
 'access-control-expose-headers':'content-range'},
 body:JSON.stringify(body)});
async function contextFor(browser,role,viewport){
 const ctx=await browser.newContext({viewport});
 const page=await ctx.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 if(role)await page.addInitScript(({sess})=>{
  localStorage.setItem('sb-op-app-qa-auth-token',JSON.stringify(sess));
  localStorage.setItem('op-analytics-consent-v1','no');
 },{sess});
 await page.route(SUPABASE+'/**',async route=>{
  const url=new URL(route.request().url());
  if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers:{
   'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'GET,POST,OPTIONS'}});
  if(url.pathname==='/auth/v1/user')return route.fulfill(json(usr));
  if(url.pathname.startsWith('/auth/v1/'))return route.fulfill(json(sess));
  if(url.pathname.endsWith('/profiles'))return route.fulfill(json({id:UID,role}));
  if(url.pathname.endsWith('/players'))return route.fulfill(json([]));
  return route.fulfill(json([]));
 });
 const fixture={id:'77777777-7777-4777-8777-777777777781',title:'QA Main Squad Lobby',
  status:'published',starts_at:new Date(Date.now()+86400000).toISOString(),
  entry_fee:85,prize_pool:'৳8,000 DISPLAY ONLY',lobby_details:'Bermuda BR',
  team_id:null,notes:'Arrive early'};
 const alerts=[{id:'88888888-8888-4888-8888-888888888881',schedule_id:fixture.id,
  event_key:'created',created_at:new Date().toISOString(),read_at:null}];
 let marked=0;
 await page.route(BASE+'/api/**',route=>route.fulfill(json({rows:[],wallet:{
  available_balance:0,total_earnings:0,pending_withdrawals:0
 },history:[],success:true})));
 await page.route(BASE+'/api/software/overview',route=>{
  if(!role)return route.fulfill({status:401,...json({message:'Please sign in'})});
  return route.fulfill(json(role==='admin'?{
   role,profile:{full_name:'QA Admin',email:usr.email,role},
   counts:{players:9,teams:2,matches:26,tournaments:3,op_match_schedules:1}
  }:{
   role,profile:{full_name:'QA Player',email:usr.email,role},
   player:{status:'approved',is_active:true,ign:'Rusher One',verified:true,
    team_name:'Main Squad',matches_played:24,wins:5,total_kills:82},
   team:{name:'Main Squad',description:'Verified QA squad',coach_name:'Coach'},
   tournaments:[{id:'77777777-7777-4777-8777-777777777782',name:'OP Cup',
    status:'upcoming',start_date:'2026-10-30',prize_pool:5000}]
  }));
 });
 await page.route(BASE+'/api/player/match-schedules',route=>{
  if(route.request().method()==='PATCH'){
   marked++;
   alerts[0].read_at=new Date().toISOString();
   return route.fulfill(json({ok:true}));
  }
  return route.fulfill(json({schedules:[fixture],inbox:alerts,unread:alerts.filter(a=>!a.read_at).length}));
 });
 await page.route(BASE+'/api/player/match-subscription',route=>route.fulfill(json({
  subscribed:false,vapidPublicKey:null
 })));
 await page.route(BASE+'/api/admin/match-schedules',route=>route.fulfill(json({
  schedules:[],teams:[],notified:0
 })));
 return {ctx,page,errors,marked:()=>marked};
}
async function testSignedOut(browser){
 const {ctx,page,errors}=await contextFor(browser,null,{width:390,height:844});
 try{
  await page.goto(BASE+'/app',{waitUntil:'domcontentloaded'});
  await page.getByRole('heading',{name:'Sign in to your account'}).waitFor({timeout:45000});
  assert(await page.getByLabel('Email Address').isVisible());
  assert(await page.getByRole('button',{name:/Sign In Securely/}).isVisible());
  assert.equal(await page.getByText('WE ARE OVER POWER').count(),0,
   'App entry screen must not show website landing content');
  assert.equal(await page.locator('.op-app-bottom').count(),0,
   'Logged out users must never see private app navigation');
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('PASS dedicated standalone software login gate');
 }finally{await ctx.close()}
}
async function testPlayer(browser){
 const {ctx,page,errors,marked}=await contextFor(browser,'player',{width:390,height:844});
 try{
  await page.goto(BASE+'/app',{waitUntil:'domcontentloaded'});
  await page.getByRole('heading',{name:'Rusher One'}).waitFor({timeout:45000});
  assert.equal(await page.locator('.op-app-bottom button').count(),5);
  assert(await page.getByText('Main Squad', {exact:false}).first().isVisible());
  assert(await page.getByText('QA Main Squad Lobby').first().isVisible());
  await page.locator('.op-app-bottom').getByRole('button',{name:'Matches'}).click();
  await page.getByRole('heading',{name:'My Match Center'}).waitFor();
  assert(await page.getByText('৳8,000 DISPLAY ONLY').first().isVisible());
  await page.locator('.op-app-bottom').getByRole('button',{name:'Inbox'}).click();
  await page.getByRole('heading',{name:'Notification Inbox'}).waitFor();
  await page.getByText('New Match Published').first().click();
  await page.getByRole('heading',{name:'My Match Center'}).waitFor();
  assert.equal(marked(),1,'Reading a match alert must use authenticated PATCH');
  await page.locator('.op-app-bottom').getByRole('button',{name:'Wallet'}).click();
  await page.getByRole('heading',{name:'My Wallet'}).waitFor();
  await page.locator('.op-software-wallet').waitFor({state:'visible',timeout:15000});
  assert(await page.locator('.op-software-wallet').isVisible(),
   'Real existing withdrawal component should mount inside app shell');
  await page.locator('.op-app-bottom').getByRole('button',{name:'Profile'}).click();
  assert(await page.getByText('qa-user@fixture.invalid').isVisible());
  const over=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert(over<=3,'Mobile app must not overflow horizontally: '+over);
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('PASS mobile: player home, real match, notice read, wallet and profile');
 }finally{await ctx.close()}
}
async function testAdmin(browser){
 const {ctx,page,errors}=await contextFor(browser,'admin',{width:1365,height:860});
 try{
  await page.goto(BASE+'/app',{waitUntil:'domcontentloaded'});
  await page.getByRole('heading',{name:'ADMIN'}).waitFor({timeout:45000});
  assert(await page.getByText('26',{exact:true}).count()>0);
  assert(await page.locator('.op-app-sidebar').isVisible());
  await page.locator('.op-app-side-links').getByRole('button',{name:'Modules'}).click();
  await page.getByRole('heading',{name:'Software Management'}).waitFor();
  await page.locator('.op-app-feature-grid').getByRole('button',{name:/Match Schedule/}).click();
  await page.getByRole('heading',{name:'Match Schedule Center'}).waitFor({timeout:45000});
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('PASS desktop: admin role home and actual management module rendered INSIDE app');
 }finally{await ctx.close()}
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{await testSignedOut(browser);await testPlayer(browser);await testAdmin(browser)}
 finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
