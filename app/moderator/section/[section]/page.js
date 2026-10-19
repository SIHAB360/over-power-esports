"use client";
import {useCallback,useEffect,useMemo,useState} from "react";
import {useParams,useRouter} from "next/navigation";
import Link from "next/link";
import {supabase} from "../../../lib/supabase";
import {MODERATOR_SECTIONS} from "../../../lib/moderator-capabilities";
import styles from "./section.module.css";
const FORM_FIELDS={
 matches:[['team1_id','Team One','team'],['team2_id','Team Two','team'],['match_date','Match Date & Time','datetime-local'],['match_type','Match Type','text'],['platform','Platform','text'],['map','Map','text'],['sponsor','Sponsor','text'],['notice','Notice','textarea']],
 teams:[['team_name','Team Name','text'],['description','Description','textarea'],['country','Country','text'],['coach_name','Coach','text'],['manager_name','Manager','text']],
 tournaments:[['name','Tournament Name','text'],['description','Description','textarea'],['start_date','Start Date','date'],['end_date','End Date','date']]
};
const REQUIRED={matches:['team1_id','team2_id','match_date'],teams:['team_name'],tournaments:['name']};
const LABEL={matches:'match_type',teams:'team_name',tournaments:'name',players:'ign',earnings:'player_id',withdrawals:'provider',profit:'match_id',verification:'ign',achievements:'title'};
export default function ModeratorSection(){
 const {section}=useParams(),router=useRouter();
 const meta=MODERATOR_SECTIONS.find(x=>x.id===section);const [rights,setRights]=useState([]),[records,setRecords]=useState([]);
 const [choices,setChoices]=useState([]),[selected,setSelected]=useState(null),[form,setForm]=useState({});
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 const allowed=useMemo(()=>new Set(rights.filter(x=>x.section===section).map(x=>x.action)),[rights,section]);
 const call=useCallback(async(url,method='GET',body)=>{
  const {data:{session}}=await supabase.auth.getSession();if(!session?.access_token)throw Error('Please sign in.');
  const res=await fetch(url,{method,cache:'no-store',headers:{Authorization:`Bearer ${session.access_token}`,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
  const out=await res.json().catch(()=>({}));if(!res.ok)throw Error(out.message||'Request failed.');return out;
 },[]);
 const load=useCallback(async()=>{
  if(!meta?.actions.includes('view')){setNotice('This section is currently unavailable.');setLoading(false);return;}
  setLoading(true);
  try{
   const [me,result]=await Promise.all([call('/api/moderator/me'),call(`/api/moderator/sections/${section}`)]);
   setRights(me.permissions||[]);setRecords(result.records||[]);
   if(section==='matches'){
    const teams=await call(`/api/moderator/sections/${section}?kind=team-choices`);setChoices(teams.records||[]);
   }
   setNotice('');
  }catch(e){setNotice(e.message)}finally{setLoading(false)}
 },[call,section,meta]);
 useEffect(()=>{load()},[load]);
 const canCreate=allowed.has('create'),canEdit=allowed.has('edit');
 function edit(row){
  setSelected(row.id);
  const fields=FORM_FIELDS[section]||[];setForm(Object.fromEntries(fields.filter(([key])=>!(section==='matches'&&['team1_id','team2_id'].includes(key))).map(([key])=>[key,row[key]??''])));
 }
 async function submit(e){
  e.preventDefault();if(busy)return;
  const action=selected?'edit':'create';if(!allowed.has(action))return;
  if(!selected&&REQUIRED[section]?.some(key=>!String(form[key]||'').trim())){setNotice('Please fill in all required fields.');return;}
  if(section==='matches'&&!selected&&form.team1_id===form.team2_id){setNotice('Select two different teams.');return;}
  setBusy(true);try{
   await call(`/api/moderator/sections/${section}`,selected?'PATCH':'POST', {recordId:selected||undefined,data:form});
   setNotice('Saved successfully.');setSelected(null);setForm({});await load();
  }catch(err){setNotice(err.message)}finally{setBusy(false)}
 }
 if(!meta)return <main><p>Unknown section</p><button onClick={()=>router.back()}>Go back</button></main>;
 const fields=FORM_FIELDS[section]||[];
 return <main className={styles.page}><div className={styles.wrap}>
 <Link className={styles.back} href="/moderator/dashboard">← Moderator Dashboard</Link>
 <span className={styles.kicker}>MODERATOR WORKSPACE</span><h1>{meta.label}</h1><p className={styles.sub}>You can view and manage only the actions assigned to your account.</p>
 {notice&&<p role="status" className={styles.notice}>{notice}</p>}
 {loading?<p className={styles.empty}>Loading records...</p>:<div className={styles.layout}>
 <section className={styles.panel}><div className={styles.panelHeading}><h2>Records</h2><button type="button" onClick={load}>Refresh</button></div>
 {records.length===0?<p className={styles.empty}>No records found.</p>:<div className={styles.list}>{records.map(row=><article className={styles.record} key={row.id}>
 <div><strong>{row[LABEL[section]]||row.full_name||'Record'}</strong><small>{row.status||row.match_date||row.start_date||row.created_at||'—'}</small>{['earnings','withdrawals','profit'].includes(section)&&<small>৳ {Number(row.amount??row.profit??0).toLocaleString('en-BD')}</small>}</div>
 {canEdit&&!(section==='matches'&&row.status!=='upcoming')&&!(section==='tournaments'&&row.status!=='upcoming')&&<button type="button" onClick={()=>edit(row)}>Edit</button>}
 </article>)}</div>}
 </section>
 {(canCreate||canEdit)&&fields.length>0&&<section className={styles.panel}>
 <h2>{selected?'Edit Record':'Create New Record'}</h2>
 <form onSubmit={submit} className={styles.form}>
 {fields.filter(([key])=>!(selected&&section==='matches'&&['team1_id','team2_id'].includes(key))).map(([key,label,type])=><label key={key}>{label}{type==='team'?<select value={form[key]||''} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))} required={!selected}><option value="">Select team</option>{choices.map(x=><option value={x.id} key={x.id}>{x.team_name||x.id}</option>)}</select>:type==='textarea'?<textarea maxLength={1000} rows={3} value={form[key]||''} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}/>:<input type={type} value={form[key]||''} required={!selected&&REQUIRED[section]?.includes(key)} maxLength={type==='text'?150:undefined} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}/>}</label>)}
 <div className={styles.formActions}><button className={styles.primary} type="submit" disabled={busy||!allowed.has(selected?'edit':'create')}>{busy?'Saving...':'Save Record'}</button>
 {selected&&<button type="button" onClick={()=>{setSelected(null);setForm({})}}>Cancel</button>}</div>
 </form></section>}
 </div>}
 </div></main>;
}
