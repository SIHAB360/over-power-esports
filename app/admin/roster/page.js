"use client";
import {useCallback,useEffect,useMemo,useState} from "react";
import {supabase} from "../../lib/supabase";
import {FiActivity,FiEye,FiEyeOff,FiRefreshCw,FiUsers,FiLayers,FiCheckCircle} from "react-icons/fi";
import "./roster.css";

export default function RosterPage(){
 const [players,setPlayers]=useState([]);
 const [teams,setTeams]=useState([]);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState('');
 const [query,setQuery]=useState('');
 const [filter,setFilter]=useState('all');
 const [notice,setNotice]=useState('');

 const auth=useCallback(async()=>{
  const {data:{session}}=await supabase.auth.getSession();
  if(!session?.access_token)throw Error('Main Admin sign-in required');
  return {Authorization:'Bearer '+session.access_token};
 },[]);
 const reload=useCallback(async()=>{
  setLoading(true);
  try{
   const res=await fetch('/api/admin/roster',{headers:await auth(),cache:'no-store'});
   const body=await res.json();
   if(!res.ok)throw Error(body.message||'Roster unavailable');
   setPlayers(body.players||[]);setTeams(body.teams||[]);setNotice('');
  }catch(e){setNotice(e.message)}
  finally{setLoading(false)}
 },[auth]);
 useEffect(()=>{reload()},[reload]);
 const change=async(action,id,payload)=>{
  setBusy(id);setNotice('');
  try{
   const body=action==='player_active'
    ? {action,playerId:id,active:payload}
    : action==='squad_visibility'
     ? {action,teamId:id,visible:payload}
     : {action,playerId:id,teamId:payload};
   const response=await fetch('/api/admin/roster',{
    method:'POST',headers:{...(await auth()),'Content-Type':'application/json'},
    body:JSON.stringify(body)
   });
   const json=await response.json();
   if(!response.ok)throw Error(json.message||'Update not saved');
   if(action==='squad_visibility'){
    setTeams(current=>current.map(t=>t.id===id?{...t,...json.updated}:t));
   }else{
    setPlayers(current=>current.map(p=>p.id===id?{...p,...json.updated}:p));
   }
   setNotice('Saved to Supabase. Homepage squad overlay and Match Center will reflect this change.');
  }catch(e){setNotice(e.message)}
  finally{setBusy('')}
 };
 const teamName=id=>teams.find(t=>t.id===id)?.team_name||'Unassigned';
 const approved=p=>['approved','active'].includes(String(p.status||'').toLowerCase());
 const activeCount=players.filter(p=>p.is_active!==false&&approved(p)).length;
 const visibleSquads=teams.filter(t=>t.show_on_homepage!==false).length;
 const filtered=useMemo(()=>players.filter(p=>{
  const q=query.trim().toLowerCase();
  return (!q||[p.ign,p.full_name,p.team_name,teamName(p.team_id)].join(' ').toLowerCase().includes(q))
   &&(filter==='all'||filter==='active'&&p.is_active!==false&&approved(p)
      ||filter==='inactive'&&(p.is_active===false||!approved(p))
      ||filter===p.team_id);
 }),[players,teams,query,filter]);

 return <main className="op-roster-page">
  <header className="op-roster-hero">
   <span className="op-roster-kicker"><FiActivity/> MAIN ADMIN / LIVE ROSTER CONTROL</span>
   <h1>Player Activity &amp; Squad Visibility</h1>
   <p>Turn player homepage visibility on or off, show or hide entire squad overlays, or move players between squads. Existing matches and earnings remain untouched.</p>
   <button className="op-roster-refresh" type="button" onClick={reload} disabled={loading||!!busy}><FiRefreshCw/> Refresh roster</button>
  </header>
  <div className="op-roster-stats">
   <article><FiUsers/><span>Registered players</span><strong>{players.length}</strong></article>
   <article><FiCheckCircle/><span>Active &amp; approved</span><strong>{activeCount}</strong></article>
   <article><FiLayers/><span>Visible squad overlays</span><strong>{visibleSquads} / {teams.length}</strong></article>
  </div>
  {notice&&<p className="op-roster-notice" role="status">{notice}</p>}
  <section className="op-roster-section">
   <h2>Squad overlay controls</h2>
   <p className="op-roster-description">Hide a squad from the homepage without removing any players, accounts or historical records.</p>
   <div className="op-roster-squads">
    {teams.map(t=><article className="op-roster-squad" key={t.id}>
     <div><strong>{t.team_name}</strong><span>{players.filter(p=>p.team_id===t.id).length} assigned players</span></div>
     <button type="button" disabled={!!busy||loading}
      className={'op-roster-toggle '+(t.show_on_homepage!==false?'is-on':'is-off')}
      onClick={()=>change('squad_visibility',t.id,t.show_on_homepage===false)}
      aria-pressed={t.show_on_homepage!==false}
      aria-label={(t.show_on_homepage!==false?'Hide ':'Show ')+t.team_name+' on homepage'}>
      {t.show_on_homepage!==false?<FiEye/>:<FiEyeOff/>}
      {t.show_on_homepage!==false?'Visible':'Hidden'}
     </button>
    </article>)}
   </div>
  </section>
  <section className="op-roster-section">
   <h2>Player active / inactive &amp; team assignment</h2>
   <p className="op-roster-description">Choose a player to publish or hide from the homepage. Only approved, active players can be picked for a new match. A player's login is not disabled by this switch.</p>
   <div className="op-roster-toolbar">
    <input type="search" placeholder="Search player or squad" aria-label="Search roster" value={query} onChange={e=>setQuery(e.target.value)}/>
    <select value={filter} aria-label="Filter roster" onChange={e=>setFilter(e.target.value)}>
     <option value="all">All players ({players.length})</option>
     <option value="active">Active ({activeCount})</option>
     <option value="inactive">Inactive / not approved</option>
     {teams.map(t=><option key={t.id} value={t.id}>{t.team_name}</option>)}
    </select>
   </div>
   <div className="op-roster-list">
    {filtered.map(p=><article className="op-roster-player" key={p.id}>
     <div className="op-roster-person">
      <img src={p.profile_image||p.avatar_url||'/players/default.png'} alt="" loading="lazy"/>
      <div><strong>{p.ign||p.full_name||'Player'}</strong>
       <small>{p.full_name||p.ign||'Registered player'} · {p.status||'pending'}</small>
      </div>
     </div>
     <label className="op-roster-assign"><span>Squad</span>
      <select value={p.team_id||''} disabled={!!busy||loading}
       aria-label={'Assign '+(p.ign||p.full_name)+' to squad'}
       onChange={e=>change('move_player',p.id,e.target.value||null)}>
       <option value="">Unassigned</option>
       {teams.map(t=><option key={t.id} value={t.id}>{t.team_name}</option>)}
      </select>
     </label>
     <button type="button" disabled={!!busy||loading||!approved(p)}
      className={'op-roster-toggle '+(p.is_active!==false&&approved(p)?'is-on':'is-off')}
      aria-pressed={p.is_active!==false&&approved(p)}
      onClick={()=>change('player_active',p.id,p.is_active===false)}
      aria-label={(p.is_active!==false?'Deactivate ':'Activate ')+(p.ign||p.full_name||'player')}>
      {p.is_active!==false&&approved(p)?<FiEye/>:<FiEyeOff/>}
      {p.is_active!==false&&approved(p)?'Active':'Inactive'}
     </button>
    </article>)}
    {!loading&&!filtered.length&&<p className="op-roster-empty">No players match these filters.</p>}
    {loading&&<p className="op-roster-empty">Loading registered roster…</p>}
   </div>
  </section>
 </main>;
}
