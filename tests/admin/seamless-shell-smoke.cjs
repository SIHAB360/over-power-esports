// Synthetic browser checks for shared admin shell. No live database or payments.
const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const BASE='http://127.0.0.1:3156';
const API='https://op-ui-qa.invalid';
const UID='33333333-3333-4333-8333-333333333333';
const encode=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
const jwt=[
 encode({alg:'HS256',typ:'JWT'}),
 encode({sub:UID,aud:'authenticated',role:'authenticated',exp:Math.floor(Date.now()/1000)+36000}),
 'synthetic-signature'
].join('.');
const user={id:UID,email:'admin@qa-fixture.invalid',aud:'authenticated',
 role:'authenticated',app_metadata:{role:'admin',provider:'email'},user_metadata:{}};
const sess={access_token:jwt,refresh_token:'test-only',token_type:'bearer',
 expires_at:Math.floor(Date.now()/1000)+36000,expires_in:36000,user};
const json=(body,headers={})=>({status:200,contentType:'application/json',
 headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*',
 'access-control-expose-headers':'content-range',...headers},
 body:JSON.stringify(body)});
async function createPage(browser,width,height){
 const context=await browser.newContext({viewport:{width,height}});
 const page=await context.newPage();
 page.on('pageerror',error=>console.error('BROWSER ERROR',error.message));
 await page.addInitScript(({key,session})=>{
  localStorage.setItem(key,JSON.stringify(session));
  localStorage.setItem('op-analytics-consent-v1','no');
 },{key:'sb-op-ui-qa-auth-token',session:sess});
 await page.route(API+'/**',async route=>{
  const req=route.request(),url=new URL(req.url());
  if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:{
   'access-control-allow-origin':'*','access-control-allow-headers':'*',
   'access-control-allow-methods':'GET,POST,OPTIONS'}});
  if(url.pathname==='/auth/v1/user')return route.fulfill(json(user));
  if(url.pathname.startsWith('/auth/v1/'))return route.fulfill(json({}));
  if(url.pathname.startsWith('/rest/v1/')){
   const table=url.pathname.split('/').pop();
   if(table==='profiles')return route.fulfill(json({id:UID,role:'admin',email:user.email},
    {'content-range':'0-0/1'}));
   return route.fulfill(json([],
    {'content-range':'*/0'}));
  }
  return route.fulfill(json({}));
 });
 await page.route(BASE+'/api/**',route=>route.fulfill(json({rows:[],kpis:{},
  signIns:[],timeline:[],pages:[],devices:[],countries:[],sources:[],recent:[],trend:[]})));
 return {context,page};
}
async function ready(page,path,pattern){
 await page.goto(BASE+path,{waitUntil:'domcontentloaded'});
 const title=page.locator('main h1:visible').first();
 await title.waitFor({state:'visible',timeout:50000});
 const shown=(await title.textContent())||'';
 assert(shown.toUpperCase().includes(pattern.toUpperCase()),'Unexpected route heading: '+shown);
 await page.waitForTimeout(700);
}
async function assertRightScroll(page,standalone){
 const s=await page.evaluate(standalone=>{
  const e=standalone?document.querySelector('.op-admin-view'):
   document.querySelector('[data-op-right-scroll]');
  const side=standalone?document.querySelector('.op-admin-route-sidebar'):
   document.querySelector('[data-op-sidebar]');
  const nav=standalone?document.querySelector('.op-admin-route-links'):
   document.querySelector('[data-op-nav-scroll]');
  if(!e||!side||!nav)return null;
  const oldTop=side.getBoundingClientRect().top;
  e.scrollTop=Math.min(500,e.scrollHeight);
  return {height:e.getBoundingClientRect().height,scrollHeight:e.scrollHeight,
   top:side.getBoundingClientRect().top,oldTop,navOverflow:getComputedStyle(nav).overflowY,
   leftScrollbar:nav.scrollWidth-nav.clientWidth,bodyOverflow:document.documentElement.scrollWidth-innerWidth};
 },standalone);
 if(!s){
   console.error('DIAGNOSTIC',await page.evaluate(()=>({
    url:location.href,title:document.title,body:document.body?.innerText.slice(0,1000),
    dashboardElements:[...document.querySelectorAll('[class*="dashboard_"]')].slice(0,20).map(x=>x.className),
    html:document.documentElement.outerHTML.slice(0,500)
   })));
   throw Error('Could not locate app pane, sidebar and nav');
 }
 assert.equal(s.navOverflow,'hidden','Desktop sidebar must not have independent scrolling');
 assert(Math.abs(s.top-s.oldTop)<1,'Left rail should not move when right side scrolls');
 assert(s.height>200,'Right scroll pane must remain visible');
 assert(s.bodyOverflow<=3,'No page-wide horizontal overflow');
}
async function checkHeading(page){
 const a=await page.locator('main h1:visible').first().evaluate(n=>({
  text:n.textContent.trim(),align:getComputedStyle(n).textAlign
 }));
 assert.equal(a.align,'center',a.text+' should be horizontally centered');
}
async function run(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 let passed=0;
 try{
  for(const [width,height] of [[1536,864],[1024,768]]){
   const {context,page}=await createPage(browser,width,height);
   await ready(page,'/admin/dashboard','OVER POWER');
   await assertRightScroll(page,false);await checkHeading(page);passed++;
   const button=page.getByRole('button',{name:'Activate light mode'});
   await button.click();
   assert.equal(await page.locator('html').getAttribute('data-op-admin-theme'),'light');
   await ready(page,'/admin/players','PLAYER');
   await assertRightScroll(page,true);await checkHeading(page);
   assert.equal(await page.locator('html').getAttribute('data-op-admin-theme'),'light');
   passed++;
   await context.close();
  }
  const {context,page}=await createPage(browser,390,844);
  await ready(page,'/admin/dashboard','OVER POWER');
  await checkHeading(page);
  await page.getByRole('button',{name:'Open admin menu'}).click();
  const nav=page.locator('[data-op-sidebar]');
  await nav.waitFor({state:'visible',timeout:20000});
  assert.equal(await nav.evaluate(el=>getComputedStyle(el).visibility),'visible');
  assert.equal(await page.locator('html').evaluate(el=>el.scrollWidth-innerWidth)<=3,true);
  passed++;
  await ready(page,'/admin/players','PLAYER');
  await page.getByRole('button',{name:'Open admin navigation'}).click();
  await page.locator('.op-admin-route-sidebar.is-open').waitFor({state:'visible'});
  await checkHeading(page);passed++;
  await context.close();
  console.log('PASS '+passed+' responsive admin assertions (desktop, compact PC and mobile)');
 }finally{await browser.close()}
}
run().catch(e=>{console.error(e);process.exit(1)});
