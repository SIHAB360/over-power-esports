'use client';
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {supabase} from '../lib/supabase';
import Image from 'next/image';
import officialLogo from '../assets/logo.png';
import {AdminModule,PlayerWallet} from './SoftwareModules';
import PlayerMatchCenter from '../player/dashboard/MatchCenterWidget';
import NativePushSetup from './NativePushSetup';
import LiveAnnouncement from './LiveAnnouncement';
import {
 FiHome,FiCalendar,FiCreditCard,FiBell,FiUser,FiGrid,FiUsers,FiLayers,
 FiAward,FiActivity,FiTarget,FiDollarSign,FiShield,FiImage,FiLogOut,
 FiChevronRight,FiArrowLeft,FiRefreshCw,FiEye,FiEyeOff,FiLock,
 FiZap,FiCheckCircle,FiClock,FiMenu,FiX,FiTrendingUp,FiSmartphone
} from 'react-icons/fi';
import './software.css';

const currency=value=>'৳'+Number(value||0).toLocaleString('en-BD',{maximumFractionDigits:2});
const dateTime=new Intl.DateTimeFormat('en-BD',{timeZone:'Asia/Dhaka',day:'2-digit',month:'short',hour:'numeric',minute:'2-digit',hour12:true});
const shortDate=new Intl.DateTimeFormat('en-BD',{timeZone:'Asia/Dhaka',day:'2-digit',month:'short',year:'numeric'});
const MODULES=[
 {id:'software',title:'Software Control',sub:'Publish live announcements',icon:FiSmartphone,tone:'cyan'},
 {id:'schedule',title:'Match Schedule',sub:'Create matches and alert players',icon:FiCalendar,tone:'cyan'},
 {id:'players',title:'Player Management',sub:'Accounts and approvals',icon:FiUsers,tone:'blue'},
 {id:'roster',title:'Roster Control',sub:'Active players and squads',icon:FiActivity,tone:'purple'},
 {id:'matches',title:'Match Management',sub:'Match results and performance',icon:FiTarget,tone:'pink'},
 {id:'teams',title:'Team Management',sub:'Team and squad details',icon:FiLayers,tone:'mint'},
 {id:'tournaments',title:'Tournaments',sub:'Manage competitions',icon:FiAward,tone:'gold'},
 {id:'withdrawals',title:'Withdrawals',sub:'Review and approve payments',icon:FiCreditCard,tone:'pink'},
 {id:'profit',title:'Profit & Accounts',sub:'Existing match finances',icon:FiDollarSign,tone:'mint'},
 {id:'achievements',title:'Achievements',sub:'Gallery and achievements',icon:FiImage,tone:'purple'},
 {id:'visitors',title:'Visitor Analytics',sub:'Site traffic and activity',icon:FiActivity,tone:'cyan'},
 {id:'moderators',title:'Moderators',sub:'Permissions and moderation',icon:FiShield,tone:'blue'}
];
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
 const [remote,setRemote]=useState(null);
 const updateRemote=useCallback(next=>setRemote(old=>JSON.stringify(old)===JSON.stringify(next)?old:next),[]);
 const [userData,setUserData]=useState(null);
 const [tab,setTab]=useState('home');
 const [module,setModule]=useState(null);
 const [sideOpen,setSideOpen]=useState(false);
 const [fixtures,setFixtures]=useState({schedules:[],inbox:[],unread:0});
 const [matchError,setMatchError]=useState('');
 const [matchBanner,setMatchBanner]=useState(null);
 const knownAlerts=useRef(null);
 const [busy,setBusy]=useState(false);
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [showPassword,setShowPassword]=useState(false);
 const [forgot,setForgot]=useState(false);
 const [error,setError]=useState('');
 const role=userData?.role||'';
 const admin=role==='admin';
 const approved=String(userData?.player?.status||'').toLowerCase()==='approved';
 const tabs=admin?ADMIN_TABS:PLAYER_TABS.filter(x=>(x.id!=='matches'||remote?.matches_enabled!==false)&&(x.id!=='wallet'||remote?.wallet_enabled!==false));
 const activeModule=MODULES.find(x=>x.id===module);
 const upcoming=useMemo(()=>fixtures.schedules.filter(x=>x.status==='published'&&new Date(x.starts_at).getTime()>Date.now()),[fixtures.schedules]);

 const authenticatedFetch=useCallback(async(path,method='GET',body)=>{
  const {data:{session}}=await supabase.auth.getSession();
  if(!session?.access_token)throw Error('Your session expired. Please sign in again.');
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
   const unreadNotes=(data.inbox||[]).filter(x=>!x.read_at);
   const newNotes=knownAlerts.current===null?unreadNotes:
    unreadNotes.filter(x=>!knownAlerts.current.has(x.id));
   if(newNotes.length){
    const note=newNotes[0];
    const match=(data.schedules||[]).find(x=>x.id===note.schedule_id);
    setMatchBanner({id:note.id,title:note.event_key==='created'?'New Match Published':'Upcoming Match Reminder',
     subtitle:match?.title||'Your squad has a match alert'});
   }
   knownAlerts.current=new Set((data.inbox||[]).map(x=>x.id));
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
    knownAlerts.current=null;setMatchBanner(null);
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
 const signIn=async(event)=>{
  event.preventDefault();setBusy(true);setError('');
  try{
   const {error:loginError}=await supabase.auth.signInWithPassword({
    email:email.trim(),password
   });
   if(loginError)throw loginError;
   setPassword('');
   await loadAccount();
  }catch(err){setError(err.message||'Sign in failed.')}
  finally{setBusy(false)}
 };
 const resetPassword=async(event)=>{
  event.preventDefault();setBusy(true);setError('');
  try{
   if(!email.trim())throw Error('Enter your email address.');
   const {error:resetError}=await supabase.auth.resetPasswordForEmail(email.trim(),{
    redirectTo:window.location.origin+'/reset-password'
   });
   if(resetError)throw resetError;
   setError('If the email is registered, check your inbox for a password reset link.');
  }catch(err){setError(err.message)}finally{setBusy(false)}
 };
 const signOut=async()=>{
  setBusy(true);
  try{
   // Never keep sending private squad alerts to a device after user logout.
   const token=window.localStorage.getItem('op-native-push-token');
   const owner=window.localStorage.getItem('op-native-push-user-id');
   const {data:{session}}=await supabase.auth.getSession();
   if(token&&session?.access_token&&owner===session.user?.id){
    try{
     await fetch('/api/player/native-push',{method:'DELETE',keepalive:true,
      headers:{Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},
      body:JSON.stringify({token})});
    }catch(e){console.warn('Push registration cleanup deferred',e?.message)}
   }
   window.OverPowerNative?.postMessage?.('disable-push');
   window.localStorage.removeItem('op-native-push-opted-in');
   window.localStorage.removeItem('op-native-push-token');
   window.localStorage.removeItem('op-native-push-user-id');
   const {error:outError}=await supabase.auth.signOut();
   if(outError)throw outError;
  }catch(err){setError(err.message)}finally{setBusy(false)}
 };
 const go=(destination,submodule=null)=>{
  setTab(destination);setModule(submodule);setSideOpen(false);
  window.scrollTo({top:0,behavior:'instant'});
 };
 const markRead=async(id)=>{
  try{
   await authenticatedFetch('/api/player/match-schedules','PATCH',{id});
   setFixtures(old=>({...old,inbox:old.inbox.map(n=>n.id===id?{...n,read_at:new Date().toISOString()}:n),
    unread:Math.max(0,old.unread-1)}));
  }catch(err){setMatchError(err.message)}
 };
 if(stage==='checking')return <main className="op-app-root op-app-gate"><div className="op-app-splash"><div className="op-app-brand-icon"><Image src={officialLogo} alt="OVER POWER ESPORTS official logo" width={72} height={72} /></div><strong>OVER POWER</strong><small>ESPORTS APP</small><p role="status">Verifying your account…</p></div></main>;
 if(stage==='login')return <main className="op-app-root op-app-gate">
  <section className="op-app-login" aria-label="OVER POWER ESPORTS software login">
   <div className="op-app-login-hero"><div className="op-app-brand-icon"><FiZap/></div>
    <span className="op-app-overline">OFFICIAL ESPORTS APPLICATION</span>
    <h1>OVER POWER <em>ESPORTS</em></h1>
    <p>Your team, matches, inbox and wallet in one app.</p>
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
      {busy?'Please wait…':forgot?'Send reset link':'Secure Sign In'} <FiChevronRight/>
     </button>
    </form>
    <button className="op-app-link" type="button" onClick={()=>{setForgot(!forgot);setError('')}}>
     {forgot?'← Back to Sign In':'Forgot your password?'}
    </button>
    <p className="op-app-login-safe"><FiLock/> Your credentials are verified securely through Supabase Authentication.</p>
   </div>
  </section>
 </main>;
 if(stage==='error')return <main className="op-app-root op-app-gate"><div className="op-app-fail">
  <FiShield/><h2>Unable to open the app</h2><p role="alert">{error}</p>
  <button className="op-app-primary" onClick={()=>{setError('');setStage('checking');loadAccount()}}>Try Again <FiRefreshCw/></button>
  <button className="op-app-link" onClick={signOut}>Sign Out</button></div></main>;

 const displayName=userData?.player?.ign||userData?.profile?.full_name||'OVER POWER';
 const welcomeName=admin?'ADMIN':displayName;
 const showAdminComponent=admin&&(tab==='schedule'||(tab==='manage'&&module));
 const currentModule=tab==='schedule'?'schedule':module;
 const unread=fixtures.unread||0;
 return <div className="op-app-root" data-app-role={role} style={remote?.accent_color?{'--op-remote-accent':remote.accent_color}:undefined}>
  <LiveAnnouncement onSettings={updateRemote} hidden/>
  {sideOpen&&<button className="op-app-scrim" type="button" onClick={()=>setSideOpen(false)} aria-label="Close application menu"/>}
  <aside className={'op-app-sidebar'+(sideOpen?' is-open':'')} aria-label="Software navigation">
   <div className="op-app-sidebar-logo"><span><Image src={officialLogo} alt="" width={46} height={46}/></span><div><strong>OVER POWER</strong><small>ESPORTS</small></div>
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
    <button onClick={signOut}><FiLogOut/> Sign Out</button>
   </div>
  </aside>
  <div className="op-app-main">
   <header className="op-app-topbar">
    <div className="op-app-top-left">
     <button className="op-app-hamburger" aria-label="Open application menu" onClick={()=>setSideOpen(true)}><FiMenu/></button>
     <div className="op-app-top-logo"><Image src={officialLogo} alt="OVER POWER official logo" width={38} height={38}/></div>
     <div><b>{remote?.app_title||'OVER POWER ESPORTS'}</b><small>ESPORTS APP</small></div>
    </div>
    <div className="op-app-top-actions">
     <span className="op-app-secure"><FiShield/> SECURE</span>
     <button className="op-app-top-bell" aria-label={'Notifications '+unread} onClick={()=>go('alerts')}>
      <FiBell/>{unread>0&&<span>{unread>9?'9+':unread}</span>}
     </button>
     <button className="op-app-avatar" aria-label="My profile" onClick={()=>go('profile')}>{welcomeName.slice(0,2).toUpperCase()}</button>
    </div>
   </header>
   {matchBanner&&<div className="op-app-push-banner" role="alert">
    <span className="op-app-push-banner-icon"><FiBell/></span>
    <div><strong>{matchBanner.title}</strong><small>{matchBanner.subtitle}</small></div>
    <button type="button" onClick={()=>{go('alerts');setMatchBanner(null)}}>View</button>
    <button type="button" onClick={()=>setMatchBanner(null)} aria-label="Dismiss notification"><FiX/></button>
   </div>}
   <main className={'op-app-content'+(showAdminComponent?' is-management':'')}>
    {tab==='home'&&<div className="op-app-view">
     <section className="op-app-welcome">
      <div className="op-app-welcome-copy"><span className="op-app-overline"><FiZap/> OVER POWER COMMAND CENTER</span>
       <p className="op-app-greet">{greetings()},</p>
       <h1>{welcomeName}</h1>
       <p>{admin?'Manage your teams, matches, players and finance inside the app.':
        'Your upcoming matches, notifications and squad updates in one place.'}</p>
       <span className="op-app-live"><i/> LIVE DATABASE CONNECTED</span>
      </div><div className="op-app-welcome-art" aria-hidden="true"><Image src={officialLogo} alt="" width={190} height={190}/></div>
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
     {remote?.announcement_enabled&&remote.announcement&&<aside role="status" style={{margin:'16px 0',padding:16,border:'1px solid var(--op-remote-accent,#0ea5e9)',borderRadius:12}}><strong>OFFICIAL ANNOUNCEMENT</strong><p style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{remote.announcement}</p></aside>}
     {remote?.welcome_message&&<p style={{margin:'8px 0 14px',fontSize:15,opacity:.85}}>{remote.welcome_message}</p>}
     {remote?.banner_url&&<img src={remote.banner_url} alt="Official event banner" loading="lazy" style={{width:'100%',maxHeight:260,objectFit:'cover',borderRadius:16,margin:'12px 0'}}/>}
     {remote?.maintenance_enabled&&<aside role="status" style={{padding:16,border:'1px solid #f59e0b',borderRadius:12,margin:'12px 0'}}>Maintenance notice: Some services may be temporarily unavailable.</aside>}
     {unread>0&&<button className="op-app-alert-strip" onClick={()=>go('alerts')}><FiBell/>
      <span><b>{unread} new match notifications</b><small>Tap to view</small></span><FiChevronRight/>
     </button>}
     <div className="op-app-section-title"><div><span className="op-app-overline">QUICK ACCESS</span><h2>Your Features</h2></div><FiGrid/></div>
     {!admin&&approved&&<section className="op-app-native-onboarding" aria-label="Match notification settings">
       <NativePushSetup hideWebHint/>
     </section>}
     <section className="op-app-feature-grid">
      {admin?MODULES.slice(0,8).map(x=><FeatureCard key={x.id} icon={x.icon} title={x.title} sub={x.sub}
       accent={x.tone} onClick={()=>go(x.id==='schedule'?'schedule':'manage',x.id)}/>):
      <>
       {remote?.matches_enabled!==false&&<FeatureCard icon={FiCalendar} title="Match Center" sub="Upcoming Matches and Lobbies" accent="cyan" onClick={()=>remote?.matches_enabled!==false&&go('matches')}/>}
       {remote?.wallet_enabled!==false&&<FeatureCard icon={FiCreditCard} title="My Wallet" sub="Withdrawals and payment history" accent="pink" onClick={()=>remote?.wallet_enabled!==false&&go('wallet')}/>}
       <FeatureCard icon={FiBell} title="Notifications" sub="Match reminders and inbox" accent="purple" onClick={()=>go('alerts')} chip={unread||null}/>
       <FeatureCard icon={FiLayers} title="My Team" sub={userData?.team?.name||'Squad details'} accent="mint" onClick={()=>go('team')}/>
       {remote?.tournaments_enabled!==false&&<FeatureCard icon={FiAward} title="Tournaments" sub="Competitions and schedule" accent="gold" onClick={()=>remote?.tournaments_enabled!==false&&go('tournaments')}/>}
       <FeatureCard icon={FiTrendingUp} title="My Performance" sub="Matches, wins and kills" accent="blue" onClick={()=>go('performance')}/>
      </>}
     </section>
     {remote?.matches_enabled!==false&&upcoming.length>0&&<section className="op-app-next-match"><div className="op-app-section-title">
      <div><span className="op-app-overline">UP NEXT</span><h2>Next Match</h2></div>
      <button onClick={()=>go(admin?'schedule':'matches')}>View All <FiChevronRight/></button>
     </div><MatchCard match={upcoming[0]}/></section>}
    </div>}
    {tab==='matches'&&!admin&&remote?.matches_enabled!==false&&<div className="op-app-view">
     <SectionHead overline="YOUR LIVE FIXTURES" title="My Match Center" subtitle="Published match schedules for your approved squad appear here."/>
     {matchError&&<p className="op-app-error" role="alert">{matchError}</p>}
     <div className="op-app-inline"><span><FiClock/> Bangladesh Time (UTC+6)</span><button onClick={loadMatches}><FiRefreshCw/> Refresh</button></div>
     {!approved?<EmptyPanel icon={FiShield} title="Approval Pending" description="Your player account must be approved to view schedules."/>:
      fixtures.schedules.length===0?<EmptyPanel icon={FiCalendar} title="No Scheduled Matches" description="Published matches will appear here automatically."/>:
      <div className="op-app-match-list">{fixtures.schedules.map(x=><MatchCard key={x.id} match={x}/>)}</div>}
    </div>}
    {tab==='wallet'&&!admin&&<div className="op-app-view">
     <SectionHead overline="SECURE FINANCE" title="My Wallet" subtitle="Secure existing bKash and Nagad withdrawals."/>
     {approved?<PlayerWallet/>:<EmptyPanel icon={FiLock} title="Wallet Unavailable" description="Only approved players may request withdrawals."/>}
    </div>}
    {tab==='alerts'&&<div className="op-app-view">
     <SectionHead overline="MATCH ALERTS" title="Notifications Inbox" subtitle="Published matches and start-time reminders."/>
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
     {!admin&&approved&&<details className="op-app-push-settings" open><summary><FiSmartphone/> Enable Phone Push Notifications</summary>
      <NativePushSetup/>
      <PlayerMatchCenter/>
     </details>}
    </div>}
    {tab==='team'&&!admin&&<div className="op-app-view">
     <SectionHead overline="MY TEAM" title="My Squad" subtitle="Your current team details."/>
     {userData.team?<div className="op-app-info-card"><FiLayers/><h2>{userData.team.name}</h2>
      <p>{userData.team.description||'OVER POWER ESPORTS TEAM'}</p>
      <dl><dt>Coach</dt><dd>{userData.team.coach_name||'—'}</dd><dt>Manager</dt><dd>{userData.team.manager_name||'—'}</dd>
       <dt>Roster Status</dt><dd>{userData.player?.is_active?'Active':'Inactive'}</dd></dl></div>:
      <EmptyPanel icon={FiLayers} title="No Team Assigned" description="Your team details will appear once assigned."/>}
    </div>}
    {tab==='tournaments'&&!admin&&<div className="op-app-view">
     <SectionHead overline="COMPETE & WIN" title="Tournaments" subtitle="Live tournaments from the existing database."/>
     {!userData.tournaments?.length?<EmptyPanel icon={FiAward} title="No Tournaments Available" description="New tournaments will appear here."/>:
      <div className="op-app-tournament-grid">{userData.tournaments.map(t=><article key={t.id} className="op-app-tournament">
       <FiAward/><span>{t.status||'Upcoming'}</span><h3>{t.name}</h3>
       <p>Starts: {t.start_date?shortDate.format(new Date(t.start_date+'T12:00:00+06:00')):'To Be Announced'}</p>
       <strong>Prize Pool: {currency(t.prize_pool)}</strong>
      </article>)}</div>}
    </div>}
    {tab==='performance'&&!admin&&<div className="op-app-view">
     <SectionHead overline="GAME STATISTICS" title="My Performance" subtitle="Your saved matches, wins and kills."/>
     <div className="op-app-stats"><div><FiCalendar/><span>Total Matches</span><strong>{userData.player?.matches_played??0}</strong></div>
      <div><FiAward/><span>Total Wins</span><strong>{userData.player?.wins??0}</strong></div>
      <div><FiTarget/><span>Total Kills</span><strong>{userData.player?.total_kills??0}</strong></div></div>
    </div>}
    {tab==='profile'&&<div className="op-app-view">
     <SectionHead overline="ACCOUNT CENTER" title="My Profile" subtitle="Your current verified account details."/>
     <div className="op-app-profile">
      <div className="op-app-profile-avatar"><FiUser/></div>
      <h2>{displayName}</h2><span className="op-app-profile-pill">{admin?'Main Admin':userData.player?.status||'Player'}</span>
      <dl><dt>Email</dt><dd>{userData.profile?.email||'—'}</dd>
       <dt>Account Type</dt><dd>{admin?'Administrator':'Player'}</dd>
       {!admin&&<><dt>Squads</dt><dd>{userData.player?.team_name||'—'}</dd>
        <dt>Verification</dt><dd>{userData.player?.verified?'Verified':'Not verified'}</dd>
        <dt>Roster</dt><dd>{userData.player?.is_active?'Active':'Inactive'}</dd></>}
      </dl>
      <button className="op-app-logout" onClick={signOut} disabled={busy}><FiLogOut/> Sign Out</button>
     </div>
    </div>}
    {tab==='manage'&&admin&&!module&&<div className="op-app-view">
     <SectionHead overline="ADMIN OPERATIONS" title="App Management" subtitle="Open any management module directly inside this app."/>
     <div className="op-app-feature-grid">{MODULES.map(x=><FeatureCard key={x.id} title={x.title} sub={x.sub}
      icon={x.icon} accent={x.tone} onClick={()=>go('manage',x.id)}/>)}</div>
    </div>}
    {showAdminComponent&&<div className="op-app-view op-app-management-view">
     <button className="op-app-back" type="button" onClick={()=>go('manage')}><FiArrowLeft/> All Modules</button>
     <SectionHead overline="ADMIN MODULE" title={activeModule?.title||'Management'} subtitle={activeModule?.sub||'Existing administrative tools'}/>
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
  <h3>{match.title}</h3><p>{match.lobby_details||'Lobby details will appear here.'}</p>
  <div className="op-app-match-values"><span>Entry Fee <strong>{currency(match.entry_fee)}</strong></span>
   <span>Prize Pool <strong>{match.prize_pool||'—'}</strong></span></div>
  {match.notes&&<p className="op-app-match-note">{match.notes}</p>}
 </article>;
}
