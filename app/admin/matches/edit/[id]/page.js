'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../../lib/supabase';

const field = { width:'100%', padding:'11px 12px', borderRadius:10, border:'1px solid #3b4560', background:'#111827', color:'#fff', outline:'none' };
const card = { background:'rgba(255,255,255,.055)', border:'1px solid rgba(255,255,255,.12)', borderRadius:16, padding:18 };

export default function EditMatchPerformancePage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params?.id;
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [error,setError] = useState('');
  const [notice,setNotice] = useState('');
  const [match,setMatch] = useState(null);
  const [players,setPlayers] = useState([]);
  const [rows,setRows] = useState([]);

  useEffect(() => { if (matchId) load(); }, [matchId]);

  async function load() {
    setLoading(true); setError('');
    try {
      const { data:{ user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }
      const { data:profile, error:profileError } = await supabase.from('profiles').select('role').eq('id',user.id).single();
      if (profileError) throw profileError;
      if (String(profile?.role || '').toLowerCase() !== 'admin') throw new Error('Administrator access required.');

      const { data:m, error:matchError } = await supabase.from('matches')
        .select('id,team1_id,team_id,match_date,match_type,status')
        .eq('id',matchId).single();
      if (matchError) throw matchError;
      const teamId = m.team1_id || m.team_id;
      if (!teamId) throw new Error('This match has no team assigned.');

      const [{data:roster,error:rosterError},{data:participants,error:participantsError},{data:stats,error:statsError}] = await Promise.all([
        supabase.from('players').select('id,full_name,ign,status,is_active,team_id').eq('team_id',teamId).eq('is_active',true).in('status',['approved','active']).order('full_name'),
        supabase.from('match_players').select('player_id,slot_number').eq('match_id',matchId).order('slot_number'),
        supabase.from('match_player_stats').select('player_id,kills,damage,assists,mvp').eq('match_id',matchId)
      ]);
      if (rosterError) throw rosterError;
      if (participantsError) throw participantsError;
      if (statsError) throw statsError;
      const statsById = Object.fromEntries((stats||[]).map(x=>[x.player_id,x]));
      const ordered = (participants||[]).map(x=>x.player_id);
      const initial = ordered.map(id=>({player_id:id,kills:String(statsById[id]?.kills ?? 0),damage:String(statsById[id]?.damage ?? 0),assists:String(statsById[id]?.assists ?? 0),mvp:Boolean(statsById[id]?.mvp)}));
      while(initial.length<4) initial.push({player_id:'',kills:'0',damage:'0',assists:'0',mvp:false});
      setMatch({...m,team_id:teamId});
      setPlayers(roster||[]);
      setRows(initial.slice(0,4));
    } catch(e) { setError(e.message || 'Could not load match.'); }
    finally { setLoading(false); }
  }

  const updateRow = (index,key,value) => setRows(old=>old.map((row,i)=>i===index?{...row,[key]:value}:row));
  const selectedIds = rows.map(r=>r.player_id).filter(Boolean);
  const valid = rows.length===4 && selectedIds.length===4 && new Set(selectedIds).size===4 &&
    rows.every(r=>['kills','damage','assists'].every(k=>Number.isInteger(Number(r[k]))&&Number(r[k])>=0));

  async function save() {
    if (!valid) { setError('Select four different players and enter valid non-negative whole-number stats.'); return; }
    setSaving(true); setError(''); setNotice('');
    try {
      const payload = rows.map(r=>({player_id:r.player_id,kills:Number(r.kills),damage:Number(r.damage),assists:Number(r.assists),mvp:Boolean(r.mvp)}));
      const {error:saveError} = await supabase.rpc('admin_update_esports_match_players',{p_match_id:matchId,p_players:payload});
      if (saveError) throw saveError;
      setNotice('Match lineup and player performance updated successfully.');
      await load();
    } catch(e) { setError(e.message || 'Unable to save match changes.'); }
    finally { setSaving(false); }
  }

  const fmt = value => value ? new Intl.DateTimeFormat('en-BD',{timeZone:'Asia/Dhaka',dateStyle:'medium',timeStyle:'short'}).format(new Date(value)) : '—';

  return <main style={{minHeight:'100vh',padding:'38px 18px 80px',background:'radial-gradient(circle at 15% 10%,rgba(220,38,38,.18),transparent 30%),linear-gradient(145deg,#080d1d,#141d35)',color:'#f8fafc'}}>
    <div style={{maxWidth:1000,margin:'0 auto'}}>
      <Link href="/admin/profit" style={{color:'#93c5fd',textDecoration:'none'}}>← Back to Financial History</Link>
      <header style={{margin:'24px 0 28px'}}>
        <p style={{color:'#34d399',fontWeight:800,letterSpacing:2,fontSize:12}}>OVER POWER ESPORTS • MATCH MANAGEMENT</p>
        <h1 style={{fontSize:'clamp(28px,4vw,42px)',margin:'8px 0'}}>Edit Match Performance</h1>
        <p style={{color:'#aab6ce',margin:0}}>Change the four players and update kills, damage, assists and MVP. Saving updates this existing match; it does not create a new match.</p>
      </header>
      {loading ? <p>Loading match details…</p> : error && !match ? <div role="alert" style={{...card,borderColor:'#ef4444',color:'#fecaca'}}>{error}</div> : match && <>
        <section style={{...card,marginBottom:20,display:'flex',gap:18,flexWrap:'wrap',justifyContent:'space-between'}}>
          <div><small style={{color:'#9ca3af'}}>MATCH TYPE</small><div style={{fontWeight:800,fontSize:18}}>{match.match_type || 'Match'}</div></div>
          <div><small style={{color:'#9ca3af'}}>DATE</small><div style={{fontWeight:800}}>{fmt(match.match_date)}</div></div>
          <div><small style={{color:'#9ca3af'}}>STATUS</small><div style={{fontWeight:800,textTransform:'capitalize'}}>{match.status || '—'}</div></div>
          <div><small style={{color:'#9ca3af'}}>MATCH ID</small><div style={{fontSize:12,color:'#cbd5e1'}}>{match.id}</div></div>
        </section>
        {error && <div role="alert" style={{...card,borderColor:'#ef4444',color:'#fecaca',marginBottom:16}}>{error}</div>}
        {notice && <div role="status" style={{...card,borderColor:'#22c55e',color:'#bbf7d0',marginBottom:16}}>{notice}</div>}
        <div style={{display:'grid',gap:16}}>
          {rows.map((row,index)=><section key={index} style={card}>
            <h2 style={{margin:'0 0 14px',fontSize:18}}>Player Slot {index+1}</h2>
            <label style={{display:'block',fontSize:13,color:'#cbd5e1',marginBottom:12}}>Player
              <select value={row.player_id} onChange={e=>updateRow(index,'player_id',e.target.value)} style={{...field,marginTop:6}}>
                <option value="">Select a player</option>
                {players.map(p=><option key={p.id} value={p.id}>{p.ign || p.full_name} {p.ign && p.full_name ? '— '+p.full_name : ''}</option>)}
              </select>
            </label>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12}}>
              {['kills','damage','assists'].map(key=><label key={key} style={{fontSize:13,color:'#cbd5e1',textTransform:'capitalize'}}>{key}
                <input type="number" min="0" step="1" inputMode="numeric" value={row[key]} onChange={e=>updateRow(index,key,e.target.value)} style={{...field,marginTop:6}}/>
              </label>)}
            </div>
            <label style={{display:'inline-flex',alignItems:'center',gap:9,marginTop:14,color:'#fbbf24',fontWeight:700}}>
              <input type="checkbox" checked={row.mvp} onChange={e=>updateRow(index,'mvp',e.target.checked)}/> MVP
            </label>
          </section>)}
        </div>
        <div style={{...card,marginTop:20,display:'flex',justifyContent:'space-between',alignItems:'center',gap:14,flexWrap:'wrap'}}>
          <p style={{margin:0,color:'#9ca3af',fontSize:13}}>Four unique active players are required. Changes are saved together in one database transaction.</p>
          <button type="button" onClick={save} disabled={saving || !valid} style={{padding:'13px 24px',borderRadius:12,border:0,background:saving||!valid?'#475569':'linear-gradient(90deg,#16a34a,#059669)',color:'#fff',fontWeight:900,cursor:saving||!valid?'not-allowed':'pointer'}}>
            {saving?'Saving…':'Save Updated Match'}
          </button>
        </div>
      </>}
    </div>
  </main>;
}
