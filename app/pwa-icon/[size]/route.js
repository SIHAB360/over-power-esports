import {ImageResponse} from 'next/og';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';

// Render the REAL website logo inside appropriately sized maskable PNG icons.
export const dynamic='force-dynamic';
export const runtime='nodejs';
export async function GET(_request,{params}){
 const {size:requested}=await params;
 const size=Number(requested);
 if(![192,512].includes(size))return new Response('Icon not found',{status:404});
 try{
  const png=await readFile(join(process.cwd(),'public','over-power-logo.png'));
  const source='data:image/png;base64,'+png.toString('base64');
  const inset=Math.round(size*.14);
  const logoSize=size-2*inset;
  return new ImageResponse(
   <div style={{display:'flex',height:'100%',width:'100%',alignItems:'center',justifyContent:'center',
    background:'linear-gradient(135deg,#0d1735,#232861 60%,#4b2774)',borderRadius:Math.round(size*.18)}}>
    <img src={source} alt="OVER POWER ESPORTS" width={logoSize} height={logoSize}
     style={{objectFit:'contain'}}/>
   </div>,{width:size,height:size,headers:{'Cache-Control':'public, max-age=86400'}}
  );
 }catch(error){
  console.error('Official app icon generation failed',error.message);
  return new Response('Icon unavailable',{status:503});
 }
}
