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
  e.style.scrollBehavior='auto';
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
 assert.equal(s.navOverflow,'auto','Only the middle nav must allow native, bounded scrolling');
 assert(Math.abs(s.top-s.oldTop)<1,'Left rail should not move when right side scrolls');
 assert(s.height>200,'Right scroll pane must remain visible');
 assert(s.bodyOverflow<=3,'No page-wide horizontal overflow');
}

async function assertMenuOnlyScroll(page,standalone,requireOverflow=false){
 const navSelector=standalone?'.op-admin-route-links':'[data-op-nav-scroll]';
 const menu=page.locator(navSelector);
 const before=await page.evaluate(standalone=>{
  const nav=document.querySelector(standalone?'.op-admin-route-links':'[data-op-nav-scroll]');
  const rail=document.querySelector(standalone?'.op-admin-route-sidebar':'[data-op-sidebar]');
  const footer=document.querySelector(standalone?'.op-admin-route-bottom':'[data-op-sidebar-foot]');
  const brand=document.querySelector(standalone?'.op-admin-route-brand':'[data-op-sidebar-top]');
  const right=document.querySelector(standalone?'.op-admin-view':'[data-op-right-scroll]');
  right.style.scrollBehavior='auto';right.scrollTop=0;
  nav.scrollTop=0;
  return {available:nav.scrollHeight-nav.clientHeight,brandTop:brand.getBoundingClientRect().top,
   footerTop:footer.getBoundingClientRect().top,railTop:rail.getBoundingClientRect().top,
   rightTop:right.scrollTop,navTop:nav.getBoundingClientRect().top};
 },standalone);
 if(requireOverflow)assert(before.available>20,'Short desktop must contain overflowed menu options');
 if(before.available>3){
  await menu.hover();
  await page.mouse.wheel(0,540);
  await page.waitForTimeout(200);
  const after=await page.evaluate(standalone=>{
   const nav=document.querySelector(standalone?'.op-admin-route-links':'[data-op-nav-scroll]');
   const rail=document.querySelector(standalone?'.op-admin-route-sidebar':'[data-op-sidebar]');
   const footer=document.querySelector(standalone?'.op-admin-route-bottom':'[data-op-sidebar-foot]');
   const brand=document.querySelector(standalone?'.op-admin-route-brand':'[data-op-sidebar-top]');
   const right=document.querySelector(standalone?'.op-admin-view':'[data-op-right-scroll]');
   return {menuScroll:nav.scrollTop,rightScroll:right.scrollTop,
    brandTop:brand.getBoundingClientRect().top,footerTop:footer.getBoundingClientRect().top,
    railTop:rail.getBoundingClientRect().top,navTop:nav.getBoundingClientRect().top};
  },standalone);
  assert(after.menuScroll>3,'Wheel on menu must reveal lower menu options');
  assert.equal(after.rightScroll,before.rightTop,'Scrolling menu must not move the right pane');
  for(const key of ['brandTop','footerTop','railTop','navTop'])
   assert(Math.abs(before[key]-after[key])<=1,key+' must remain stationary');
  await menu.evaluate(nav=>{nav.scrollTop=nav.scrollHeight});
  const lastVisible=await page.evaluate(standalone=>{
   const menu=document.querySelector(standalone?'.op-admin-route-links':'[data-op-nav-scroll]');
   const label=standalone?'.op-admin-route-link:last-child':'[data-op-visitors-link]';
   const link=menu.querySelector(label),linkBox=link?.getBoundingClientRect();
   const navBox=menu.getBoundingClientRect();
   return !!linkBox && linkBox.bottom<=navBox.bottom+5 && linkBox.top>=navBox.top-5;
  },standalone);
  assert(lastVisible,'Visitor Analytics / final menu option must be fully reachable');
 }
}


async function checkSidebarTypeface(page,standalone){
 const style=await page.evaluate(standalone=>{
  const root=document.querySelector(standalone?'.op-admin-route-sidebar':'[data-op-sidebar]');
  const label=root?.querySelector('[data-op-nav-label]');
  const brand=root?.querySelector(standalone?'.op-admin-route-brand strong':'[data-op-brand-title]');
  if(!label||!brand)return null;
  const labelCss=getComputedStyle(label),brandCss=getComputedStyle(brand);
  return {labelFont:labelCss.fontFamily,brandFont:brandCss.fontFamily,
    size:parseFloat(labelCss.fontSize),labelWidth:label.scrollWidth,
    availableWidth:label.clientWidth};
 },standalone);
 assert(style,'Missing sidebar decorative font landmarks');
 assert(style.labelFont.includes('Varesco')&&style.labelFont.includes('Archivo Black'),
  'Admin sidebar must use Varesco-style heavy sans with an OFL fallback');
 assert(style.brandFont.includes('Varesco'),'Admin brand must use the matching heavy display family');
 assert(style.size>=11,'Small heavy sans labels should remain readable');
 assert(style.labelWidth<=style.availableWidth+4,'Bold menu text should wrap instead of clipping');
}

async function checkHeading(page){
 const a=await page.locator('main h1:visible').first().evaluate(n=>({
  text:n.textContent.trim(),align:getComputedStyle(n).textAlign
 }));
 assert.equal(a.align,'center',a.text+' should be horizontally centered');
}

async function checkImmersiveHeader(page,desktop=true){
  const details=await page.evaluate(()=>{
    const root=document.querySelector('.op-admin-route-layout');
    const header=document.querySelector('[data-op-hero]');
    const rail=document.querySelector('[data-op-sidebar]');
    const main=document.querySelector('[data-op-right-scroll]');
    const slot=document.querySelector('[data-op-theme-slot]');
    const theme=document.querySelector('.op-admin-theme-tools');
    const cards=[...document.querySelectorAll('[data-op-stat-card]')];
    const navItems=[...document.querySelectorAll('[data-op-admin-nav-item]')];
    if(!header||!rail||!main||!slot||!theme)return null;
    const rb=x=>{let r=x.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom}};
    return {
      shell:rb(root),header:rb(header),rail:rb(rail),main:rb(main),
      theme:rb(theme),inSlot:slot.contains(theme),
      accents:navItems.map(x=>getComputedStyle(x).getPropertyValue('--op-item').trim()),
      cardBeam:cards.length?getComputedStyle(cards[0],'::after').animationName:'',
      navBeam:navItems.length?getComputedStyle(navItems[0],'::before').animationName:'',
      xOverflow:document.documentElement.scrollWidth-innerWidth
    };
  });
  assert(details,'Admin hero, sidebar or theme slot missing');
  assert(details.inSlot,'Appearance switch must be docked inside the hero');
  assert(details.theme.top>=details.header.top-2 && details.theme.bottom<=details.header.bottom+2,
    'Appearance switch has escaped the hero and creates a top gutter');
  assert(details.xOverflow<=3,'Immersive layout should not cause horizontal scrolling');
  assert(new Set(details.accents).size>=5,'Sidebar must have at least five distinct lighting accent colors');
  assert(details.cardBeam.includes('op-light-pass'),'Stat cards should contain a traveling inner light');
  assert(details.navBeam.includes('op-beam-turn'),'Navigation should use a rotating multicolor border');
  if(desktop){
    assert(Math.abs(details.shell.top)<=2,'The shared shell must begin at top of viewport');
    assert(Math.abs(details.rail.top)<=2,'Desktop sidebar must meet top of screen');
    assert(Math.abs(details.rail.right-details.main.left)<=2,'Sidebar must directly touch right content');
    assert(details.header.top<=40,'Main hero should not sit below an empty top strip');
  }
}


async function testRosterAndMatchLineup(browser){
 const {context,page}=await createPage(browser,1440,860);
 const t1='aaaa1111-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 const t2='bbbb2222-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
 const squads=[
  {id:t1,team_name:'Over Power Main Team',status:'active',show_on_homepage:true},
  {id:t2,team_name:'Over Power Elite',status:'active',show_on_homepage:true}
 ];
 const people=Array.from({length:9},(_,i)=>({
  id:'0000000'+(i+1)+'-0000-4000-8000-00000000000'+(i+1),
  user_id:'a000000'+(i+1)+'-0000-4000-8000-00000000000'+(i+1),
  full_name:'Player '+(i+1),ign:'QA Player '+(i+1),
  team_id:i<6?t1:t2,team_name:i<6?squads[0].team_name:squads[1].team_name,
  is_active:true,status:'approved',primary_role:'Rusher',
  profile_image:null,avatar_url:null
 }));
 const send=(r,body)=>r.fulfill(json(body));
 await page.route(BASE+'/api/admin/roster',async route=>{
  const req=route.request();
  if(req.method()==='GET')return send(route,{teams:squads,players:people});
  const body=req.postDataJSON();
  if(body.action==='player_active'){
   let p=people.find(p=>p.id===body.playerId);p.is_active=body.active;
   return send(route,{updated:{id:p.id,is_active:p.is_active}});
  }
  if(body.action==='squad_visibility'){
   let t=squads.find(t=>t.id===body.teamId);t.show_on_homepage=body.visible;
   return send(route,{updated:{id:t.id,show_on_homepage:t.show_on_homepage}});
  }
  if(body.action==='move_player'){
   let p=people.find(p=>p.id===body.playerId);
   p.team_id=body.teamId;p.team_name=squads.find(t=>t.id===body.teamId)?.team_name||null;
   return send(route,{updated:{id:p.id,team_id:p.team_id,team_name:p.team_name}});
  }
  return route.fulfill(json({message:'Invalid fixture action'}));
 });
 await page.route(API+'/rest/v1/teams*',r=>send(r,squads));
 await page.route(API+'/rest/v1/players*',r=>{
  const url=new URL(r.request().url());
  const team=url.searchParams.get('team_id')?.replace(/^eq\./,'');
  return send(r,team?people.filter(p=>p.team_id===team&&p.is_active):people);
 });
 try{
  await ready(page,'/admin/roster','PLAYER ACTIVITY');
  assert.equal(await page.locator('.op-roster-player').count(),9);
  await page.getByRole('button',{name:'Deactivate QA Player 1'}).click();
  await page.getByRole('button',{name:'Activate QA Player 1'}).waitFor();
  assert.equal(people[0].is_active,false);
  await page.getByRole('button',{name:'Hide Over Power Elite on homepage'}).click();
  await page.getByRole('button',{name:'Show Over Power Elite on homepage'}).waitFor();
  assert.equal(squads[1].show_on_homepage,false);
  const transferSaved=page.waitForResponse(r=>r.url().endsWith('/api/admin/roster')&&r.request().method()==='POST'&&r.request().postDataJSON().action==='move_player');
  await page.getByRole('combobox',{name:'Assign QA Player 2 to squad'}).selectOption(t2);
  await transferSaved;
  assert.equal(people[1].team_id,t2);
  await ready(page,'/admin/matches','MATCH');
  await page.locator('select[name="team1_id"]').selectOption(t1);
  await page.locator('.squad-player-checkbox').first().waitFor({state:'visible'});
  const boxes=page.locator('.squad-player-checkbox');
  assert.equal(await boxes.count(),4,'Remaining active main squad players should all appear');
  // Return the transferred member and reactivate the original one: six
  // available squad members, of whom only four can be chosen.
  people[1].team_id=t1;
  people[0].is_active=true;
  await page.locator('select[name="team1_id"]').selectOption(t2);
  await page.locator('select[name="team1_id"]').selectOption(t1);
  await page.waitForTimeout(350);
  assert.equal(await boxes.count(),6,'All six current squad members should appear');
  for(let i=0;i<4;i++)await boxes.nth(i).check();
  assert.equal(await page.locator('.squad-player-checkbox:checked').count(),4);
  assert.equal(await page.locator('.performance-row').count(),4);
  await boxes.nth(4).click(); // deliberately rejected: four are already selected
  assert.equal(await page.locator('.squad-player-checkbox:checked').count(),4,
   'Fifth player must not replace the selected four');
  console.log('PASS admin roster toggles, squad transfers, full roster and checked lineup');
 }finally{await context.close()}
}

async function run(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 let passed=0;
 try{
  for(const [width,height] of [[1536,864],[1024,670]]){
   const {context,page}=await createPage(browser,width,height);
   await ready(page,'/admin/dashboard','OVER POWER');
   await assertRightScroll(page,false);
   await checkSidebarTypeface(page,false);await assertMenuOnlyScroll(page,false,width===1024);
   await checkHeading(page);
   await checkImmersiveHeader(page,true);passed++;
   const button=page.getByRole('button',{name:'Activate light mode'});
   await button.click();
   assert.equal(await page.locator('html').getAttribute('data-op-admin-theme'),'light');
   await ready(page,'/admin/players','PLAYER');
   await assertRightScroll(page,true);
   await checkSidebarTypeface(page,true);await assertMenuOnlyScroll(page,true,width===1024);
   await checkHeading(page);
   assert.equal(await page.locator('html').getAttribute('data-op-admin-theme'),'light');
   passed++;
   await context.close();
  }
  const {context,page}=await createPage(browser,390,844);
  await ready(page,'/admin/dashboard','OVER POWER');
  await checkHeading(page);
  await checkImmersiveHeader(page,false);
  await checkSidebarTypeface(page,false);
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
  await testRosterAndMatchLineup(browser);
  console.log('PASS '+passed+' responsive admin assertions (desktop, compact PC and mobile)');
 }finally{await browser.close()}
}
run().catch(e=>{console.error(e);process.exit(1)});
