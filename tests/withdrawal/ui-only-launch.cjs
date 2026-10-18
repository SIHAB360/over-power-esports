// UI-only Production Release: synthetic browser regression without live keys, wallet backend or payments.
const assert = require("node:assert/strict");
const { chromium } = require("playwright");

const BASE = "http://127.0.0.1:3145";
const API = "https://op-ui-qa.invalid";
const TOKEN_STORAGE = "sb-op-ui-qa-auth-token";
const PLAYER_ID = "11111111-1111-4111-8111-111111111111";
const PLAYER_USER = "22222222-2222-4222-8222-222222222222";
const ADMIN_USER = "33333333-3333-4333-8333-333333333333";
const REQUEST_ID = "44444444-4444-4444-8444-444444444444";
const LOGIN_PATH = "/login";

function jwtFor(userId) {
  function enc(value) {
    return Buffer.from(JSON.stringify(value)).toString("base64url");
  }
  return [
    enc({ alg:"HS256",typ:"JWT" }),
    enc({sub:userId,aud:"authenticated",role:"authenticated",exp:Math.floor(Date.now()/1000)+36000,iat:Math.floor(Date.now()/1000)}),
    "synthetic-signature-does-not-prove-identity",
  ].join(".");
}

function seedAuth(page, role) {
  if (role === "none") return;
  const id = role === "admin" ? ADMIN_USER : PLAYER_USER;
  const fakeUser = {
    id, aud:"authenticated", role:"authenticated",
    email: role+"@qa-fixture.invalid",
    app_metadata:{provider:"email",providers:["email"]},
    user_metadata:{}, created_at:"2026-01-01T00:00:00Z",
  };
  const session = {
    access_token:jwtFor(id), refresh_token:"synthetic-refresh-only",
    expires_in:36000, expires_at:Math.floor(Date.now()/1000)+36000,
    token_type:"bearer", user:fakeUser,
  };
  return page.addInitScript(({ key,value }) => {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, { key:TOKEN_STORAGE,value:session });
}
function asResponse(obj,code=200,headers={}) {
  return {
    status:code,
    contentType:"application/json; charset=utf-8",
    headers:{
      "access-control-allow-origin":"*",
      "access-control-allow-headers":"authorization,apikey,content-type,x-client-info,prefer",
      "access-control-allow-methods":"GET,POST,OPTIONS",
      "access-control-expose-headers":"content-range",
      ...headers,
    },
    body:JSON.stringify(obj),
  };
}
function newPendingRequest() {
  return {
    id:REQUEST_ID,player_id:PLAYER_ID,amount:2,
    status:"pending",provider:"bkash",receiver_number:"01711111111",
    created_at:"2026-10-17T16:00:00Z",updated_at:"2026-10-17T16:00:00Z",
    reviewed_at:null,paid_at:null,transfer_fee:null,net_payout:null,
    transaction_reference:null,rejection_reason:null,
  };
}
function fixture(page,role,options={}) {
  const state = {
    role, walletUnavailable:Boolean(options.walletUnavailable),
    withdrawals: options.initialRequest ? [newPendingRequest()] : [],
    submitted:0,approved:0,rejected:0,paid:0,unexpectedTransfers:0,
    seenPlayerWalletToken:false,seenAdminToken:false,
    generalApiHits:0,
  };
  const userId = role === "admin" ? ADMIN_USER : PLAYER_USER;
  const user = {
    id:userId, aud:"authenticated",role:"authenticated",
    email:role+"@qa-fixture.invalid",app_metadata:{provider:"email"},
    user_metadata:{},created_at:"2026-01-01T00:00:00Z",
  };

  page.route(API+"/**", async route => {
    const req = route.request(),url = new URL(req.url());
    if (req.method()==="OPTIONS") {
      return route.fulfill({status:204,headers:{
        "access-control-allow-origin":"*",
        "access-control-allow-methods":"GET,POST,OPTIONS",
        "access-control-allow-headers":"authorization,apikey,content-type,x-client-info,prefer",
      }});
    }
    if (url.pathname==="/auth/v1/user") return route.fulfill(asResponse(user));
    if (url.pathname.startsWith("/auth/v1/")) return route.fulfill(asResponse({}));
    if (url.pathname.startsWith("/realtime/")) return route.abort();

    if(url.pathname.startsWith("/rest/v1/")) {
      const table=url.pathname.split("/").pop();
      const accept=req.headers()["accept"]||"";
      const one=accept.includes("vnd.pgrst.object");
      const resp=(obj,size=0)=>route.fulfill(asResponse(obj,200,{"content-range":size?"0-"+(size-1)+"/"+size:"*/0"}));
      if(table==="profiles")return resp({role,email:user.email},1);
      if(table==="players"){
        const player={id:PLAYER_ID,user_id:PLAYER_USER,ign:"QA PLAYER",full_name:"Browser Fixture Player",
          email:"player@qa-fixture.invalid",status:"approved",verified:true,
          team_name:"QA TEAM",team_id:null,primary_role:"Assaulter",
          phone:null,profile_image:null,avatar_url:null,created_at:"2026-01-01T00:00:00Z",
          earnings:9,earning_percentage:70};
        return resp(one?player:[player],1);
      }
      if(table==="player_earnings")return resp([{amount:9}],1);
      if(table==="match_player_stats")return resp([],0);
      return resp([],0);
    }
    return route.fulfill(asResponse({message:"Unexpected fake endpoint"},404));
  });

  // A UI-only release must never contact any withdrawal endpoints.
  // Fail if the frontend accidentally attempts financial API communication.
  page.route(BASE+"/api/**",async route=>{
    state.unexpectedTransfers++;
    return route.fulfill(asResponse({message:"Financial backend not deployed"},503));
  });
  return state;
}
async function waitForText(page,match,timeout=55000) {
  await page.getByText(match).first().waitFor({state:"visible",timeout});
}
async function openRole(browser,role,width=1280,height=860,opts={}) {
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});
  const page=await context.newPage();
  await seedAuth(page,role);
  const state=fixture(page,role,opts);
  page.on("pageerror",err=>{
    // Always surface React render errors so tests cannot pass silently.
    console.error("PAGE JS ERROR:",String(err.message||err).slice(0,420));
  });
  return {context,page,state};
}

async function run() {
  const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const results=[];
  async function check(name,fn) {
    console.log("BEGIN",name);
    await fn();
    console.log("PASS",name);
    results.push(name);
  }
  try {
    await check("Unauthenticated Player redirects to Login",async()=>{
      const context=await browser.newContext(),page=await context.newPage();
      await page.goto(BASE+"/player/dashboard",{waitUntil:"domcontentloaded"});
      await page.waitForURL(u=>u.pathname===LOGIN_PATH,{timeout:45000});
      await context.close();
    });
    await check("Authenticated Player sees Wallet shortcut and fully locked finance UI",async()=>{
      const {page,context,state}=await openRole(browser,"player",1280,850);
      await page.goto(BASE+"/player/dashboard",{waitUntil:"domcontentloaded"});
      const button=page.getByRole("button",{name:/OPEN WITHDRAWAL WALLET/});
      await button.waitFor({state:"visible",timeout:45000});
      await button.click();
      const panel=page.locator("#player-withdrawal-preview");
      await panel.waitFor({state:"visible"});
      await waitForText(page,"WITHDRAWALS NOT YET ENABLED");
      const submit=panel.getByRole("button",{name:"WITHDRAWALS NOT YET ENABLED"});
      assert(await submit.isDisabled(),"No live withdrawal submit allowed");
      assert(await panel.getByRole("textbox",{name:/Withdrawal amount unavailable/i}).isDisabled());
      assert(await panel.getByRole("textbox",{name:/Receiver number unavailable/i}).isDisabled());
      assert.equal(state.unexpectedTransfers,0,"No API calls from locked Player wallet");
      await context.close();
    });
    await check("Mobile Player Wallet shortcut and locked panel fit screen",async()=>{
      const {page,context,state}=await openRole(browser,"player",390,844);
      await page.goto(BASE+"/player/dashboard",{waitUntil:"domcontentloaded"});
      const button=page.getByRole("button",{name:/OPEN WITHDRAWAL WALLET/});
      await button.waitFor({state:"visible",timeout:45000});
      await button.click();
      const panel=page.locator("#player-withdrawal-preview");
      const box=await panel.boundingBox();
      assert(box && box.width<=394 && box.x>=-4,"Mobile Wallet must not overflow viewport");
      assert(await panel.getByRole("button",{name:/WITHDRAWALS NOT YET ENABLED/}).isDisabled());
      assert.equal(state.unexpectedTransfers,0);
      await context.close();
    });
    await check("Non-admin Player cannot access Admin Dashboard",async()=>{
      const {page,context}=await openRole(browser,"player");
      await page.goto(BASE+"/admin/dashboard?section=salary",{waitUntil:"domcontentloaded"});
      await page.waitForURL(u=>u.pathname===LOGIN_PATH,{timeout:45000});
      await context.close();
    });
    await check("Unauthenticated Admin redirects to Login",async()=>{
      const context=await browser.newContext(),page=await context.newPage();
      await page.goto(BASE+"/admin/dashboard?section=salary",{waitUntil:"domcontentloaded"});
      await page.waitForURL(u=>u.pathname===LOGIN_PATH,{timeout:45000});
      await context.close();
    });
    await check("Admin overview visible shortcut navigates to locked Withdrawal Center",async()=>{
      const {page,context,state}=await openRole(browser,"admin");
      await page.goto(BASE+"/admin/dashboard",{waitUntil:"domcontentloaded"});
      const button=page.getByRole("button",{name:/Player Withdrawals.*bKash/}).first();
      await button.waitFor({state:"visible",timeout:45000});
      await button.click();
      await waitForText(page,"Withdrawal Control Center");
      await waitForText(page,"Withdrawal management is currently locked.");
      assert(await page.getByRole("button",{name:"APPROVE REQUEST"}).isDisabled());
      assert(await page.getByRole("button",{name:"REJECT REQUEST"}).isDisabled());
      assert(await page.getByRole("button",{name:"CONFIRM MANUAL PAID"}).isDisabled());
      assert.equal(state.unexpectedTransfers,0);
      await context.close();
    });
    await check("Admin Salary deep link preserved as locked Withdrawals",async()=>{
      const {page,context,state}=await openRole(browser,"admin");
      await page.goto(BASE+"/admin/dashboard?section=salary",{waitUntil:"domcontentloaded"});
      await waitForText(page,"Withdrawal Control Center");
      assert(await page.getByRole("button",{name:"CONFIRM MANUAL PAID"}).isDisabled());
      assert.equal(state.unexpectedTransfers,0);
      await context.close();
    });
    await check("Admin Withdrawals displays on mobile with no active controls",async()=>{
      const {page,context,state}=await openRole(browser,"admin",390,844);
      await page.goto(BASE+"/admin/dashboard?section=salary",{waitUntil:"domcontentloaded"});
      await waitForText(page,"Withdrawal Control Center");
      assert(await page.getByRole("button",{name:"APPROVE REQUEST"}).isDisabled());
      assert.equal(state.unexpectedTransfers,0);
      await context.close();
    });
    await check("No withdrawal endpoints were added to Next.js",async()=>{
      const paths=[
        ["/api/player/wallet","GET"],
        ["/api/player/withdrawals","POST"],
        ["/api/admin/withdrawals","GET"],
        ["/api/admin/withdrawals/review","POST"],
        ["/api/admin/withdrawals/confirm-payment","POST"],
      ];
      for(const [path,method] of paths){
        const response=await fetch(BASE+path,{method,...(method==="POST"?{headers:{"Content-Type":"application/json"},body:"{}"}:{})});
        assert.equal(response.status,404,path+" must not exist in UI-only release");
      }
    });
    console.log("ALL UI-ONLY BROWSER CHECKS PASSED:",results.length);
  } finally {
    await browser.close();
  }
}
run().catch(error=>{console.error("UI-ONLY RELEASE BROWSER FAILED:",error.stack||String(error));process.exit(1);});
