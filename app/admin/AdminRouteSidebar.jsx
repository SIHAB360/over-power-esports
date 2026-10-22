'use client';

import {useState} from 'react';
import {usePathname} from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {FiGrid,FiUsers,FiTarget,FiLayers,FiAward,FiDollarSign,
 FiCreditCard,FiShield,FiImage,FiActivity,FiBarChart2,FiArrowUpRight,
 FiMenu,FiX,FiLogOut,FiClock,FiSmartphone} from 'react-icons/fi';
import {supabase} from '../lib/supabase';
import logo from '../assets/logo.png';

const menu=[
 {label:'Dashboard',href:'/admin/dashboard',Icon:FiGrid},
 {label:'Software Control',href:'/admin/software-control',Icon:FiSmartphone},
 {label:'Players',href:'/admin/players',Icon:FiUsers},
 {label:'Roster Controls',href:'/admin/roster',Icon:FiActivity},
 {label:'Match Schedule Center',href:'/admin/match-schedule',Icon:FiClock},
 {label:'Matches',href:'/admin/matches',Icon:FiTarget},
 {label:'Match History',href:'/admin/matches/history',Icon:FiClock},
 {label:'Teams',href:'/admin/teams',Icon:FiLayers},
 {label:'Tournaments',href:'/admin/tournaments',Icon:FiAward},
 {label:'Profit',href:'/admin/profit',Icon:FiDollarSign},
 {label:'Withdrawals',href:'/admin/dashboard?section=salary',Icon:FiCreditCard},
 {label:'Verification',href:'/admin/dashboard?section=verification',Icon:FiShield},
 {label:'Achievements',href:'/admin/achievements',Icon:FiImage},
 {label:'Moderators',href:'/admin/moderators',Icon:FiShield},
 {label:'Visitor Analytics',href:'/admin/visitors',Icon:FiActivity}
];
export default function AdminRouteSidebar(){
 const pathname=usePathname()||'';
 const [open,setOpen]=useState(false);
 // The command center already has its own integrated interactive sidebar.
 if(pathname==='/admin/dashboard'||!pathname.startsWith('/admin'))return null;
 const active=menu.filter(x=>pathname===x.href||pathname.startsWith(x.href+'/')).sort((a,b)=>b.href.length-a.href.length)[0]?.href;
 const logout=async()=>{await supabase.auth.signOut();window.location.assign('/login')};
 return <div className="op-admin-route-navigator">
  <button type="button" className="op-admin-route-open" aria-label="Open admin navigation"
   aria-expanded={open} onClick={()=>setOpen(true)}><FiMenu aria-hidden="true"/><span>Menu</span></button>
  {open&&<button type="button" className="op-admin-route-shade" aria-label="Close admin navigation"
   onClick={()=>setOpen(false)}/>}
  <aside className={open?'op-admin-route-sidebar is-open':'op-admin-route-sidebar'} aria-label="Admin sections">
   <div className="op-admin-route-brand">
    <Image src={logo} alt="Over Power Esports" width={48} height={48}/>
    <div><strong>OVER POWER</strong><span>ESPORTS ADMIN</span></div>
    <button type="button" className="op-admin-route-close" aria-label="Close admin menu" onClick={()=>setOpen(false)}><FiX/></button>
   </div>
   <p className="op-admin-route-group-label">ADMIN OPERATIONS</p>
   <nav className="op-admin-route-links" tabIndex={0} aria-label="Scrollable admin menu">
    {menu.map(({label,href,Icon},index)=><Link key={href} href={href}
      className={'op-admin-route-link'+(href===active?' active':'')}
      aria-current={href===active?'page':undefined}
      onClick={()=>setOpen(false)}>
       {href===active && <span data-op-inset-curve="top" aria-hidden="true"/>}
       <span className="op-admin-route-icon"><Icon aria-hidden="true"/></span>
       {href===active && <span data-op-inset-curve="bottom" aria-hidden="true"/>}
       <span data-op-nav-label>{label}</span>
       {index===0?<FiArrowUpRight aria-hidden="true" className="op-admin-route-end"/>:null}
      </Link>)}
   </nav>
   <div className="op-admin-route-bottom">
    <span className="op-admin-route-connected"><FiBarChart2/> SYSTEM CONNECTED</span>
    <Link href="/" onClick={()=>setOpen(false)} className="op-admin-route-site"><FiArrowUpRight/> View website</Link>
    <button type="button" onClick={logout} className="op-admin-route-logout"><FiLogOut/> LOG OUT</button>
   </div>
  </aside>
 </div>;
}
