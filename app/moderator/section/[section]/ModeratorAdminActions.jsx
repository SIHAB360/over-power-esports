"use client";
import {useCallback,useEffect,useMemo,useState} from 'react';
import {supabase} from '../../../lib/supabase';
const pane={background:'linear-gradient(145deg,#132d41,#0d1f31)',border:'1px solid #33536c',borderRadius:18,padding:'clamp(16px,2.4vw,28px)',marginTop:18,color:'#e9f8ff'};
const box={minHeight:46,width:'100%',border:'1px solid #4b6b80',borderRadius:11,padding:'11px 13px',background:'#091a2a',color:'#f5fafe',fontSize:15};
const btn={minHeight:46,padding:'10px 18px',borderRadius:12,border:'1px solid #6ae4ee',background:'linear-gradient(135deg,#59d8e4,#168db5)',color:'#071c2c',fontWeight:800,fontSize:14,cursor:'pointer'};
const danger={...btn,borderColor:'#ffaaa2',background:'#802e3d',color:'#fff'};
const muted={color:'#a9cad9',fontSize:13,lineHeight:1.6};
const grid={display:'grid',gap:12,gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,230px),1fr))',alignItems:'end'};
const toText=(v)=>v==null?'':String(v);
export default function ModeratorAdminActions({section,rights=[],records=[],refresh}){
 const allowed=useMemo(()=>new Set((rights||[]).filter(x=>x.section===section).map(x=>x.action)),[rights,section]);
 const [target,setTarget]=useState(''),[other,setOther]=useState(''),[choices,setChoices]=useState({});
 const [error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 const [title,setTitle]=useState(''),[category,setCategory]=useState('general'),[teamId,setTeamId]=useState('');
 const [file,setFile]=useState(null),[publish,setPublish]=useState(false),[sortOrder,setSortOrder]=useState('0');
 const selected=(records||[]).find(x=>x.id===target)||null;
 const getToken=useCallback(async()=>{
   const {data:{session},error}=await supabase.auth.getSession();
   if(error||!session?.access_token)throw Error('Please sign in again.');
   return session.access_token;
 },[]);
 useEffect(()=>{
   let active=true;
   if(!(section==='teams'||section==='tournaments')||!allowed.has('edit'))return;
   (async()=>{
     const token=await getToken();
     const res=await fetch(`/api/moderator/choices?section=${section}`,{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});
     const data=await res.json().catch(()=>({}));
     if(!res.ok)throw Error(data.message||'Could not load roster choices');
     if(active)setChoices(data);
   })().catch(e=>{if(active)setError(e.message)});
   return()=>{active=false};
 },[section,allowed,getToken]);
 useEffect(()=>{setTarget('');setOther('');setError('');setNotice('')},[section]);
 const run=useCallback(async(action,id,data,question)=>{
  if(busy)return;
  if(question&&!window.confirm(question))return;
  setBusy(true);setError('');setNotice('');
  try{
   const token=await getToken();
   const res=await fetch('/api/moderator/operations',{method:'POST',cache:'no-store',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
     body:JSON.stringify({section,action,id,data:data||{}})});
   const out=await res.json().catch(()=>({}));if(!res.ok)throw Error(out.message||'Operation failed');
   setNotice('Changes saved successfully.');
   await refresh?.();
   if(section==='teams'||section==='tournaments'){
      const q=await fetch(`/api/moderator/choices?section=${section}`,{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});
      if(q.ok)setChoices(await q.json());
   }
   return out;
  }catch(e){setError(e.message);return null}finally{setBusy(false)}
 },[busy,getToken,section,refresh]);
 const show=['players','teams','tournaments','matches','profit','achievements'].includes(section)&&
   [...allowed].some(x=>x!=='view');
 if(!show)return null;
 const itemLabel=row=>row.team_name||row.name||row.ign||row.full_name||row.player_name||row.title||row.match_type||row.id;
 const options=records||[];
 const actionList={players:'Player Approval',teams:'Team Roster Management',tournaments:'Tournament Registrations',
  matches:'Match Management',profit:'Finance Record Management',achievements:'Achievement Gallery Management'};
 async function uploadAchievement(){
  if(busy||!allowed.has('create'))return;
  if(!file||!file.type.startsWith('image/')||file.size>8*1024*1024){setError('Select a JPG, PNG or WebP image under 8MB.');return;}
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)){setError('Only JPG, PNG and WebP are accepted.');return;}
  setBusy(true);setError('');setNotice('');
  try{
   const token=await getToken();const {data:{user}}=await supabase.auth.getUser();
   if(!user)throw Error('Please sign in again.');
   const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
   const path=`${user.id}/${crypto.randomUUID()}.${ext}`;
   const up=await supabase.storage.from('achievement-gallery').upload(path,file,{contentType:file.type,upsert:false});
   if(up.error)throw up.error;
   const res=await fetch('/api/moderator/operations',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
     body:JSON.stringify({section:'achievements',action:'create',data:{file_path:path,title,category,team_id:teamId||null}})});
   const payload=await res.json().catch(()=>({}));if(!res.ok)throw Error(payload.message||'Could not register image. Contact admin to clean up upload.');
   setNotice('Achievement screenshot uploaded. Publish permission is required to make it public.');
   setTitle('');setFile(null);await refresh?.();
  }catch(e){setError(e.message||'Upload failed')}finally{setBusy(false)}
 }
 return <section style={pane} aria-label={`${actionList[section]} authorized actions`}>
  <p style={{...muted,letterSpacing:'0.11em',fontWeight:800,color:'#78dbea'}}>DELEGATED ADMIN OPERATIONS</p>
  <h2 style={{fontSize:'clamp(21px,2.3vw,30px)',margin:'4px 0 10px'}}>{actionList[section]}</h2>
  <p style={muted}>Only actions explicitly assigned by Main Admin are shown. Every request is rechecked by the database and audited.</p>
  {error&&<p role="alert" style={{color:'#ffb1aa',background:'#441b2c',borderRadius:10,padding:12}}>{error}</p>}
  {notice&&<p role="status" style={{color:'#8fffc4',background:'#0e413d',borderRadius:10,padding:12}}>{notice}</p>}
  {section==='players'&&allowed.has('approve')&&<div style={grid}>
    <label>Player<select style={box} value={target} onChange={e=>setTarget(e.target.value)}><option value="">Select player</option>
     {options.map(x=><option key={x.id} value={x.id}>{itemLabel(x)} · {x.status}</option>)}</select></label>
    <button style={btn} disabled={!target||busy||selected?.status==='approved'} onClick={()=>run('approve',target,{},'Approve this player?')}>Approve Player</button>
  </div>}
  {section==='teams'&&allowed.has('edit')&&<div style={grid}>
    <label>Team<select style={box} value={target} onChange={e=>setTarget(e.target.value)}><option value="">Select team</option>{options.map(x=><option key={x.id} value={x.id}>{itemLabel(x)}</option>)}</select></label>
    <label>Player<select style={box} value={other} onChange={e=>setOther(e.target.value)}><option value="">Select player</option>
      {(choices.players||[]).map(p=><option key={p.id} value={p.id}>{p.name}{p.team_id?' · Team assigned':' · Free agent'}</option>)}</select></label>
    <button style={btn} disabled={!target||!other||busy||Boolean((choices.players||[]).find(x=>x.id===other)?.team_id)}
      onClick={()=>run('edit',other,{operation:'assign_player',teamId:target})}>Add to Team</button>
    <button style={danger} disabled={!target||!other||busy||((choices.players||[]).find(x=>x.id===other)?.team_id)!==target}
      onClick={()=>run('edit',other,{operation:'remove_player',teamId:target},'Remove player from this team?')}>Remove from Team</button>
  </div>}
  {section==='tournaments'&&allowed.has('edit')&&<div style={grid}>
    <label>Tournament<select style={box} value={target} onChange={e=>setTarget(e.target.value)}><option value="">Select tournament</option>{options.map(x=><option key={x.id} value={x.id}>{itemLabel(x)}</option>)}</select></label>
    <label>Team<select style={box} value={other} onChange={e=>setOther(e.target.value)}><option value="">Select team</option>{(choices.teams||[]).map(x=><option value={x.id} key={x.id}>{x.name}</option>)}</select></label>
    <button style={btn} disabled={!target||!other||busy||Boolean((choices.registrations||[]).find(x=>x.tournament_id===target&&x.team_id===other))}
      onClick={()=>run('edit',target,{operation:'register_team',teamId:other})}>Register Team</button>
    <button style={danger} disabled={!target||!other||busy||!(choices.registrations||[]).find(x=>x.tournament_id===target&&x.team_id===other)}
      onClick={()=>run('edit',target,{operation:'remove_team',teamId:other},'Remove this team from the tournament?')}>Remove Registration</button>
  </div>}
  {section==='matches'&&allowed.has('delete')&&<div style={grid}>
     <label>Match<select style={box} value={target} onChange={e=>setTarget(e.target.value)}><option value="">Select match</option>
     {options.map(x=><option key={x.id} value={x.id}>{x.match_type||'Match'} · {x.team1_name||'Team'} vs {x.team2_name||'Team'} · {x.status}</option>)}</select></label>
     <button style={danger} disabled={!target||busy} onClick={()=>run('delete',target,{},'Delete this match and linked results/earnings? This cannot be undone.')}>Delete Match & Linked Results</button>
   </div>}
  {section==='profit'&&allowed.has('delete')&&<div style={grid}>
     <label>Finance Record<select style={box} value={target} onChange={e=>setTarget(e.target.value)}><option value="">Select record</option>
     {options.map(x=><option key={x.id} value={x.id}>{x.match_id||x.id} · ৳{toText(x.profit)}</option>)}</select></label>
     <button style={danger} disabled={!target||busy} onClick={()=>run('delete',target,{},'Delete this financial record? Connected earnings may be recalculated.')}>Delete Finance Record</button>
   </div>}
  {section==='achievements'&&<div>
   {allowed.has('create')&&<div style={{...grid,marginTop:15}}>
    <label>Screenshot<input aria-label="Achievement screenshot" style={box} type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>setFile(e.target.files?.[0]||null)}/></label>
    <label>Title<input style={box} value={title} maxLength={130} placeholder="Achievement title" onChange={e=>setTitle(e.target.value)}/></label>
    <label>Category<input style={box} value={category} maxLength={90} onChange={e=>setCategory(e.target.value)}/></label>
    <label>Team ID (optional)<input style={box} value={teamId} onChange={e=>setTeamId(e.target.value)} placeholder="Team UUID"/></label>
    <button style={btn} disabled={busy||!file} onClick={uploadAchievement}>Upload Achievement</button>
   </div>}
   {(allowed.has('edit')||allowed.has('delete')||allowed.has('approve'))&&<div style={{...grid,marginTop:16}}>
      <label>Screenshot<select style={box} value={target} onChange={e=>{setTarget(e.target.value);const item=options.find(x=>x.id===e.target.value);setTitle(item?.title||'');setCategory(item?.category||'general');setSortOrder(toText(item?.sort_order??0));setTeamId(item?.team_id||'');setPublish(Boolean(item?.is_published));}}><option value="">Select item</option>
       {options.map(x=><option key={x.id} value={x.id}>{x.title||x.id} · {x.is_published?'Public':'Draft'}</option>)}</select></label>
      {allowed.has('edit')&&<><label>Title<input style={box} value={title} maxLength={130} onChange={e=>setTitle(e.target.value)}/></label>
       <label>Category<input style={box} value={category} maxLength={90} onChange={e=>setCategory(e.target.value)}/></label>
       <label>Sort Order<input style={box} type="number" value={sortOrder} onChange={e=>setSortOrder(e.target.value)}/></label>
       <button style={btn} disabled={!target||busy} onClick={()=>run('edit',target,{title,category,sort_order:Number(sortOrder),team_id:teamId||null})}>Save Details</button></>}
      {allowed.has('approve')&&<button style={btn} disabled={!target||busy} onClick={()=>run('approve',target,{is_published:!publish},'Change public visibility for this screenshot?').then(x=>{if(x)setPublish(!publish)})}>{publish?'Unpublish':'Publish'} Screenshot</button>}
      {allowed.has('delete')&&<button style={danger} disabled={!target||busy} onClick={()=>run('delete',target,{},'Delete achievement and its database entry?')}>Delete Screenshot Entry</button>}
   </div>}
  </div>}
 </section>;
}