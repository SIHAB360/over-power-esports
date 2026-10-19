"use client";

import {useCallback,useEffect,useMemo,useState} from "react";
import {useParams,useRouter} from "next/navigation";
import Link from "next/link";
import {supabase} from "../../../lib/supabase";
import {MODERATOR_SECTIONS} from "../../../lib/moderator-capabilities";
import styles from "./section.module.css";
import AdminMatchesPage from "../../../admin/matches/page";
import AdminTeamsPage from "../../../admin/teams/page";
import AdminTournamentsPage from "../../../admin/tournaments/page";
import WithdrawalManagement from "../../../admin/dashboard/WithdrawalManagement";
import VerificationPanel from "../../../admin/dashboard/VerificationPanel";
import ModeratorAdminActions from "./ModeratorAdminActions";

const FORMS={
 matches:[["team1_id","Team One","team"],["team2_id","Team Two","team"],["match_date","Match Date & Time","datetime-local"],["match_type","Match Type","text"],["platform","Platform","text"],["map","Map","text"],["sponsor","Sponsor","text"],["notice","Notice","textarea"]],
 teams:[["team_name","Team Name","text"],["description","Description","textarea"],["country","Country","text"],["coach_name","Coach","text"],["manager_name","Manager","text"]],
 tournaments:[["name","Tournament Name","text"],["description","Description","textarea"],["start_date","Start Date","date"],["end_date","End Date","date"]]
};
const REQUIRED={matches:["team1_id","team2_id","match_date"],teams:["team_name"],tournaments:["name"]};
const LABEL={matches:"match_type",teams:"team_name",tournaments:"name",players:"ign",earnings:"player_name",withdrawals:"player_name",profit:"match_id",verification:"ign",achievements:"title"};
const FIELDS={
 matches:[["tournament_name","Tournament"],["match_type","Match Type"],["match_date","Schedule","date"],["status","Status"],["team1_name","Team One"],["team1_score","Team One Score"],["team2_name","Team Two"],["team2_score","Team Two Score"],["winner_name","Winner"],["platform","Platform"],["map","Map"],["sponsor","Sponsor"],["notice","Notice"]],
 teams:[["team_name","Team"],["status","Status"],["country","Country"],["coach_name","Coach"],["manager_name","Manager"],["founded_year","Founded"],["description","Description"]],
 tournaments:[["name","Tournament"],["status","Status"],["start_date","Start Date","date"],["end_date","End Date","date"],["registration_deadline","Register By","date"],["max_teams","Max Teams"],["prize_pool","Prize Pool","money"],["entry_fee","Entry Fee","money"],["description","Description"]],
 players:[["ign","IGN"],["full_name","Player"],["status","Status"],["verified","Verified","bool"],["team_name","Team"],["position","Position"],["country","Country"],["matches_played","Matches"],["wins","Wins"],["total_kills","Kills"]],
 earnings:[["player_name","Player"],["amount","Earnings","money"],["percentage","Share","percent"],["match_id","Match"],["created_at","Created","date"]],
 withdrawals:[["player_name","Player"],["provider","Method"],["status","Status"],["amount","Requested","money"],["transfer_fee","Fee","money"],["net_payout","Net Payout","money"],["created_at","Created","date"]],
 profit:[["match_id","Match"],["entry_fee","Entry Fee","money"],["prize_money","Prize Money","money"],["expense","Expenses","money"],["profit","Profit","money"],["created_at","Created","date"]],
 verification:[["ign","IGN"],["full_name","Player"],["status","Status"],["verified","Verified","bool"],["created_at","Joined","date"]],
 achievements:[["title","Title"],["category","Category"],["is_published","Published","bool"],["sort_order","Display Order"],["created_at","Created","date"]]
};
const SHORT={matches:["tournament_name","match_date","status"],teams:["country","status"],tournaments:["start_date","status"],players:["team_name","status"],earnings:["amount","created_at"],withdrawals:["amount","status"],profit:["profit","created_at"],verification:["verified","status"],achievements:["category","is_published"]};
const CURRENCY=new Intl.NumberFormat("en-BD",{maximumFractionDigits:2});
function formatValue(value,type){
 if(value===null||value===undefined||value==="")return "—";
 if(type==="bool")return value?"Yes":"No";
 if(type==="money")return `৳ ${CURRENCY.format(Number(value)||0)}`;
 if(type==="percent")return `${value}%`;
 if(type==="date"){
  const date=new Date(String(value).includes("T")?value:`${value}T00:00:00`);
  return Number.isNaN(date.getTime())?String(value):new Intl.DateTimeFormat("en-BD",{day:"numeric",month:"short",year:"numeric",...(String(value).includes("T")?{hour:"numeric",minute:"2-digit"}:{})}).format(date);
 }
 return String(value);
}
const dateInput=value=>value?String(value).replace(" ","T").slice(0,16):"";
const safeText=(obj,key,type)=>formatValue(obj?.[key],type);
const toSearchable=obj=>Object.entries(obj).filter(([key,value])=>key!=="performance"&&key!=="id"&&typeof value!=="object").map(([,v])=>String(v??"")).join(" ").toLowerCase();
const summarize=(section,items)=>{
 if(section==="matches")return [
  ["Total Matches",items.length],["Upcoming",items.filter(x=>x.status==="upcoming").length],["Completed",items.filter(x=>x.status==="completed").length],["Other Status",items.filter(x=>!["upcoming","completed"].includes(x.status)).length]
 ];
 if(section==="withdrawals")return [["Requests",items.length],["Pending",items.filter(x=>x.status==="pending").length],["Approved",items.filter(x=>x.status==="approved").length],["Paid",items.filter(x=>x.status==="paid").length]];
 if(section==="verification")return [["Profiles",items.length],["Verified",items.filter(x=>x.verified).length],["Unverified",items.filter(x=>!x.verified).length],["Approved",items.filter(x=>x.status==="approved").length]];
 if(section==="achievements")return [["Gallery Items",items.length],["Published",items.filter(x=>x.is_published).length],["Draft",items.filter(x=>!x.is_published).length],["Categories",new Set(items.map(x=>x.category).filter(Boolean)).size]];
 return [["Total Records",items.length],["Active",items.filter(x=>["active","approved","upcoming"].includes(x.status)).length],["Sections",1],["Access", "Scoped"]];
};
function ModeratorSectionRecords(){
 const {section}=useParams(),router=useRouter();
 const meta=MODERATOR_SECTIONS.find(x=>x.id===section);
 const [rights,setRights]=useState([]),[records,setRecords]=useState([]),[choices,setChoices]=useState([]);
 const [selected,setSelected]=useState(null),[form,setForm]=useState({}),[details,setDetails]=useState(null);
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[notice,setNotice]=useState("");
 const [query,setQuery]=useState(""),[status,setStatus]=useState("all");
 const allowed=useMemo(()=>new Set(rights.filter(x=>x.section===section).map(x=>x.action)),[rights,section]);
 const canCreate=allowed.has("create"),canEdit=allowed.has("edit");
 const call=useCallback(async(url,method="GET",body)=>{
  const {data:{session}}=await supabase.auth.getSession();if(!session?.access_token)throw Error("Please sign in again.");
  const res=await fetch(url,{method,cache:"no-store",headers:{Authorization:`Bearer ${session.access_token}`,...(body?{"Content-Type":"application/json"}:{})},...(body?{body:JSON.stringify(body)}:{})});
  const out=await res.json().catch(()=>({}));if(!res.ok)throw Error(out.message||"Request failed.");return out;
 },[]);
 const load=useCallback(async()=>{
  if(!meta?.actions.includes("view")){setNotice("This section is unavailable.");setLoading(false);return;}
  setLoading(true);
  try{
   const [me,result]=await Promise.all([call("/api/moderator/me"),call(`/api/moderator/sections/${section}`)]);
   setRights(me.permissions||[]);setRecords(result.records||[]);
   if(section==="matches"){
    const teamResult=await call(`/api/moderator/sections/${section}?kind=team-choices`);
    setChoices(teamResult.records||[]);
   }
   setNotice("");
  }catch(e){setRecords([]);setRights([]);setNotice(e.message);}finally{setLoading(false);}
 },[call,section,meta]);
 useEffect(()=>{load()},[load]);
 const statuses=useMemo(()=>[...new Set(records.map(x=>x.status).filter(Boolean))],[records]);
 const visible=useMemo(()=>records.filter(row=>(status==="all"||row.status===status)&&(!query||toSearchable(row).includes(query.toLowerCase().trim()))),[records,query,status]);
 const counters=useMemo(()=>summarize(section,records),[section,records]);
 function edit(row){
  if(!canEdit||!(["matches","teams","tournaments"].includes(section)))return;
  if((section==="matches"||section==="tournaments")&&row.status!=="upcoming")return;
  setDetails(null);setSelected(row.id);
  const input=Object.fromEntries((FORMS[section]||[]).filter(([key])=>!(section==="matches"&&["team1_id","team2_id"].includes(key))).map(([key,,type])=>[key,type==="datetime-local"?dateInput(row[key]):row[key]??""]));
  setForm(input);setNotice("");
 }
 function beginCreate(){setSelected(null);setDetails(null);setForm({});setNotice("");}
 async function submit(event){
  event.preventDefault();if(busy)return;
  const action=selected?"edit":"create";if(!allowed.has(action))return;
  if(!selected&&REQUIRED[section]?.some(key=>!String(form[key]||"").trim())){setNotice("Complete all required fields.");return;}
  if(section==="matches"&&!selected&&form.team1_id===form.team2_id){setNotice("Choose two different teams.");return;}
  setBusy(true);
  try{
   await call(`/api/moderator/sections/${section}`,selected?"PATCH":"POST",{recordId:selected||undefined,data:form});
   setSelected(null);setForm({});await load();setNotice("Changes saved successfully.");
  }catch(e){setNotice(e.message)}finally{setBusy(false)}
 }
 if(!meta)return <main className={styles.page}><p>Unknown section</p><button onClick={()=>router.back()}>Go back</button></main>;
 const formFields=FORMS[section]||[];
 const showForm=(canCreate||Boolean(selected))&&formFields.length>0;
 const canEditRecord=row=>canEdit&&["matches","teams","tournaments"].includes(section)&&(!(section==="matches"||section==="tournaments")||row.status==="upcoming");
 return <main className={styles.page}><div className={styles.wrap}>
  <div className={styles.breadcrumbs}><Link href="/player/dashboard">Player Dashboard</Link><span>/</span><Link href="/moderator/dashboard">Moderator Workspace</Link><span>/</span><strong>{meta.label}</strong></div>
  <header className={styles.hero}>
   <div><div className={styles.kicker}>OVER POWER ESPORTS · CONTROL CENTER</div><h1>{section==="matches"?"Match Command Center":meta.label}</h1>
    <p>{meta.description}. Same operational records, with only the permissions assigned by Main Admin.</p>
    <div className={styles.permissions}><span>GRANTED ACCESS</span>{[...allowed].map(x=><b key={x}>{x.toUpperCase()}</b>)}</div>
   </div><div className={styles.heroActions}><button onClick={load} type="button" disabled={loading}>↻ Refresh Data</button>{canCreate&&<button type="button" onClick={beginCreate} className={styles.primary}>+ Create New</button>}</div>
  </header>
  {notice&&<p role="status" className={styles.notice}>{notice}</p>}
  <section className={styles.kpis} aria-label="Section summary">{counters.map(([name,value])=><div className={styles.kpi} key={name}><span>{name}</span><strong>{value}</strong></div>)}</section>
  {loading?<section className={styles.panel} role="status">Loading the latest records…</section>:<div className={styles.workspace}>
   <section className={styles.panel}>
    <div className={styles.panelHeading}><div><span className={styles.eyebrow}>ADMIN-STYLE DATA VIEW</span><h2>Records <span className={styles.count}>{visible.length} / {records.length}</span></h2></div></div>
    <div className={styles.toolbar}><label className={styles.search}><span>Search records</span><input type="search" placeholder="Search team, player, match, status…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
     {statuses.length>0&&<label className={styles.statusSelect}><span>Status</span><select value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All statuses</option>{statuses.map(s=><option key={s} value={s}>{s}</option>)}</select></label>}
    </div>
    {!visible.length?<div className={styles.empty}>No matching records. Try clearing the search or changing the status filter.</div>:
    section==="matches"?<div className={styles.matches}>
      {visible.map(row=><article key={row.id} className={styles.matchCard}>
       <div className={styles.matchTop}><span className={styles.tag}>{row.tournament_name||row.match_type||"MATCH"}</span><span className={`${styles.status} ${String(row.status).toLowerCase()==="completed"?styles.done:""}`}>{row.status||"Unscheduled"}</span></div>
       <div className={styles.versus}>
        <div className={styles.team}><span className={styles.teamLabel}>TEAM ONE</span><strong>{row.team1_name||"Team One"}</strong></div>
        <div className={styles.score}><strong>{row.team1_score??"–"} <em>:</em> {row.team2_score??"–"}</strong><span>{formatValue(row.match_date,"date")}</span></div>
        <div className={`${styles.team} ${styles.teamRight}`}><span className={styles.teamLabel}>TEAM TWO</span><strong>{row.team2_name||"Team Two"}</strong></div>
       </div>
       <div className={styles.matchMeta}><span>{row.match_type||"Match"}</span><span>{row.platform||"Platform —"}</span><span>{row.map||"Map —"}</span>{row.winner_name&&<span>Winner: {row.winner_name}</span>}</div>
       <div className={styles.rowButtons}><button type="button" onClick={()=>setDetails(row)}>View Full Details & Stats ↗</button>{canEditRecord(row)&&<button type="button" className={styles.editButton} onClick={()=>edit(row)}>Edit Schedule</button>}</div>
      </article>)}
    </div>:<div className={styles.tableScroll}><table className={styles.dataTable}><thead><tr><th>{meta.label}</th>{(FIELDS[section]||[]).slice(1,5).map(([key,label])=><th key={key}>{label}</th>)}<th>Actions</th></tr></thead><tbody>{visible.map(row=><tr key={row.id}><td className={styles.mainCell}><strong>{row[LABEL[section]]||row.full_name||"Record"}</strong></td>{(FIELDS[section]||[]).slice(1,5).map(([key,,type])=><td key={key}>{safeText(row,key,type)}</td>)}<td><div className={styles.tableActions}><button type="button" onClick={()=>setDetails(row)}>Details</button>{canEditRecord(row)&&<button type="button" onClick={()=>edit(row)}>Edit</button>}</div></td></tr>)}</tbody></table></div>}
   </section>
   <ModeratorAdminActions section={section} rights={rights} records={records} refresh={load}/>
   {showForm&&<section className={styles.panel} id="editor"><div className={styles.panelHeading}><div><span className={styles.eyebrow}>AUTHORIZED CHANGES ONLY</span><h2>{selected?"Edit Record":"Create New Record"}</h2></div>{selected&&<button type="button" onClick={beginCreate}>Cancel</button>}</div>
    {selected&&<p className={styles.editorNote}>Only approved non-financial fields can be changed here. Existing match results, team scores and payouts are protected.</p>}
    <form onSubmit={submit} className={styles.form}>{formFields.filter(([key])=>!(selected&&section==="matches"&&["team1_id","team2_id"].includes(key))).map(([key,label,type])=><label key={key}><span>{label}{!selected&&REQUIRED[section]?.includes(key)&&" *"}</span>
     {type==="team"?<select required={!selected} value={form[key]||""} onChange={e=>setForm(old=>({...old,[key]:e.target.value}))}><option value="">Select team</option>{choices.map(x=><option key={x.id} value={x.id}>{x.team_name||x.id}</option>)}</select>:
     type==="textarea"?<textarea maxLength={1000} rows={3} value={form[key]||""} onChange={e=>setForm(old=>({...old,[key]:e.target.value}))}/>:
     <input type={type} maxLength={type==="text"?150:undefined} required={!selected&&REQUIRED[section]?.includes(key)} value={form[key]||""} onChange={e=>setForm(old=>({...old,[key]:e.target.value}))}/>}
    </label>)}<button className={styles.primary} type="submit" disabled={busy}>{busy?"Saving…":selected?"Save Changes":"Create Record"}</button></form>
   </section>}
  </div>}
  {details&&<div className={styles.modalShade} role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setDetails(null)}}><section className={styles.modal} role="dialog" aria-modal="true" aria-label="Full record details"><div className={styles.modalHeader}><div><span className={styles.eyebrow}>DETAILED RECORD</span><h2>{details[LABEL[section]]||details.full_name||meta.label}</h2></div><button type="button" aria-label="Close details" onClick={()=>setDetails(null)}>✕</button></div>
   <dl className={styles.detailsGrid}>{(FIELDS[section]||[]).map(([key,label,type])=><div key={key}><dt>{label}</dt><dd>{safeText(details,key,type)}</dd></div>)}</dl>
   {section==="matches"&&<div className={styles.performance}><h3>Player Performance</h3><div className={styles.tableScroll}><table className={styles.dataTable}><thead><tr><th>Player</th><th>Team</th><th>Kills</th><th>Assists</th><th>Damage</th><th>Placement</th><th>MVP</th></tr></thead><tbody>{(details.performance||[]).map((p,i)=><tr key={`${p.player_id}-${i}`}><td>{p.player_name}</td><td>{p.team_name||"—"}</td><td>{p.kills??0}</td><td>{p.assists??0}</td><td>{p.damage??0}</td><td>{p.placement??"—"}</td><td>{p.mvp?"★":"—"}</td></tr>)}{!(details.performance||[]).length&&<tr><td colSpan={7}>No performance records for this match.</td></tr>}</tbody></table></div></div>}
   <p className={styles.restriction}>Read-only details. Changes require an explicit action grant and a secure backend operation.</p>
   <button className={styles.close} type="button" onClick={()=>setDetails(null)}>Close Details</button>
  </section></div>}
  <footer className={styles.footer}>Showing up to 200 latest records. Moderator rights are checked by the server for every request. No full Admin access is granted.</footer>
 </div></main>;
}

export default function ModeratorSection(){
 const {section} = useParams();
 const [screen,setScreen] = useState("command");
 useEffect(()=>{
   if(["matches","teams","tournaments"].includes(section) && new URLSearchParams(window.location.search).get("screen")==="records") setScreen("records");
 },[section]);
 if(section==="withdrawals")return <main style={{minHeight:"100vh",background:"#071421",padding:"clamp(12px,3vw,35px)"}}>
  <Link href="/moderator/dashboard" style={{color:"#84dfee",fontWeight:800}}>← Moderator Dashboard</Link>
  <WithdrawalManagement moderatorMode/></main>;
 if(["verification","registration_codes"].includes(section))return <main style={{minHeight:"100vh",background:"#071421",padding:"clamp(12px,3vw,35px)"}}>
  <Link href="/moderator/dashboard" style={{color:"#84dfee",fontWeight:800}}>← Moderator Dashboard</Link>
  <VerificationPanel moderatorMode/></main>;
 if(!["matches","teams","tournaments"].includes(section)) return <ModeratorSectionRecords/>;
 return <div style={{minHeight:"100vh",background:"#071421"}}>
   <nav aria-label="Match workspace views" style={{display:"flex",gap:12,flexWrap:"wrap",padding:"15px max(16px,3vw)",background:"#102337",borderBottom:"1px solid #315367"}}>
      <button type="button" onClick={()=>setScreen("command")} aria-pressed={screen==="command"}
        style={{minHeight:44,borderRadius:12,padding:"9px 15px",fontWeight:800,cursor:"pointer",background:screen==="command"?"#64d7e7":"#193a51",color:screen==="command"?"#092132":"#fff",border:"1px solid #4e738a"}}>
        {section==="matches"?"Match Command Center":section==="teams"?"Team Management":"Tournament Management"} · Create
      </button>
      <button type="button" onClick={()=>setScreen("records")} aria-pressed={screen==="records"}
        style={{minHeight:44,borderRadius:12,padding:"9px 15px",fontWeight:800,cursor:"pointer",background:screen==="records"?"#64d7e7":"#193a51",color:screen==="records"?"#092132":"#fff",border:"1px solid #4e738a"}}>
        {section==="matches"?"Match Records":section==="teams"?"Team Roster & Records":"Tournament Registration & Records"} · Manage
      </button>
      <Link href="/moderator/dashboard" style={{alignSelf:"center",color:"#d4e9f2",fontWeight:750}}>← Moderator Dashboard</Link>
   </nav>
   {screen==="command"
  ?(section==="matches"?<AdminMatchesPage moderatorMode/>:
    section==="teams"?<AdminTeamsPage moderatorMode/>:<AdminTournamentsPage moderatorMode/>)
  :<ModeratorSectionRecords/>}
 </div>;
}
