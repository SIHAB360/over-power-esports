'use strict';
const sharp=require('sharp');
const path=require('node:path');
async function main(){
 const root=path.resolve(__dirname,'..');
 const source=path.join(root,'assets','icon.svg');
 const target=path.join(root,'assets','icon.png');
 await sharp(source,{density:180}).resize(1024,1024).png({compressionLevel:8}).toFile(target);
 const info=await sharp(target).metadata();
 if(info.width!==1024||info.height!==1024)throw Error('Icon size mismatch');
 console.log('Desktop icon generated');
}
main().catch(e=>{console.error(e);process.exit(1)});
