// Layout-only Chromium UI regression. All users, wallets and provider transactions
// below are synthetic and intercepted in Playwright. NO production writes.
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

  page.route(BASE+"/api/**",async route=>{
    const req=route.request(),url=new URL(req.url());
    const authorized=String(req.headers()["authorization"]||"").startsWith("Bearer ");
    const json=(o,code)=>route.fulfill(asResponse(o,code));
    if(url.pathname==="/api/player/wallet" && req.method()==="GET"){
      state.seenPlayerWalletToken=authorized;
      if(!authorized)return json({message:"Authentication required"},401);
      if(state.walletUnavailable)return json({message:"Withdrawals not ready"},503);
      const active=state.withdrawals.filter(x=>x.status==="pending"||x.status==="approved").reduce((v,x)=>v+x.amount,0);
      const paid=state.withdrawals.filter(x=>x.status==="paid").reduce((v,x)=>v+x.amount,0);
      return json({wallet:{
        all_time_earnings:9,total_loss:0,net_earnings:9,reserved_withdrawals:active,
        paid_withdrawals:paid,available_balance:9-active-paid,
      },withdrawals:state.withdrawals.slice().reverse()});
    }
    if(url.pathname==="/api/player/withdrawals" && req.method()==="POST"){
      if(!authorized)return json({message:"Authentication required"},401);
      const body=req.postDataJSON();
      assert.equal(body.provider,"bkash");
      assert.equal(body.amount,"2");
      assert.equal(body.receiverNumber,"01711111111");
      state.submitted++;
      state.withdrawals=[newPendingRequest()];
      return json({requestId:REQUEST_ID,status:"pending"},201);
    }
    if(url.pathname==="/api/admin/withdrawals" && req.method()==="GET"){
      state.seenAdminToken=authorized;
      if(!authorized)return json({message:"Authentication required"},401);
      const status=url.searchParams.get("status");
      return json({
        requests:state.withdrawals.filter(x=>!status||x.status===status),
        total:state.withdrawals.filter(x=>!status||x.status===status).length,
        page:1,
        counts:Object.fromEntries(["pending","approved","rejected","paid"].map(k=>
          [k,state.withdrawals.filter(x=>x.status===k).length])),
      });
    }
    if(url.pathname==="/api/admin/withdrawals/review" && req.method()==="POST"){
      assert(authorized);
      const body=req.postDataJSON();
      assert.equal(body.requestId,REQUEST_ID);
      if(body.decision==="approved"){
        state.approved++;state.withdrawals[0].status="approved";
        state.withdrawals[0].reviewed_at="2026-10-17T17:00:00Z";
      } else {
        state.rejected++;state.withdrawals[0].status="rejected";
        state.withdrawals[0].rejection_reason=body.reason;
      }
      return json({status:state.withdrawals[0].status});
    }
    if(url.pathname==="/api/admin/withdrawals/confirm-payment" && req.method()==="POST"){
      assert(authorized);
      const body=req.postDataJSON();
      assert.equal(body.requestId,REQUEST_ID);
      assert.equal(body.transferFee,0.1);
      assert.equal(body.transactionReference,"QA-PAYMENT-12345");
      state.paid++;
      state.withdrawals[0].status="paid";
      state.withdrawals[0].transfer_fee=0.1;
      state.withdrawals[0].net_payout=1.9;
      state.withdrawals[0].transaction_reference=body.transactionReference;
      return json({status:"paid"});
    }
    state.unexpectedTransfers++;
    return json({message:"Unexpected API call"},418);
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
  const tested=[];
  try {
    for(const [width,height,expectedColumns] of [[1440,900,2],[1024,850,1],[390,844,1],[320,740,1]]) {
      const {page,context,state}=await openRole(browser,"player",width,height);
      try {
        await page.goto(BASE+"/player/dashboard",{waitUntil:"domcontentloaded"});
        await page.locator("#player-withdrawal").waitFor({state:"visible",timeout:50000});
        await waitForText(page,"AVAILABLE BALANCE");
        await waitForText(page,"৳9.00");
        await page.locator("#player-withdrawal").scrollIntoViewIfNeeded();
        const value=await page.locator("#player-withdrawal form").evaluate(form=>{
          const grid=form.parentElement,history=grid.lastElementChild,shell=grid.closest("section");
          const rect=n=>{const r=n.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right};};
          const columns=getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/).filter(Boolean).length;
          const label=form.querySelector("label > span");
          const heading=form.querySelector("h3");
          const card=shell.querySelector("article span");
          return {
            form:rect(form), history:rect(history),grid:rect(grid),shell:rect(shell),
            columns,
            formMaxWidth:getComputedStyle(form).maxWidth,
            formMarginLeft:getComputedStyle(form).marginLeft,
            labelFont:parseFloat(getComputedStyle(label).fontSize),
            headingFont:parseFloat(getComputedStyle(heading).fontSize),
            cardLabelFont:parseFloat(getComputedStyle(card).fontSize),
            scrollWidth:document.documentElement.scrollWidth,
            viewport:window.innerWidth,
          };
        });
        assert.equal(value.columns,expectedColumns,"Unexpected responsive columns at "+width);
        assert.equal(value.formMaxWidth,"none","Global form 700px max-width must be overridden");
        assert(value.labelFont>=12,"Form labels should be readable at "+width);
        assert(value.cardLabelFont>=12,"Stat labels should be readable at "+width);
        assert(value.headingFont>=19,"Section headings should be readable at "+width);
        assert(value.form.width>=Math.max(240,value.grid.width/(expectedColumns===2?2.3:1.08)),
          "Form must occupy full width of its grid track at "+width);
        assert(Math.abs(value.form.x-value.grid.x)<4,
          "Form must align with grid start (no auto-centered gap) at "+width);
        if(expectedColumns===2){
          assert(value.history.x>=value.form.right-2,"History must be beside form");
          assert(value.history.width>=value.grid.width/2.5,"History panel must fill track");
          assert(value.history.height >= value.form.height-5,
            "Empty history panel should stretch to form height");
        }else{
          assert(value.history.y>=value.form.y+value.form.height-2,
            "History should stack below the form on tablets/phones");
        }
        if(width<=390){
          assert(value.shell.x>=-3&&value.shell.right<=width+4,
            "Wallet shell must stay inside narrow mobile viewport");
        }
        assert.equal(state.unexpectedTransfers,0,"Layout test must not send unexpected payment API calls");
        console.log("PASS wallet responsive layout width="+width+
          " columns="+value.columns+" form="+Math.round(value.form.width)+
          " history="+Math.round(value.history.width)+
          " labelFont="+value.labelFont+" cardLabelFont="+value.cardLabelFont);
        tested.push(width);
      }finally{await context.close();}
    }
    console.log("ALL WALLET RESPONSIVE CHECKS PASSED:",tested.length);
  }finally{await browser.close();}
}
run().catch(e=>{console.error("WALLET RESPONSIVE TEST FAILED:",e.stack||String(e));process.exit(1);});
