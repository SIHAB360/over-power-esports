import {NextResponse} from 'next/server';

// Same-origin, one-tap Android download. GitHub Releases serves the APK as an attachment.
const APK_URL='https://github.com/SIHAB360/over-power-esports/releases/download/android-v1.3.0/over-power-esports.apk';
export async function GET(){
 return NextResponse.redirect(APK_URL,302,{
  headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex'}
 });
}
