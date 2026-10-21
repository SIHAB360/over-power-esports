'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..');
const dir=path.join(root,'app/admin/qa-automatic-section');
assert(!fs.existsSync(dir),'Cannot test over a real module');
try{
 fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync(path.join(dir,'page.js'),'export default function Page(){return null}\n');
 execFileSync(process.execPath,['scripts/generate-software-modules.cjs'],{cwd:root});
 const result=fs.readFileSync(path.join(root,'app/app/generated-software-modules.jsx'),'utf8');
 assert(result.includes('route-admin-qa-automatic-section'));
 assert(result.includes("import('../admin/qa-automatic-section/page')"));
 console.log('PASS a newly added deployed admin page automatically becomes a software module');
}finally{
 fs.rmSync(dir,{recursive:true,force:true});
 execFileSync(process.execPath,['scripts/generate-software-modules.cjs'],{cwd:root});
}
