'use strict';
/*
 * Run before each Next.js build. New top-level admin/player page routes become
 * integrated app buttons automatically, with existing role gates unchanged.
 */
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const output=path.join(root,'app','app','generated-software-modules.jsx');
const manualAdmin=new Set(['dashboard','players','roster','match-schedule','matches','teams','tournaments','profit','achievements','visitors','moderators']);
const manualPlayer=new Set(['dashboard','withdrawal']);
function discover(kind,excluded){
 const directory=path.join(root,'app',kind);
 if(!fs.existsSync(directory))return [];
 return fs.readdirSync(directory,{withFileTypes:true})
  .filter(ent=>ent.isDirectory()&&/^[a-z0-9][a-z0-9-]*$/.test(ent.name)&&!excluded.has(ent.name))
  .filter(ent=>fs.readdirSync(path.join(directory,ent.name)).some(file=>/^page\.(js|jsx|tsx)$/.test(file)))
  .map(ent=>({id:'route-'+kind+'-'+ent.name,
    title:ent.name.split('-').map(s=>s[0].toUpperCase()+s.slice(1)).join(' '),
    section:ent.name,kind}));
}
const admins=discover('admin',manualAdmin);
const players=discover('player',manualPlayer);
const entry=m=>JSON.stringify(m.id)+":dynamic(()=>import('../"+m.kind+"/"+m.section+"/page'),{ssr:false})";
const data=m=>JSON.stringify({id:m.id,title:m.title,sub:'নতুন সফটওয়্যার সেকশন',tone:'blue'});
const lines=[
 "'use client';",
 "import dynamic from 'next/dynamic';",
 "// Generated on every build. Do not edit manually.",
 "export const EXTRA_ADMIN_MODULES=["+admins.map(data).join(',')+"];",
 "export const EXTRA_PLAYER_MODULES=["+players.map(data).join(',')+"];",
 "export const EXTRA_ADMIN_COMPONENTS={"+admins.map(entry).join(',')+"};",
 "export const EXTRA_PLAYER_COMPONENTS={"+players.map(entry).join(',')+"};",
 ""
];
fs.writeFileSync(output,lines.join('\n'),'utf8');
console.log('New software module routes: '+admins.length+' admin, '+players.length+' player.');
