import {ImageResponse} from 'next/og';

// Stable same-origin PNG icons for Android TWA / PWA. Keep a 20% safe zone
// for maskable app icons; no third-party image requests or secret branding.
export const dynamic='force-static';
export const runtime='edge';
export async function GET(_request,{params}){
 const {size:requested}=await params;
 const size=Number(requested);
 if(![192,512].includes(size))return new Response('Icon size not found',{status:404});
 return new ImageResponse(
  <div style={{
   display:'flex',width:'100%',height:'100%',alignItems:'center',
   justifyContent:'center',background:'linear-gradient(145deg,#081633 0%,#252e83 55%,#5529a1 100%)',
   color:'#f8fdff',fontFamily:'sans-serif',position:'relative'
  }}>
   <div style={{
    position:'absolute',width:'66%',height:'66%',top:'17%',left:'17%',
    borderRadius:size*.13,background:'linear-gradient(135deg,#36ebff 0%,#6579ff 50%,#b25fff 100%)',
    display:'flex',alignItems:'center',justifyContent:'center'
   }}>
    <div style={{
     display:'flex',height:'90%',width:'90%',alignItems:'center',justifyContent:'center',
     borderRadius:size*.11,background:'linear-gradient(140deg,#101f48,#231b67)'
    }}>
     <div style={{display:'flex',fontWeight:900,fontSize:Math.round(size*.29),
        letterSpacing:-size*.018,lineHeight:1,color:'#ffffff'}}>
       OP
     </div>
    </div>
   </div>
  </div>,{width:size,height:size,headers:{'Cache-Control':'public, max-age=86400'}}
 );
}
