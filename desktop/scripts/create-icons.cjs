'use strict';
const sharp=require('sharp');
const path=require('node:path');
async function main(){
 const root=path.resolve(__dirname,'..');
 const source=path.join(root,'assets','brand-logo.png'); // Homepage logo (same Git blob).
 const target=path.join(root,'assets','icon.png');
 const brand=await sharp(source).resize(800,800,{
  fit:'contain',background:{r:0,g:0,b:0,alpha:0}
 }).png().toBuffer();
 await sharp({
  create:{width:1024,height:1024,channels:4,
   background:{r:16,g:25,b:67,alpha:1}}
 }).composite([{input:brand,gravity:'centre'}]).png({compressionLevel:8}).toFile(target);
 const info=await sharp(target).metadata();
 if(info.width!==1024||info.height!==1024)throw Error('Icon size mismatch');
 console.log('Official homepage logo successfully embedded into desktop app icon.');
}
main().catch(e=>{console.error(e);process.exit(1)});
