"use client";
import {useCallback,useEffect,useMemo,useState} from "react";
import {useParams,useRouter} from "next/navigation";
import Link from "next/link";
import {supabase} from "../../../lib/supabase";
import {MODERATOR_SECTIONS} from "../../../lib/moderator-capabilities";
import styles from "./section.module.css";
const FORM_FIELDS={
 matches:[['team1_id','প্রথম টিম','team'],['team2_id','দ্বিতীয় টিম','team'],['match_date','ম্যাচের সময়','datetime-local'],['match_type','ম্যাচের ধরন','text'],['platform','প্ল্যাটফর্ম','text'],['map','ম্যাপ','text'],['sponsor','স্পনসর','text'],['notice','নোটিশ','textarea']],
 teams:[['team_name','টিমের নাম','text'],['description','বিবরণ','textarea'],['country','দেশ','text'],['coach_name','কোচ','text'],['manager_name','ম্যানেজার','text']],
 tournaments:[['name','টুর্নামেন্টের নাম','text'],['description','বিবরণ','textarea'],['start_date','শুরুর তারিখ','date'],['end_date','শেষের তারিখ','date']]
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
  const {data:{session}}=await supabase.auth.getSession();if(!session?.access_token)throw Error('লগইন করুন');
  const res=await fetch(url,{method,cache:'no-store',headers:{Authorization:`Bearer ${session.access_token}`,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
  const out=await res.json().catch(()=>({}));if(!res.ok)throw Error(out.message||'অনুরোধ ব্যর্থ');return out;
 },[]);
 const load=useCallback(async()=>{
  if(!meta?.actions.includes('view')){setNotice('এই বিভাগ এখনো চালু হয়নি');setLoading(false);return;}
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
  if(!selected&&REQUIRED[section]?.some(key=>!String(form[key]||'').trim())){setNotice('সব প্রয়োজনীয় তথ্য পূরণ করুন');return;}
  if(section==='matches'&&!selected&&form.team1_id===form.team2_id){setNotice('দুইটি আলাদা টিম নির্বাচন করুন');return;}
  setBusy(true);try{
   await call(`/api/moderator/sections/${section}`,selected?'PATCH':'POST', {recordId:selected||undefined,data:form});
   setNotice('সংরক্ষণ সফল');setSelected(null);setForm({});await load();
  }catch(err){setNotice(err.message)}finally{setBusy(false)}
 }
 if(!meta)return <main><p>অজানা বিভাগ</p><button onClick={()=>router.back()}>ফিরুন</button></main>;
 const fields=FORM_FIELDS[section]||[];
 return <main className={styles.page}><div className={styles.wrap}>
 <Link className={styles.back} href="/moderator/dashboard">← Moderator Dashboard</Link>
 <h1>{meta.label}</h1><p className={styles.sub}>আপনার অনুমোদিত কাজগুলোই এখানে পাওয়া যাবে।</p>
 {notice&&<p role="status" className={styles.notice}>{notice}</p>}
 {loading?<p>লোড হচ্ছে...</p>:<div className={styles.layout}>
 <section className={styles.panel}><div className={styles.panelHeading}><h2>তালিকা</h2><button type="button" onClick={load}>রিফ্রেশ</button></div>
 {records.length===0?<p>কোনো রেকর্ড নেই</p>:<div className={styles.list}>{records.map(row=><article className={styles.record} key={row.id}>
 <div><strong>{row[LABEL[section]]||row.full_name||'রেকর্ড'}</strong><small>{row.status||row.match_date||row.start_date||row.created_at||'—'}</small>{['earnings','withdrawals','profit'].includes(section)&&<small>৳ {Number(row.amount??row.profit??0).toLocaleString('bn-BD')}</small>}</div>
 {canEdit&&!(section==='matches'&&row.status!=='upcoming')&&!(section==='tournaments'&&row.status!=='upcoming')&&<button type="button" onClick={()=>edit(row)}>এডিট</button>}
 </article>)}</div>}
 </section>
 {(canCreate||canEdit)&&fields.length>0&&<section className={styles.panel}>
 <h2>{selected?'রেকর্ড এডিট':'নতুন রেকর্ড তৈরি'}</h2>
 <form onSubmit={submit} className={styles.form}>
 {fields.filter(([key])=>!(selected&&section==='matches'&&['team1_id','team2_id'].includes(key))).map(([key,label,type])=><label key={key}>{label}{type==='team'?<select value={form[key]||''} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))} required={!selected}><option value="">টিম নির্বাচন</option>{choices.map(x=><option value={x.id} key={x.id}>{x.team_name||x.id}</option>)}</select>:type==='textarea'?<textarea maxLength={1000} rows={3} value={form[key]||''} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}/>:<input type={type} value={form[key]||''} required={!selected&&REQUIRED[section]?.includes(key)} maxLength={type==='text'?150:undefined} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}/>}</label>)}
 <button className={styles.primary} type="submit" disabled={busy||!allowed.has(selected?'edit':'create')}>{busy?'সংরক্ষণ হচ্ছে...':'সংরক্ষণ করুন'}</button>
 {selected&&<button type="button" onClick={()=>{setSelected(null);setForm({})}}>বাতিল</button>}
 </form></section>}
 </div>}
 </div></main>;
}
