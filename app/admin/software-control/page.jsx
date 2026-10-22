'use client';
import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
export default function SoftwareControlRedirect(){
 const router=useRouter();
 useEffect(()=>{router.replace('/admin/dashboard?section=schedule')},[router]);
 return <main style={{padding:24,color:'#e6f3ff'}}><h1>Match Schedule Center</h1><p>Announcement and match controls have moved into Match Schedule Center.</p><a style={{color:'#67e8f9'}} href="/admin/dashboard?section=schedule">Open Match Schedule Center</a></main>;
}
