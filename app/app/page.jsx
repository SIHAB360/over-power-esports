'use client';
import {useCallback,useEffect,useMemo,useState} from 'react';
import {supabase} from '../lib/supabase';
import Image from 'next/image';
import brandLogo from '../assets/logo.png';
import {AdminModule,PlayerWallet,PlayerExtraModule} from './SoftwareModules';
import PlayerMatchCenter from '../player/dashboard/MatchCenterWidget';
import {
 FiHome,FiCalendar,FiCreditCard,FiBell,FiUser,FiGrid,FiUsers,FiLayers,
 FiAward,FiActivity,FiTarget,FiDollarSign,FiShield,FiImage,FiLogOut,
 FiChevronRight,FiArrowLeft,FiRefreshCw,FiEye,FiEyeOff,FiLock,
 FiZap,FiCheckCircle,FiClock,FiMenu,FiX,FiTrendingUp,FiSmartphone
} from 'react-icons/fi';
import './software.css';
import {EXTRA_ADMIN_MODULES,EXTRA_PLAYER_MODULES} from './generated-software-modules';

const currency=value=>'৳'+Number(value||0).toLocaleString('en-BD',{maximumFractionDigits:2});
const dateTime=new Intl.DateTimeFormat('bn-BD',{timeZone:'Asia/Dhaka',day:'2-digit',month:'short',hour:'numeric',minute:'2-digit',hour12:true});
const shortDate=new Intl.DateTimeFormat('bn-BD',{timeZone:'Asia/Dhaka',day:'2-digit',month:'short',year:'numeric'});
const MODULES=[
 {id:'schedule',title:'ম্যাচ শিডিউল',sub:'ম্যাচ তৈরি ও প্লেয়ার অ্যালার্ট',icon:FiCalendar,tone:'cyan'},
 {id:'players',title:'প্লেয়ার ম্যানেজমেন্ট',sub:'অ্যাকাউন্ট ও অনুমোদন',icon:FiUsers,tone:'blue'},
 {id:'roster',title:'রোস্টার কন্ট্রোল',sub:'অ্যাকটিভ প্লেয়ার ও স্কোয়াড',icon:FiActivity,tone:'purple'},
 {id:'matches',title:'ম্যাচ ম্যানেজমেন্ট',sub:'ম্যাচ ও পারফরম্যান্স',icon:FiTarget,tone:'pink'},
 {id:'teams',title:'টিম ম্যানেজমেন্ট',sub:'সব স্কোয়াডের তথ্য',icon:FiLayers,tone:'mint'},
 {id:'tournaments',title:'টুর্নামেন্ট',sub:'প্রতিযোগিতা পরিচালনা',icon:FiAward,tone:'gold'},
 {id:'withdrawals',title:'উইথড্রয়াল',sub:'পেমেন্ট রিভিউ ও অনুমোদন',icon:FiCreditCard,tone:'pink'},
 {id:'profit',title:'প্রফিট ও হিসাব',sub:'বিদ্যমান ম্যাচ ফাইন্যান্স',icon:FiDollarSign,tone:'mint'},
 {id:'achievements',title:'অ্যাচিভমেন্ট',sub:'গ্যালারি ও অর্জন',icon:FiImage,tone:'purple'},
 {id:'visitors',title:'ভিজিটর অ্যানালিটিক্স',sub:'সাইট ট্রাফিক ও কার্যক্রম',icon:FiActivity,tone:'cyan'},
 {id:'moderators',title:'মডারেটর',sub:'অনুমতি ও মডারেশন',icon:FiShield,tone:'blue'}
];
const ALL_MODULES=[...MODULES,...EXTRA_ADMIN_MODULES.map(x=>({...x,icon:FiGrid,tone:'blue'}))];
const NEW_PLAYER_MODULES=EXTRA_PLAYER_MODULES.map(x=>({...x,icon:FiGrid,tone:'blue'}));
const PLAYER_TABS=[
 {id:'home',text:'হোম',icon:FiHome},{id:'matches',text:'ম্যাচ',icon:FiCalendar},
 {id:'wallet',text:'ওয়ালেট',icon:FiCreditCard},{id:'alerts',text:'ইনবক্স',icon:FiBell},
 {id:'profile',text:'প্রোফাইল',icon:FiUser}
];
const ADMIN_TABS=[
 {id:'home',text:'হোম',icon:FiHome},{id:'schedule',text:'শিডিউল',icon:FiCalendar},
 {id:'manage',text:'মডিউল',icon:FiGrid},{id:'alerts',text:'নোটিশ',icon:FiBell},
 {id:'profile',text:'প্রোফাইল',icon:FiUser}
];
const greetings=()=>{
 const hour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Dhaka',hour:'numeric',hourCycle:'h23'}).format(new Date()));
 return hour<12?'শুভ সকাল':hour<17?'শুভ দুপুর':'শুভ সন্ধ্যা';
};
function FeatureCard({icon:Icon,title,sub,accent='cyan',onClick,chip}){
 return <button type="button" className={'op-app-feature op-app-tone-'+accent} onClick={onClick}>
  <span className="op-app-feature-icon"><Icon aria-hidden="true"/></span>
  <span className="op-app-feature-text"><strong>{title}</strong><small>{sub}</small></span>
  {chip?<span className="op-app-feature-chip">{chip}</span>:<FiChevronRight className="op-app-feature-arrow" aria-hidden="true"/>}
 </button>;
}
function EmptyPanel({icon:Icon,title,description}){
 return <div className="op-app-empty"><Icon aria-hidden="true"/><h3>{title}</h3><p>{description}</p></div>;
}
export default function SoftwareApp(){
 const [stage,setStage]=useState('checking');
 const [userData,setUserData]=useState(null);
 const [tab,setTab]=useState('home');
 const [module,setModule]=useState(null);
 const [sideOpen,setSideOpen]=useState(false);
 const [fixtures,setFixtures]=useState({schedules:[],inbox:[],unread:0});
 const [matchError,setMatchError]=useState('');
 const [busy,setBusy]=useState(false);
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [showPassword,setShowPassword]=useState(false);
 const [forgot,setForgot]=useState(false);
 const [error,setError]=useState('');
 const role=userData?.role||'';
 const admin=role==='admin';
 const approved=String(userData?.player?.status||'').toLowerCase()==='approved';
 const tabs=admin?ADMIN_TABS:PLAYER_TABS;
 const activeModule=ALL_MODULES.find(x=>x.id===module)||NEW_PLAYER_MODULES.find(x=>x.id===module);
 const upcoming=useMemo(()=>fixtures.schedules.filter(x=>x.status==='published'&&new Date(x.starts_at).getTime()>Date.now()),[fixtures.schedules]);

 const authenticatedFetch=useCallback(async(path,method='GET',body)=>{
  const {data:{session}}=await supabase.auth.getSession();
  if(!session?.access_token)throw Error('সেশন শেষ। আবার লগইন করুন।');
  const res=await fetch(path,{method,cache:'no-store',headers:{
   'Authorization':'Bearer '+session.access_token,...(body?{'Content-Type':'application/json'}:{})
  },body:body?JSON.stringify(body):undefined});
  const json=await res.json().catch(()=>({}));
  if(!res.ok)throw Error(json.message||'ডাটা লোড করা যাচ্ছে না।');
  return json;
 },[]);
 const loadMatches=useCallback(async()=>{
  try{
   const data=await authenticatedFetch('/api/player/match-schedules');
   setFixtures(data);setMatchError('');
  }catch(err){setMatchError(err.message)}
 },[authenticatedFetch]);
 const loadAccount=useCallback(async()=>{
  try{
   const {data:{session}}=await supabase.auth.getSession();
   if(!session){setUserData(null);setStage('login');return;}
   const account=await authenticatedFetch('/api/software/overview');
   setUserData(account);setStage('ready');
   if(account.role==='admin'||account.player?.status?.toLowerCase()==='approved'){
    loadMatches();
   }
  }catch(err){
   const {data:{session}}=await supabase.auth.getSession();
   if(!session){setUserData(null);setStage('login')}
   else {setError(err.message);setStage('error')}
  }
 },[authenticatedFetch,loadMatches]);
 useEffect(()=>{
  let live=true;
  const bootstrap=async()=>{if(live)await loadAccount()};
  bootstrap();
  const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{
   if(event==='SIGNED_OUT'&&live){
    setUserData(null);setTab('home');setModule(null);setStage('login');
    setFixtures({schedules:[],inbox:[],unread:0});
   }
  });
  return()=>{live=false;subscription.unsubscribe()};
 },[loadAccount]);
 useEffect(()=>{
  if(stage!=='ready')return;
  const t=setInterval(()=>{if(document.visibilityState==='visible'&&(admin||approved))loadMatches()},45000);
  const focus=()=>{if(admin||approved)loadMatches()};
  window.addEventListener('focus',focus);
  return()=>{clearInterval(t);window.removeEventListener('focus',focus)};
 },[stage,admin,approved,loadMatches]);
 const signIn=async(event)=>{
  event.preventDefault();setBusy(true);setError('');
  try{
   const {error:loginError}=await supabase.auth.signInWithPassword({
    email:email.trim(),password
   });
   if(loginError)throw loginError;
   setPassword('');
   await loadAccount();
  }catch(err){setError(err.message||'লগইন ব্যর্থ হয়েছে।')}
  finally{setBusy(false)}
 };
 const resetPassword=async(event)=>{
  event.preventDefault();setBusy(true);setError('');
  try{
   if(!email.trim())throw Error('ইমেইল লিখুন।');
   const {error:resetError}=await supabase.auth.resetPasswordForEmail(email.trim(),{
    redirectTo:window.location.origin+'/reset-password'
   });
   if(resetError)throw resetError;
   setError('রিসেট লিংক পাঠানোর অনুরোধ গ্রহণ করা হয়েছে। ইমেইল দেখুন।');
  }catch(err){setError(err.message)}finally{setBusy(false)}
 };
 const signOut=async()=>{
  setBusy(true);
  try{const {error:outError}=await supabase.auth.signOut();if(outError)throw outError}
  catch(err){setError(err.message)}finally{setBusy(false)}
 };
 const go=(destination,submodule=null)=>{
  setTab(destination);setModule(submodule);setSideOpen(false);
  const next=new URL(window.location.href);
  next.searchParams.set('tab',destination);
  if(submodule)next.searchParams.set('module',submodule);
  else next.searchParams.delete('module');
  window.history.pushState({opSoftware:true,tab:destination,module:submodule},'',next.pathname+next.search);
  window.scrollTo({top:0,behavior:'instant'});
 };
 useEffect(()=>{
  const navigate=()=>{
   const url=new URL(window.location.href);
   const target=url.searchParams.get('tab')||'home';
   const valid=admin?new Set(['home','schedule','manage','alerts','profile']):
    new Set(['home','matches','wallet','alerts','profile','team','tournaments','performance','extra']);
   setTab(valid.has(target)?target:'home');
   setModule(url.searchParams.get('module')||null);
  };
  if(stage==='ready')navigate();
  window.addEventListener('popstate',navigate);
  return()=>window.removeEventListener('popstate',navigate);
 },[stage,admin]);
 const markRead=async(id)=>{
  try{
   await authenticatedFetch('/api/player/match-schedules','PATCH',{id});
   setFixtures(old=>({...old,inbox:old.inbox.map(n=>n.id===id?{...n,read_at:new Date().toISOString()}:n),
    unread:Math.max(0,old.unread-1)}));
  }catch(err){setMatchError(err.message)}
 };
 if(stage==='checking')return <main className="op-app-root op-app-gate"><div className="op-app-splash"><div className="op-app-brand-icon"><Image src={brandLogo} alt="OVER POWER ESPORTS" width={100} height={100} priority/></div><strong>OVER POWER</strong><small>ESPORTS APP</small><p role="status">অ্যাকাউন্ট যাচাই হচ্ছে…</p></div></main>;
 if(stage==='login')return <main className="op-app-root op-app-gate">
  <section className="op-app-login" aria-label="OVER POWER ESPORTS software login">
   <div className="op-app-login-hero"><div className="op-app-brand-icon"><Image src={brandLogo} alt="OVER POWER ESPORTS" width={100} height={100} priority/></div>
    <span className="op-app-overline">OFFICIAL ESPORTS APPLICATION</span>
    <h1>OVER POWER <em>ESPORTS</em></h1>
    <p>আপনার টিম, ম্যাচ, ইনবক্স ও ওয়ালেট—সব এখন একটি অ্যাপের ভেতর।</p>
    <div className="op-app-login-dots"><span/> <span/> <span/></div>
   </div>
   <div className="op-app-login-form">
    <p className="op-app-overline">{forgot?'SECURE RECOVERY':'WELCOME BACK'}</p>
    <h2>{forgot?'পাসওয়ার্ড রিসেট':'আপনার অ্যাকাউন্টে লগইন'}</h2>
    <p>বিদ্যমান OVER POWER ESPORTS অ্যাকাউন্ট ব্যবহার করুন।</p>
    <form onSubmit={forgot?resetPassword:signIn}>
     <label htmlFor="op-app-email">ইমেইল অ্যাড্রেস</label>
     <input id="op-app-email" type="email" value={email} onChange={e=>setEmail(e.target.value)}
      autoComplete="email" placeholder="player@example.com" required/>
     {!forgot&&<><label htmlFor="op-app-password">পাসওয়ার্ড</label>
      <div className="op-app-password">
       <input id="op-app-password" type={showPassword?'text':'password'} required minLength={1}
        value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"
        placeholder="আপনার পাসওয়ার্ড লিখুন"/>
       <button type="button" aria-label={showPassword?'পাসওয়ার্ড লুকান':'পাসওয়ার্ড দেখুন'} onClick={()=>setShowPassword(!showPassword)}>
        {showPassword?<FiEyeOff/>:<FiEye/>}</button>
      </div></>}
     {error&&<p role="alert" className="op-app-form-message">{error}</p>}
     <button className="op-app-primary" type="submit" disabled={busy}>
      {busy?'অপেক্ষা করুন…':forgot?'রিসেট লিংক পাঠান':'নিরাপদ লগইন করুন'} <FiChevronRight/>
     </button>
    </form>
    <button className="op-app-link" type="button" onClick={()=>{setForgot(!forgot);setError('')}}>
     {forgot?'← লগইনে ফিরে যান':'পাসওয়ার্ড ভুলে গেছেন?'}
    </button>
    <p className="op-app-login-safe"><FiLock/> আপনার লগইন তথ্য সরাসরি Supabase Authentication দ্বারা যাচাই হয়।</p>
   </div>
  </section>
 </main>;
 if(stage==='error')return <main className="op-app-root op-app-gate"><div className="op-app-fail">
  <FiShield/><h2>সফটওয়্যার খুলতে সমস্যা হচ্ছে</h2><p role="alert">{error}</p>
  <button className="op-app-primary" onClick={()=>{setError('');setStage('checking');loadAccount()}}>আবার চেষ্টা করুন <FiRefreshCw/></button>
  <button className="op-app-link" onClick={signOut}>লগআউট</button></div></main>;

 const displayName=userData?.player?.ign||userData?.profile?.full_name||'OVER POWER';
 const welcomeName=admin?'ADMIN':displayName;
 const showAdminComponent=admin&&(tab==='schedule'||(tab==='manage'&&module));
 const currentModule=tab==='schedule'?'schedule':module;
 const unread=fixtures.unread||0;
 return <div className="op-app-root" data-app-role={role}>
  {sideOpen&&<button className="op-app-scrim" type="button" onClick={()=>setSideOpen(false)} aria-label="Close application menu"/>}
  <aside className={'op-app-sidebar'+(sideOpen?' is-open':'')} aria-label="Software navigation">
   <div className="op-app-sidebar-logo"><span><Image src={brandLogo} alt="OVER POWER ESPORTS" width={46} height={46}/></span><div><strong>OVER POWER</strong><small>ESPORTS</small></div>
    <button className="op-app-side-close" aria-label="Close navigation" onClick={()=>setSideOpen(false)}><FiX/></button>
   </div>
   <div className="op-app-sidebar-tag">{admin?'ADMIN COMMAND':'PLAYER APPLICATION'}</div>
   <nav className="op-app-side-links">
    {tabs.map(t=><button type="button" key={t.id} className={tab===t.id?'selected':''}
     aria-current={tab===t.id?'page':undefined} onClick={()=>go(t.id)}>
      <t.icon aria-hidden="true"/><span>{t.text}</span>
      {t.id==='alerts'&&unread>0&&<b className="op-app-count">{unread}</b>}
    </button>)}
   </nav>
   {admin&&<div className="op-app-side-tools"><span>ম্যানেজমেন্ট</span>
    {MODULES.slice(0,6).map(x=><button key={x.id} className={module===x.id&&tab==='manage'?'selected':''}
     onClick={()=>go('manage',x.id)}><x.icon/>{x.title}</button>)}
   </div>}
   <div className="op-app-sidebar-bottom"><span className="op-app-online"><i/> Live Sync</span>
    <button onClick={signOut}><FiLogOut/> লগআউট</button>
   </div>
  </aside>
  <div className="op-app-main">
   <header className="op-app-topbar">
    <div className="op-app-top-left">
     <button className="op-app-hamburger" aria-label="Open application menu" onClick={()=>setSideOpen(true)}><FiMenu/></button>
     <div className="op-app-top-logo"><Image src={brandLogo} alt="OVER POWER" width={38} height={38}/></div>
     <div><b>OVER POWER</b><small>ESPORTS APP</small></div>
    </div>
    <div className="op-app-top-actions">
     <span className="op-app-secure"><FiShield/> SECURE</span>
     <button className="op-app-top-bell" aria-label={'Notifications '+unread} onClick={()=>go('alerts')}>
      <FiBell/>{unread>0&&<span>{unread>9?'9+':unread}</span>}
     </button>
     <button className="op-app-avatar" aria-label="My profile" onClick={()=>go('profile')}>{welcomeName.slice(0,2).toUpperCase()}</button>
    </div>
   </header>
   <main className={'op-app-content'+(showAdminComponent?' is-management':'')}>
    {tab==='home'&&<div className="op-app-view">
     <section className="op-app-welcome">
      <div className="op-app-welcome-copy"><span className="op-app-overline"><FiZap/> OVER POWER COMMAND CENTER</span>
       <p className="op-app-greet">{greetings()},</p>
       <h1>{welcomeName}</h1>
       <p>{admin?'আপনার সব ম্যানেজমেন্ট সেকশন, ম্যাচ ও প্লেয়ার অপারেশন এখন এই সফটওয়্যারে।':
        'আপনার পরবর্তী ম্যাচ, নোটিফিকেশন ও স্কোয়াড আপডেট এক জায়গায়।'}</p>
       <span className="op-app-live"><i/> LIVE DATABASE CONNECTED</span>
      </div><div className="op-app-welcome-art" aria-hidden="true"><FiZap/></div>
     </section>
     <section className="op-app-stats" aria-label="Account statistics">
      {admin?<>
       <div><FiUsers/><span>মোট প্লেয়ার</span><strong>{userData.counts?.players??0}</strong></div>
       <div><FiLayers/><span>স্কোয়াড</span><strong>{userData.counts?.teams??0}</strong></div>
       <div><FiTarget/><span>রেকর্ডেড ম্যাচ</span><strong>{userData.counts?.matches??0}</strong></div>
       <div><FiAward/><span>টুর্নামেন্ট</span><strong>{userData.counts?.tournaments??0}</strong></div>
      </>:<>
       <div><FiCalendar/><span>আসন্ন ম্যাচ</span><strong>{upcoming.length}</strong></div>
       <div><FiTarget/><span>মোট ম্যাচ</span><strong>{userData.player?.matches_played??0}</strong></div>
       <div><FiAward/><span>জয়</span><strong>{userData.player?.wins??0}</strong></div>
       <div><FiZap/><span>কিলস</span><strong>{userData.player?.total_kills??0}</strong></div>
      </>}
     </section>
     {unread>0&&<button className="op-app-alert-strip" onClick={()=>go('alerts')}><FiBell/>
      <span><b>{unread}টি নতুন ম্যাচ নোটিফিকেশন</b><small>দেখতে ট্যাপ করুন</small></span><FiChevronRight/>
     </button>}
     <div className="op-app-section-title"><div><span className="op-app-overline">QUICK ACCESS</span><h2>আপনার সেকশনগুলো</h2></div><FiGrid/></div>
     <section className="op-app-feature-grid">
      {admin?ALL_MODULES.slice(0,8).map(x=><FeatureCard key={x.id} icon={x.icon} title={x.title} sub={x.sub}
       accent={x.tone} onClick={()=>go(x.id==='schedule'?'schedule':'manage',x.id)}/>):
      <>
       <FeatureCard icon={FiCalendar} title="ম্যাচ সেন্টার" sub="আসন্ন ম্যাচ ও লবি" accent="cyan" onClick={()=>go('matches')}/>
       <FeatureCard icon={FiCreditCard} title="আমার ওয়ালেট" sub="উত্তোলন ও পেমেন্ট হিস্ট্রি" accent="pink" onClick={()=>go('wallet')}/>
       <FeatureCard icon={FiBell} title="নোটিফিকেশন" sub="ম্যাচ রিমাইন্ডার ও ইনবক্স" accent="purple" onClick={()=>go('alerts')} chip={unread||null}/>
       <FeatureCard icon={FiLayers} title="আমার টিম" sub={userData?.team?.name||'স্কোয়াড তথ্য'} accent="mint" onClick={()=>go('team')}/>
       <FeatureCard icon={FiAward} title="টুর্নামেন্ট" sub="প্রতিযোগিতা ও শিডিউল" accent="gold" onClick={()=>go('tournaments')}/>
       <FeatureCard icon={FiTrendingUp} title="আমার পারফরম্যান্স" sub="ম্যাচ, জয় ও কিলস" accent="blue" onClick={()=>go('performance')}/>
       {NEW_PLAYER_MODULES.map(x=><FeatureCard key={x.id} icon={x.icon} title={x.title} sub={x.sub} accent={x.tone} onClick={()=>go('extra',x.id)}/>)}
      </>}
     </section>
     {upcoming.length>0&&<section className="op-app-next-match"><div className="op-app-section-title">
      <div><span className="op-app-overline">UP NEXT</span><h2>পরবর্তী ম্যাচ</h2></div>
      <button onClick={()=>go(admin?'schedule':'matches')}>সব দেখুন <FiChevronRight/></button>
     </div><MatchCard match={upcoming[0]}/></section>}
    </div>}
    {tab==='matches'&&!admin&&<div className="op-app-view">
     <SectionHead overline="YOUR LIVE FIXTURES" title="আমার ম্যাচ সেন্টার" subtitle="অনুমোদিত স্কোয়াডে প্রকাশিত ম্যাচ এখানে দেখাবে।"/>
     {matchError&&<p className="op-app-error" role="alert">{matchError}</p>}
     <div className="op-app-inline"><span><FiClock/> বাংলাদেশ সময় (UTC+6)</span><button onClick={loadMatches}><FiRefreshCw/> রিফ্রেশ</button></div>
     {!approved?<EmptyPanel icon={FiShield} title="অনুমোদনের অপেক্ষা" description="ম্যাচ শিডিউল দেখার জন্য আপনার প্লেয়ার অ্যাকাউন্ট Approved হতে হবে।"/>:
      fixtures.schedules.length===0?<EmptyPanel icon={FiCalendar} title="কোনো ম্যাচ শিডিউল নেই" description="অ্যাডমিন ম্যাচ প্রকাশ করলে এখানে স্বয়ংক্রিয়ভাবে দেখা যাবে।"/>:
      <div className="op-app-match-list">{fixtures.schedules.map(x=><MatchCard key={x.id} match={x}/>)}</div>}
    </div>}
    {tab==='wallet'&&!admin&&<div className="op-app-view">
     <SectionHead overline="SECURE FINANCE" title="আমার ওয়ালেট" subtitle="বিকাশ/নগদের বিদ্যমান নিরাপদ উত্তোলন ব্যবস্থা।"/>
     {approved?<PlayerWallet/>:<EmptyPanel icon={FiLock} title="ওয়ালেট ব্যবহারের অনুমতি নেই" description="অনুমোদিত প্লেয়ার অ্যাকাউন্ট থেকে উত্তোলন করা যায়।"/>}
    </div>}
    {tab==='alerts'&&<div className="op-app-view">
     <SectionHead overline="MATCH ALERTS" title="নোটিফিকেশন ইনবক্স" subtitle="ম্যাচ প্রকাশ ও শুরুর আগের বার্তাগুলো।"/>
     {matchError&&<p role="alert" className="op-app-error">{matchError}</p>}
     <div className="op-app-inline"><span>{unread}টি অপঠিত</span><button onClick={loadMatches}><FiRefreshCw/> রিফ্রেশ</button></div>
     {!approved&&!admin?<EmptyPanel icon={FiShield} title="Approved Player প্রয়োজন" description="ম্যাচ অ্যালার্ট পেতে প্রথমে আপনার অ্যাকাউন্ট অনুমোদিত হতে হবে।"/>:
     fixtures.inbox.length===0?<EmptyPanel icon={FiBell} title="ইনবক্স খালি" description="নতুন ম্যাচ প্রকাশিত হলে এখানে জানানো হবে।"/>:
     <div className="op-app-inbox">{fixtures.inbox.map(note=>{
      const match=fixtures.schedules.find(s=>s.id===note.schedule_id);
      return <button key={note.id} className={'op-app-notice '+(!note.read_at?'is-unread':'')}
       onClick={()=>{if(!note.read_at)markRead(note.id);if(match)go(admin?'schedule':'matches')}}>
       <span className="op-app-notice-icon"><FiBell/></span><span><strong>{
        note.event_key==='created'?'নতুন ম্যাচ প্রকাশিত':
        note.event_key==='60m'?'ম্যাচ শুরুতে ১ ঘণ্টা':
        note.event_key==='30m'?'ম্যাচ শুরুতে ৩০ মিনিট':'ম্যাচ শুরুতে ১৫ মিনিট'
       }</strong><small>{match?.title||'Match Center'} · {dateTime.format(new Date(note.created_at))}</small></span>
       {!note.read_at&&<i/>}
      </button>;
     })}</div>}
     {!admin&&approved&&<details className="op-app-push-settings"><summary><FiSmartphone/> ফোনের Push Notification চালু করুন</summary>
      <PlayerMatchCenter/>
     </details>}
    </div>}
    {tab==='team'&&!admin&&<div className="op-app-view">
     <SectionHead overline="MY TEAM" title="আমার স্কোয়াড" subtitle="আপনার বর্তমান টিমের তথ্য।"/>
     {userData.team?<div className="op-app-info-card"><FiLayers/><h2>{userData.team.name}</h2>
      <p>{userData.team.description||'OVER POWER ESPORTS TEAM'}</p>
      <dl><dt>কোচ</dt><dd>{userData.team.coach_name||'—'}</dd><dt>ম্যানেজার</dt><dd>{userData.team.manager_name||'—'}</dd>
       <dt>রোস্টার স্ট্যাটাস</dt><dd>{userData.player?.is_active?'Active':'Inactive'}</dd></dl></div>:
      <EmptyPanel icon={FiLayers} title="টিম নির্ধারিত নয়" description="অ্যাডমিন টিমে যুক্ত করলে এখানে তথ্য আসবে।"/>}
    </div>}
    {tab==='tournaments'&&!admin&&<div className="op-app-view">
     <SectionHead overline="COMPETE & WIN" title="টুর্নামেন্ট" subtitle="বিদ্যমান টুর্নামেন্ট ডাটাবেস থেকে সরাসরি।"/>
     {!userData.tournaments?.length?<EmptyPanel icon={FiAward} title="এখন কোনো টুর্নামেন্ট নেই" description="নতুন ইভেন্ট তৈরি হলে এখানে দেখাবে।"/>:
      <div className="op-app-tournament-grid">{userData.tournaments.map(t=><article key={t.id} className="op-app-tournament">
       <FiAward/><span>{t.status||'Upcoming'}</span><h3>{t.name}</h3>
       <p>শুরু: {t.start_date?shortDate.format(new Date(t.start_date+'T12:00:00+06:00')):'ঘোষণার অপেক্ষা'}</p>
       <strong>প্রাইজ পুল: {currency(t.prize_pool)}</strong>
      </article>)}</div>}
    </div>}
    {tab==='performance'&&!admin&&<div className="op-app-view">
     <SectionHead overline="GAME STATISTICS" title="আমার পারফরম্যান্স" subtitle="আপনার রেকর্ডে সংরক্ষিত ম্যাচ, জয় ও কিলস।"/>
     <div className="op-app-stats"><div><FiCalendar/><span>মোট ম্যাচ</span><strong>{userData.player?.matches_played??0}</strong></div>
      <div><FiAward/><span>মোট জয়</span><strong>{userData.player?.wins??0}</strong></div>
      <div><FiTarget/><span>মোট কিলস</span><strong>{userData.player?.total_kills??0}</strong></div></div>
    </div>}
    {tab==='extra'&&!admin&&module&&NEW_PLAYER_MODULES.some(x=>x.id===module)&&<div className="op-app-view op-app-management-view">
     <button className="op-app-back" type="button" onClick={()=>go('home')}><FiArrowLeft/> হোম</button>
     <SectionHead overline="PLAYER MODULE" title={activeModule?.title||'Player'} subtitle="নতুন সফটওয়্যার সেকশন"/>
     <PlayerExtraModule module={module}/>
    </div>}
    {tab==='profile'&&<div className="op-app-view">
     <SectionHead overline="ACCOUNT CENTER" title="আমার প্রোফাইল" subtitle="আপনার বর্তমান যাচাইকৃত অ্যাকাউন্ট।"/>
     <div className="op-app-profile">
      <div className="op-app-profile-avatar"><FiUser/></div>
      <h2>{displayName}</h2><span className="op-app-profile-pill">{admin?'Main Admin':userData.player?.status||'Player'}</span>
      <dl><dt>ইমেইল</dt><dd>{userData.profile?.email||'—'}</dd>
       <dt>অ্যাকাউন্ট টাইপ</dt><dd>{admin?'Administrator':'Player'}</dd>
       {!admin&&<><dt>স্কোয়াড</dt><dd>{userData.player?.team_name||'—'}</dd>
        <dt>ভেরিফিকেশন</dt><dd>{userData.player?.verified?'Verified':'Not verified'}</dd>
        <dt>রোস্টার</dt><dd>{userData.player?.is_active?'Active':'Inactive'}</dd></>}
      </dl>
      <button className="op-app-logout" onClick={signOut} disabled={busy}><FiLogOut/> লগআউট</button>
     </div>
    </div>}
    {tab==='manage'&&admin&&!module&&<div className="op-app-view">
     <SectionHead overline="ADMIN OPERATIONS" title="সফটওয়্যার ম্যানেজমেন্ট" subtitle="যে সেকশনটি খুলবেন, সেটির কার্যকর কন্ট্রোল এই অ্যাপের ভেতরেই চলবে।"/>
     <div className="op-app-feature-grid">{ALL_MODULES.map(x=><FeatureCard key={x.id} title={x.title} sub={x.sub}
      icon={x.icon} accent={x.tone} onClick={()=>go('manage',x.id)}/>)}</div>
    </div>}
    {showAdminComponent&&<div className="op-app-view op-app-management-view">
     <button className="op-app-back" type="button" onClick={()=>go('manage')}><FiArrowLeft/> সব মডিউল</button>
     <SectionHead overline="ADMIN MODULE" title={activeModule?.title||'ম্যানেজমেন্ট'} subtitle={activeModule?.sub||'বিদ্যমান প্রশাসনিক ব্যবস্থা'}/>
     <AdminModule key={currentModule} module={currentModule}/>
    </div>}
    {tab==='alerts'&&admin&&fixtures.schedules.length>0&&
     <div className="op-app-view op-app-schedule-access"><button className="op-app-primary" onClick={()=>go('schedule')}>
      <FiCalendar/> শিডিউল পরিচালনা করুন <FiChevronRight/></button></div>}
   </main>
   <nav className="op-app-bottom" aria-label="App bottom navigation">
    {tabs.map(t=><button key={t.id} type="button" className={tab===t.id?'is-active':''}
     aria-current={tab===t.id?'page':undefined} onClick={()=>go(t.id)}>
     <span className="op-app-bottom-icon"><t.icon/>{t.id==='alerts'&&unread>0&&<i/>}</span><small>{t.text}</small>
    </button>)}
   </nav>
  </div>
 </div>;
}
function SectionHead({overline,title,subtitle}){
 return <div className="op-app-heading"><span className="op-app-overline">{overline}</span><h1>{title}</h1><p>{subtitle}</p></div>;
}
function MatchCard({match}){
 const cancelled=match.status==='cancelled';
 return <article className={'op-app-match-card'+(cancelled?' is-cancelled':'')}>
  <div className="op-app-match-top"><span><FiCalendar/> {dateTime.format(new Date(match.starts_at))}</span>
   <b>{cancelled?'বাতিল':'PUBLISHED'}</b></div>
  <h3>{match.title}</h3><p>{match.lobby_details||'লবির তথ্য পরে জানানো হবে'}</p>
  <div className="op-app-match-values"><span>এন্ট্রি ফি <strong>{currency(match.entry_fee)}</strong></span>
   <span>প্রাইজ পুল <strong>{match.prize_pool||'—'}</strong></span></div>
  {match.notes&&<p className="op-app-match-note">{match.notes}</p>}
 </article>;
}
