'use client';
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
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
import NativePushManager from './NativePushManager';
import {EXTRA_ADMIN_MODULES,EXTRA_PLAYER_MODULES} from './generated-software-modules';

const currency=value=>'BDT '+Number(value||0).toLocaleString('en-BD',{maximumFractionDigits:2});
const dateTime=new Intl.DateTimeFormat('en-BD',{timeZone:'Asia/Dhaka',day:'2-digit',month:'short',hour:'numeric',minute:'2-digit',hour12:true});
const shortDate=new Intl.DateTimeFormat('en-BD',{timeZone:'Asia/Dhaka',day:'2-digit',month:'short',year:'numeric'});
const MODULES=[
 {id:'schedule',title:'Match Schedule',sub:'Create matches & notify players',icon:FiCalendar,tone:'cyan'},
 {id:'players',title:'Player Management',sub:'Accounts & approvals',icon:FiUsers,tone:'blue'},
 {id:'roster',title:'Roster Control',sub:'Player activity & squads',icon:FiActivity,tone:'purple'},
 {id:'matches',title:'Match Management',sub:'Match results & performance',icon:FiTarget,tone:'pink'},
 {id:'teams',title:'Team Management',sub:'All your squads',icon:FiLayers,tone:'mint'},
 {id:'tournaments',title:'Tournaments',sub:'Competition management',icon:FiAward,tone:'gold'},
 {id:'withdrawals',title:'Withdrawals',sub:'Payment review & approval',icon:FiCreditCard,tone:'pink'},
 {id:'profit',title:'Profit & Finance',sub:'Existing match finances',icon:FiDollarSign,tone:'mint'},
 {id:'achievements',title:'Achievements',sub:'Gallery & awards',icon:FiImage,tone:'purple'},
 {id:'visitors',title:'Visitor Analytics',sub:'Site activity & traffic',icon:FiActivity,tone:'cyan'},
 {id:'moderators',title:'Moderators',sub:'Permissions & moderation',icon:FiShield,tone:'blue'}
];
const ALL_MODULES=[...MODULES,...EXTRA_ADMIN_MODULES.map(x=>({...x,icon:FiGrid,tone:'blue'}))];
const NEW_PLAYER_MODULES=EXTRA_PLAYER_MODULES.map(x=>({...x,icon:FiGrid,tone:'blue'}));
const PLAYER_TABS=[
 {id:'home',text:'Home',icon:FiHome},{id:'matches',text:'Matches',icon:FiCalendar},
 {id:'wallet',text:'Wallet',icon:FiCreditCard},{id:'alerts',text:'Inbox',icon:FiBell},
 {id:'profile',text:'Profile',icon:FiUser}
];
const ADMIN_TABS=[
 {id:'home',text:'Home',icon:FiHome},{id:'schedule',text:'Schedule',icon:FiCalendar},
 {id:'manage',text:'Modules',icon:FiGrid},{id:'alerts',text:'Alerts',icon:FiBell},
 {id:'profile',text:'Profile',icon:FiUser}
];
const greetings=()=>{
 const hour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Dhaka',hour:'numeric',hourCycle:'h23'}).format(new Date()));
 return hour<12?'Good morning':hour<17?'Good afternoon':'Good evening';
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
 const [toast,setToast]=useState(null);
 const lastUnread=useRef(0);
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
  if(!session?.access_token)throw Error('Session expired. Please sign in again.');
  const res=await fetch(path,{method,cache:'no-store',headers:{
   'Authorization':'Bearer '+session.access_token,...(body?{'Content-Type':'application/json'}:{})
  },body:body?JSON.stringify(body):undefined});
  const json=await res.json().catch(()=>({}));
  if(!res.ok)throw Error(json.message||'Unable to load data.');
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
  const t=setInterval(()=>{if(document.visibilityState==='visible'&&(admin||approved))loadMatches()},15000);
  const focus=()=>{if(admin||approved)loadMatches()};
  window.addEventListener('focus',focus);
  return()=>{clearInterval(t);window.removeEventListener('focus',focus)};
 },[stage,admin,approved,loadMatches]);
 useEffect(()=>{
  if(stage!=='ready'||admin||!approved)return;
  const count=Number(fixtures.unread||0);
  if(count>lastUnread.current){
   const latest=fixtures.inbox.find(item=>!item.read_at);
   setToast({count,title:latest?.event_key==='created'?'New Match Published':'Match Reminder',
    message:'You have '+count+' unread match alert'+(count===1?'':'s')+'. Tap to view.'});
  }
  lastUnread.current=count;
 },[stage,admin,approved,fixtures.unread,fixtures.inbox]);
 useEffect(()=>{
  if(!toast)return;
  const timer=setTimeout(()=>setToast(null),9000);
  return()=>clearTimeout(timer);
 },[toast]);
 const signIn=async(event)=>{
  event.preventDefault();setBusy(true);setError('');
  try{
   const {error:loginError}=await supabase.auth.signInWithPassword({
    email:email.trim(),password
   });
   if(loginError)throw loginError;
   setPassword('');
   await loadAccount();
  }catch(err){setError(err.message||'Login failed.')}
  finally{setBusy(false)}
 };
 const resetPassword=async(event)=>{
  event.preventDefault();setBusy(true);setError('');
  try{
   if(!email.trim())throw Error('Please enter your email.');
   const {error:resetError}=await supabase.auth.resetPasswordForEmail(email.trim(),{
    redirectTo:window.location.origin+'/reset-password'
   });
   if(resetError)throw resetError;
   setError('If the account exists, check your email for the reset link.');
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
 if(stage==='checking')return <main className="op-app-root op-app-gate"><div className="op-app-splash"><div className="op-app-brand-icon"><Image src={brandLogo} alt="OVER POWER ESPORTS" width={100} height={100} priority/></div><strong>OVER POWER</strong><small>ESPORTS APP</small><p role="status">Checking your account…</p></div></main>;
 if(stage==='login')return <main className="op-app-root op-app-gate">
  <section className="op-app-login" aria-label="OVER POWER ESPORTS software login">
   <div className="op-app-login-hero"><div className="op-app-brand-icon"><Image src={brandLogo} alt="OVER POWER ESPORTS" width={100} height={100} priority/></div>
    <span className="op-app-overline">OFFICIAL ESPORTS APPLICATION</span>
    <h1>OVER POWER <em>ESPORTS</em></h1>
    <p>Your team, matches, alerts and wallet, all in one app.</p>
    <div className="op-app-login-dots"><span/> <span/> <span/></div>
   </div>
   <div className="op-app-login-form">
    <p className="op-app-overline">{forgot?'SECURE RECOVERY':'WELCOME BACK'}</p>
    <h2>{forgot?'Reset Password':'Sign in to your account'}</h2>
    <p>Use your existing OVER POWER ESPORTS account.</p>
    <form onSubmit={forgot?resetPassword:signIn}>
     <label htmlFor="op-app-email">Email Address</label>
     <input id="op-app-email" type="email" value={email} onChange={e=>setEmail(e.target.value)}
      autoComplete="email" placeholder="player@example.com" required/>
     {!forgot&&<><label htmlFor="op-app-password">Password</label>
      <div className="op-app-password">
       <input id="op-app-password" type={showPassword?'text':'password'} required minLength={1}
        value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"
        placeholder="Enter your password"/>
       <button type="button" aria-label={showPassword?'Hide password':'Show password'} onClick={()=>setShowPassword(!showPassword)}>
        {showPassword?<FiEyeOff/>:<FiEye/>}</button>
      </div></>}
     {error&&<p role="alert" className="op-app-form-message">{error}</p>}
     <button className="op-app-primary" type="submit" disabled={busy}>
      {busy?'Please wait…':forgot?'Send Reset Link':'Sign In Securely'} <FiChevronRight/>
     </button>
    </form>
    <button className="op-app-link" type="button" onClick={()=>{setForgot(!forgot);setError('')}}>
     {forgot?'← Back to Sign In':'Forgot your password?'}
    </button>
    <p className="op-app-login-safe"><FiLock/> Your sign-in is securely verified by Supabase Authentication.</p>
   </div>
  </section>
 </main>;
 if(stage==='error')return <main className="op-app-root op-app-gate"><div className="op-app-fail">
  <FiShield/><h2>Unable to open the app</h2><p role="alert">{error}</p>
  <button className="op-app-primary" onClick={()=>{setError('');setStage('checking');loadAccount()}}>Try Again <FiRefreshCw/></button>
  <button className="op-app-link" onClick={signOut}>Log Out</button></div></main>;

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
   {admin&&<div className="op-app-side-tools"><span>Management</span>
    {MODULES.slice(0,6).map(x=><button key={x.id} className={module===x.id&&tab==='manage'?'selected':''}
     onClick={()=>go('manage',x.id)}><x.icon/>{x.title}</button>)}
   </div>}
   <div className="op-app-sidebar-bottom"><span className="op-app-online"><i/> Live Sync</span>
    <button onClick={signOut}><FiLogOut/> Log Out</button>
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
   {toast&&<div className="op-app-toast" role="status">
    <FiBell/><button type="button" className="op-app-toast-body" onClick={()=>{setToast(null);go('alerts')}}>
      <strong>{toast.title}</strong><small>{toast.message}</small>
    </button><button type="button" aria-label="Dismiss alert" className="op-app-toast-dismiss" onClick={()=>setToast(null)}><FiX/></button>
   </div>}
   <main className={'op-app-content'+(showAdminComponent?' is-management':'')}>
    {!admin&&approved&&<NativePushManager/>}
    {tab==='home'&&<div className="op-app-view">
     <section className="op-app-welcome">
      <div className="op-app-welcome-copy"><span className="op-app-overline"><FiZap/> OVER POWER COMMAND CENTER</span>
       <p className="op-app-greet">{greetings()},</p>
       <h1>{welcomeName}</h1>
       <p>{admin?'Manage your players, matches and operations from this app.':
        'Your next matches, notifications and squad updates in one place.'}</p>
       <span className="op-app-live"><i/> LIVE DATABASE CONNECTED</span>
      </div><div className="op-app-welcome-art" aria-hidden="true"><FiZap/></div>
     </section>
     <section className="op-app-stats" aria-label="Account statistics">
      {admin?<>
       <div><FiUsers/><span>Total Players</span><strong>{userData.counts?.players??0}</strong></div>
       <div><FiLayers/><span>Squads</span><strong>{userData.counts?.teams??0}</strong></div>
       <div><FiTarget/><span>Recorded Matches</span><strong>{userData.counts?.matches??0}</strong></div>
       <div><FiAward/><span>Tournaments</span><strong>{userData.counts?.tournaments??0}</strong></div>
      </>:<>
       <div><FiCalendar/><span>Upcoming Matches</span><strong>{upcoming.length}</strong></div>
       <div><FiTarget/><span>Total Matches</span><strong>{userData.player?.matches_played??0}</strong></div>
       <div><FiAward/><span>Wins</span><strong>{userData.player?.wins??0}</strong></div>
       <div><FiZap/><span>Kills</span><strong>{userData.player?.total_kills??0}</strong></div>
      </>}
     </section>
     {unread>0&&<button className="op-app-alert-strip" onClick={()=>go('alerts')}><FiBell/>
      <span><b>{unread} new match alerts</b><small>Tap to view</small></span><FiChevronRight/>
     </button>}
     <div className="op-app-section-title"><div><span className="op-app-overline">QUICK ACCESS</span><h2>Your Features</h2></div><FiGrid/></div>
     <section className="op-app-feature-grid">
      {admin?ALL_MODULES.slice(0,8).map(x=><FeatureCard key={x.id} icon={x.icon} title={x.title} sub={x.sub}
       accent={x.tone} onClick={()=>go(x.id==='schedule'?'schedule':'manage',x.id)}/>):
      <>
       <FeatureCard icon={FiCalendar} title="Match Center" sub="Upcoming matches & lobbies" accent="cyan" onClick={()=>go('matches')}/>
       <FeatureCard icon={FiCreditCard} title="My Wallet" sub="Withdrawals & payment history" accent="pink" onClick={()=>go('wallet')}/>
       <FeatureCard icon={FiBell} title="Notifications" sub="Match reminders & inbox" accent="purple" onClick={()=>go('alerts')} chip={unread||null}/>
       <FeatureCard icon={FiLayers} title="My Team" sub={userData?.team?.name||'Squad details'} accent="mint" onClick={()=>go('team')}/>
       <FeatureCard icon={FiAward} title="Tournaments" sub="Competitions & schedules" accent="gold" onClick={()=>go('tournaments')}/>
       <FeatureCard icon={FiTrendingUp} title="My Performance" sub="Matches, Wins & Kills" accent="blue" onClick={()=>go('performance')}/>
       {NEW_PLAYER_MODULES.map(x=><FeatureCard key={x.id} icon={x.icon} title={x.title} sub={x.sub} accent={x.tone} onClick={()=>go('extra',x.id)}/>)}
      </>}
     </section>
     {upcoming.length>0&&<section className="op-app-next-match"><div className="op-app-section-title">
      <div><span className="op-app-overline">UP NEXT</span><h2>Next Match</h2></div>
      <button onClick={()=>go(admin?'schedule':'matches')}>View All <FiChevronRight/></button>
     </div><MatchCard match={upcoming[0]}/></section>}
    </div>}
    {tab==='matches'&&!admin&&<div className="op-app-view">
     <SectionHead overline="YOUR LIVE FIXTURES" title="My Match Center" subtitle="Matches published for your squad appear here."/>
     {matchError&&<p className="op-app-error" role="alert">{matchError}</p>}
     <div className="op-app-inline"><span><FiClock/> Bangladesh Time (UTC+6)</span><button onClick={loadMatches}><FiRefreshCw/> Refresh</button></div>
     {!approved?<EmptyPanel icon={FiShield} title="Approval Pending" description="Your player account must be approved to view match schedules."/>:
      fixtures.schedules.length===0?<EmptyPanel icon={FiCalendar} title="No Scheduled Matches" description="New matches appear here automatically when published."/>:
      <div className="op-app-match-list">{fixtures.schedules.map(x=><MatchCard key={x.id} match={x}/>)}</div>}
    </div>}
    {tab==='wallet'&&!admin&&<div className="op-app-view">
     <SectionHead overline="SECURE FINANCE" title="My Wallet" subtitle="Your existing secure bKash/Nagad withdrawal features."/>
     {approved?<PlayerWallet/>:<EmptyPanel icon={FiLock} title="Wallet Unavailable" description="Only approved players can request withdrawals."/>}
    </div>}
    {tab==='alerts'&&<div className="op-app-view">
     <SectionHead overline="MATCH ALERTS" title="Notifications Inbox" subtitle="New match announcements and countdown reminders."/>
     {matchError&&<p role="alert" className="op-app-error">{matchError}</p>}
     <div className="op-app-inline"><span>{unread} unread</span><button onClick={loadMatches}><FiRefreshCw/> Refresh</button></div>
     {!approved&&!admin?<EmptyPanel icon={FiShield} title="Approved Player Required" description="You must be an approved player to receive match alerts."/>:
     fixtures.inbox.length===0?<EmptyPanel icon={FiBell} title="Inbox Empty" description="New match notifications will appear here."/>:
     <div className="op-app-inbox">{fixtures.inbox.map(note=>{
      const match=fixtures.schedules.find(s=>s.id===note.schedule_id);
      return <button key={note.id} className={'op-app-notice '+(!note.read_at?'is-unread':'')}
       onClick={()=>{if(!note.read_at)markRead(note.id);if(match)go(admin?'schedule':'matches')}}>
       <span className="op-app-notice-icon"><FiBell/></span><span><strong>{
        note.event_key==='created'?'New Match Published':
        note.event_key==='60m'?'Match starts in 1 hour':
        note.event_key==='30m'?'Match starts in 30 minutes':'Match starts in 15 minutes'
       }</strong><small>{match?.title||'Match Center'} · {dateTime.format(new Date(note.created_at))}</small></span>
       {!note.read_at&&<i/>}
      </button>;
     })}</div>}
     {!admin&&approved&&<details className="op-app-push-settings"><summary><FiSmartphone/> Enable Phone Push Notifications</summary>
      <PlayerMatchCenter/>
     </details>}
    </div>}
    {tab==='team'&&!admin&&<div className="op-app-view">
     <SectionHead overline="MY TEAM" title="My Squad" subtitle="Your current squad information."/>
     {userData.team?<div className="op-app-info-card"><FiLayers/><h2>{userData.team.name}</h2>
      <p>{userData.team.description||'OVER POWER ESPORTS TEAM'}</p>
      <dl><dt>Coach</dt><dd>{userData.team.coach_name||'—'}</dd><dt>Manager</dt><dd>{userData.team.manager_name||'—'}</dd>
       <dt>Roster Status</dt><dd>{userData.player?.is_active?'Active':'Inactive'}</dd></dl></div>:
      <EmptyPanel icon={FiLayers} title="No Team Assigned" description="Your team details will appear once Admin assigns a squad."/>}
    </div>}
    {tab==='tournaments'&&!admin&&<div className="op-app-view">
     <SectionHead overline="COMPETE & WIN" title="Tournaments" subtitle="Live tournaments from your existing account."/>
     {!userData.tournaments?.length?<EmptyPanel icon={FiAward} title="No Tournaments Yet" description="New competitions will appear here."/>:
      <div className="op-app-tournament-grid">{userData.tournaments.map(t=><article key={t.id} className="op-app-tournament">
       <FiAward/><span>{t.status||'Upcoming'}</span><h3>{t.name}</h3>
       <p>Starts: {t.start_date?shortDate.format(new Date(t.start_date+'T12:00:00+06:00')):'To Be Announced'}</p>
       <strong>Prize Pool: {currency(t.prize_pool)}</strong>
      </article>)}</div>}
    </div>}
    {tab==='performance'&&!admin&&<div className="op-app-view">
     <SectionHead overline="GAME STATISTICS" title="My Performance" subtitle="Your recorded matches, wins and kills."/>
     <div className="op-app-stats"><div><FiCalendar/><span>Total Matches</span><strong>{userData.player?.matches_played??0}</strong></div>
      <div><FiAward/><span>Total Wins</span><strong>{userData.player?.wins??0}</strong></div>
      <div><FiTarget/><span>Total Kills</span><strong>{userData.player?.total_kills??0}</strong></div></div>
    </div>}
    {tab==='extra'&&!admin&&module&&NEW_PLAYER_MODULES.some(x=>x.id===module)&&<div className="op-app-view op-app-management-view">
     <button className="op-app-back" type="button" onClick={()=>go('home')}><FiArrowLeft/> Home</button>
     <SectionHead overline="PLAYER MODULE" title={activeModule?.title||'Player'} subtitle="New Software Module"/>
     <PlayerExtraModule module={module}/>
    </div>}
    {tab==='profile'&&<div className="op-app-view">
     <SectionHead overline="ACCOUNT CENTER" title="My Profile" subtitle="Your verified account information."/>
     <div className="op-app-profile">
      <div className="op-app-profile-avatar"><FiUser/></div>
      <h2>{displayName}</h2><span className="op-app-profile-pill">{admin?'Main Admin':userData.player?.status||'Player'}</span>
      <dl><dt>Email</dt><dd>{userData.profile?.email||'—'}</dd>
       <dt>Account Type</dt><dd>{admin?'Administrator':'Player'}</dd>
       {!admin&&<><dt>Squads</dt><dd>{userData.player?.team_name||'—'}</dd>
        <dt>Verification</dt><dd>{userData.player?.verified?'Verified':'Not verified'}</dd>
        <dt>Roster</dt><dd>{userData.player?.is_active?'Active':'Inactive'}</dd></>}
      </dl>
      <button className="op-app-logout" onClick={signOut} disabled={busy}><FiLogOut/> Log Out</button>
     </div>
    </div>}
    {tab==='manage'&&admin&&!module&&<div className="op-app-view">
     <SectionHead overline="ADMIN OPERATIONS" title="Software Management" subtitle="Open any management feature directly inside the app."/>
     <div className="op-app-feature-grid">{ALL_MODULES.map(x=><FeatureCard key={x.id} title={x.title} sub={x.sub}
      icon={x.icon} accent={x.tone} onClick={()=>go('manage',x.id)}/>)}</div>
    </div>}
    {showAdminComponent&&<div className="op-app-view op-app-management-view">
     <button className="op-app-back" type="button" onClick={()=>go('manage')}><FiArrowLeft/> All Modules</button>
     <SectionHead overline="ADMIN MODULE" title={activeModule?.title||'Management'} subtitle={activeModule?.sub||'Existing Admin Controls'}/>
     <AdminModule key={currentModule} module={currentModule}/>
    </div>}
    {tab==='alerts'&&admin&&fixtures.schedules.length>0&&
     <div className="op-app-view op-app-schedule-access"><button className="op-app-primary" onClick={()=>go('schedule')}>
      <FiCalendar/> Manage Schedules <FiChevronRight/></button></div>}
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
   <b>{cancelled?'Cancelled':'PUBLISHED'}</b></div>
  <h3>{match.title}</h3><p>{match.lobby_details||'Lobby details coming soon'}</p>
  <div className="op-app-match-values"><span>Entry Fee <strong>{currency(match.entry_fee)}</strong></span>
   <span>Prize Pool <strong>{match.prize_pool||'—'}</strong></span></div>
  {match.notes&&<p className="op-app-match-note">{match.notes}</p>}
 </article>;
}
