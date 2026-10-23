'use client';
import {useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import {supabase} from '../../../lib/supabase';
import {FiArrowLeft,FiCalendar,FiClock,FiEdit3,FiTrash2,FiSave,FiX,FiRefreshCw,FiShield,FiSearch,FiDollarSign,FiCheckSquare} from 'react-icons/fi';
import './history.css';
const dateTime=v=>new Intl.DateTimeFormat('en-BD',{timeZone:'Asia/Dhaka',dateStyle:'medium',timeStyle:'short'}).format(new Date(v));
const localTime=v=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Dhaka',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(v)).replace(' ','T');
export default function MatchHistory(){
 const [selected,setSelected]=useState([]),[fromDate,setFromDate]=useState(''),[toDate,setToDate]=useState(''),[bulkDeleting,setBulkDeleting]=useState(false);const [items,setItems]=useState([]),[teams,setTeams]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[notice,setNotice]=useState(''),[editing,setEditing]=useState(null),[deleting,setDeleting]=useState(null),[busy,setBusy]=useState(false),[search,setSearch]=useState('');
 const request=useCallback(async(method='GET',body)=>{
  const {data:{session}}=await supabase.auth.getSession();
  if(!session?.access_token)throw Error('Admin sign-in required. Open the software and log in as an administrator.');
  const res=await fetch('/api/admin/match-schedules',{method,cache:'no-store',headers:{Authorization:'Bearer '+session.access_token,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
  const data=await res.json().catch(()=>({}));
  if(!res.ok)throw Error(data.message||'Request failed.');
  return data;
 },[]);
 const reload=useCallback(async()=>{setLoading(true);setError('');try{const data=await request();setItems((data.schedules||[]).slice().sort((a,b)=>new Date(b.created_at||b.starts_at)-new Date(a.created_at||a.starts_at)));setTeams(data.teams||[])}catch(e){setError(e.message)}finally{setLoading(false)}},[request]);
 useEffect(()=>{reload()},[reload]);
 const openEdit=x=>{setNotice('');setEditing({id:x.id,title:x.title,local_time:localTime(x.starts_at),entry_fee:String(x.entry_fee??0),prize_pool:x.prize_pool||'',lobby_details:x.lobby_details||'',notes:x.notes||'',team_id:x.team_id||''})};
 const save=async()=>{if(!editing)return;setBusy(true);setNotice('');try{await request('PATCH',{...editing,action:'edit',team_id:editing.team_id||null,entry_fee:Number(editing.entry_fee)});setEditing(null);setNotice('Match details updated successfully.');await reload()}catch(e){setNotice(e.message)}finally{setBusy(false)}};
 const remove=async()=>{if(!deleting)return;setBusy(true);setNotice('');try{await request('DELETE',{id:deleting.id});setDeleting(null);setNotice('Match permanently deleted.');await reload()}catch(e){setNotice(e.message)}finally{setBusy(false)}};
 const filtered=items.filter(x=>[x.title,x.lobby_details,x.notes].some(v=>String(v||'').toLowerCase().includes(search.toLowerCase())));
 const visibleIds=filtered.map(x=>x.id);
 const allSelected=visibleIds.length>0&&visibleIds.every(id=>selected.includes(id));
 const selectRange=()=>{if(!fromDate||!toDate||fromDate>toDate){setNotice('Choose a valid From and To date.');return;}const ids=filtered.filter(x=>{const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dhaka',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(x.starts_at));return day>=fromDate&&day<=toDate}).map(x=>x.id);setSelected(old=>[...new Set([...old,...ids])]);setNotice(ids.length+' matches selected in this date range.');};
 const deleteSelected=async()=>{if(!selected.length)return;setBusy(true);setNotice('');let done=0;try{for(const id of selected){await request('DELETE',{id});done++;}setSelected([]);setBulkDeleting(false);setNotice(done+' selected matches permanently deleted.');await reload()}catch(e){setNotice(done+' deleted; remaining request failed: '+e.message);await reload()}finally{setBusy(false)}};
 return <main className="op-hist-page">
  <div className="op-hist-wrap">
   <Link className="op-hist-back" href="/app"><FiArrowLeft/> Back to Admin Software</Link>
   <header className="op-hist-header"><div><span className="op-hist-eyebrow"><FiShield/> ADMIN MATCH CENTER</span><h1>Match <em>History</em></h1><p>Every match published for your players, with complete details and management controls.</p></div><button onClick={reload} disabled={loading} className="op-hist-reload"><FiRefreshCw/> Refresh</button></header>
   <div className="op-hist-toolbar"><strong>{items.length} <span>Created Matches</span></strong><label><FiSearch/><input placeholder="Search match or lobby…" value={search} onChange={e=>setSearch(e.target.value)}/></label></div>
   <div className="op-hist-bulk"><label className="op-hist-select-all"><input type="checkbox" checked={allSelected} onChange={e=>setSelected(old=>e.target.checked?[...new Set([...old,...visibleIds])]:old.filter(id=>!visibleIds.includes(id)))}/> Select All Visible</label><label>From<input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)}/></label><label>To<input type="date" value={toDate} onChange={e=>setToDate(e.target.value)}/></label><button type="button" onClick={selectRange}><FiCheckSquare/> Select Date Range</button><span className="op-hist-selection-count">{selected.length} Selected</span><button type="button" className="op-hist-bulk-delete" disabled={!selected.length||busy} onClick={()=>setBulkDeleting(true)}><FiTrash2/> Delete Selected</button></div>
   {notice&&<p className="op-hist-notice" role="status">{notice}</p>}
   {error&&<p className="op-hist-error" role="alert">{error}</p>}
   {loading?<p className="op-hist-empty">Loading match history…</p>:!filtered.length?<p className="op-hist-empty">No matches found.</p>:<div className="op-hist-grid">{filtered.map(x=><article className={'op-hist-card'+(selected.includes(x.id)?' is-selected':'')} key={x.id}>
    <div className="op-hist-card-head"><label className="op-hist-card-select"><input type="checkbox" checked={selected.includes(x.id)} aria-label={'Select '+x.title} onChange={e=>setSelected(old=>e.target.checked?[...new Set([...old,x.id])]:old.filter(id=>id!==x.id))}/> Select</label><span className="op-hist-chip"><FiCalendar/> {dateTime(x.starts_at)}</span><span className={'op-hist-status '+(x.status==='cancelled'?'cancelled':'')}>{x.status||'published'}</span></div>
    <h2>{x.title}</h2>
    <p className="op-hist-created">Created: {x.created_at?dateTime(x.created_at):'—'}</p>
    <div className="op-hist-stats"><div><small><FiDollarSign/> ENTRY FEE</small><strong>৳{Number(x.entry_fee||0).toLocaleString('en-BD')}</strong></div><div><small>PRIZE POOL</small><strong>{x.prize_pool||'—'}</strong></div></div>
    <div className="op-hist-details"><p><b>Squad:</b> {teams.find(t=>t.id===x.team_id)?.team_name||'All Squads'}</p><p><b>Lobby:</b> {x.lobby_details||'Not specified'}</p><p><b>Instructions:</b> {x.notes||'Not specified'}</p></div>
    <div className="op-hist-actions"><button className="op-hist-edit" onClick={()=>openEdit(x)} disabled={x.status==='cancelled'}><FiEdit3/> Edit Match</button><button className="op-hist-delete" onClick={()=>{setDeleting(x);setNotice('')}}><FiTrash2/> Delete</button></div>
   </article>)}</div>}
  </div>
  {editing&&<div className="op-hist-overlay" role="presentation"><section className="op-hist-dialog" role="dialog" aria-modal="true" aria-label="Edit match details"><header><h2>Edit Match Details</h2><button aria-label="Close" onClick={()=>setEditing(null)}><FiX/></button></header>
   <div className="op-hist-fields"><label>Match Title<input maxLength={120} value={editing.title} onChange={e=>setEditing({...editing,title:e.target.value})}/></label><label>Bangladesh Date &amp; Time<input type="datetime-local" value={editing.local_time} onChange={e=>setEditing({...editing,local_time:e.target.value})}/></label><label>Entry Fee (৳)<input type="number" min="0" step=".01" value={editing.entry_fee} onChange={e=>setEditing({...editing,entry_fee:e.target.value})}/></label><label>Prize Pool<input maxLength={160} value={editing.prize_pool} onChange={e=>setEditing({...editing,prize_pool:e.target.value})}/></label><label>Squad<select value={editing.team_id} onChange={e=>setEditing({...editing,team_id:e.target.value})}><option value="">All Squads</option>{teams.map(t=><option key={t.id} value={t.id}>{t.team_name}</option>)}</select></label><label>Lobby Details<textarea maxLength={500} rows={2} value={editing.lobby_details} onChange={e=>setEditing({...editing,lobby_details:e.target.value})}/></label><label className="wide">Instructions<textarea maxLength={1000} rows={3} value={editing.notes} onChange={e=>setEditing({...editing,notes:e.target.value})}/></label></div>
   <footer><button onClick={()=>setEditing(null)} className="op-hist-cancel">Cancel</button><button disabled={busy} onClick={save} className="op-hist-edit"><FiSave/> {busy?'Saving…':'Save Changes'}</button></footer></section></div>}
  {bulkDeleting&&<div className="op-hist-overlay"><section className="op-hist-dialog op-hist-confirm" role="alertdialog" aria-modal="true" aria-label="Confirm bulk deletion"><header><h2>Delete {selected.length} Matches?</h2><button aria-label="Close" onClick={()=>setBulkDeleting(false)}><FiX/></button></header><p>This permanently removes the selected schedules and associated player alerts. This cannot be undone.</p><footer><button className="op-hist-cancel" onClick={()=>setBulkDeleting(false)}>Cancel</button><button className="op-hist-delete" disabled={busy} onClick={deleteSelected}><FiTrash2/> {busy?'Deleting…':'Delete Selected'}</button></footer></section></div>}
  {deleting&&<div className="op-hist-overlay" role="presentation"><section className="op-hist-dialog op-hist-confirm" role="alertdialog" aria-modal="true" aria-label="Confirm delete"><header><h2>Delete Match?</h2><button aria-label="Close" onClick={()=>setDeleting(null)}><FiX/></button></header><p>Permanently delete <b>{deleting.title}</b> and its associated player notifications? This cannot be undone.</p><footer><button className="op-hist-cancel" onClick={()=>setDeleting(null)}>Keep Match</button><button className="op-hist-delete" disabled={busy} onClick={remove}><FiTrash2/> {busy?'Deleting…':'Delete Permanently'}</button></footer></section></div>}
 </main>;
}
