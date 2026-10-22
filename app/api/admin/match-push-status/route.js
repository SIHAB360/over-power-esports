import {identity,errResponse,HttpError,noStore} from '../../../lib/match-center-server';
import {nativeMessaging} from '../../../lib/match-native-push-server';

export const dynamic='force-dynamic';
export const runtime='nodejs';

// Status only. Never expose device tokens, player IDs, VAPID keys or
// Firebase service credentials to dashboard/browser clients.
export async function GET(req){
 try{
  const {db}=await identity(req,true);
  const [native,web,approved]=await Promise.all([
   db.from('op_match_native_push_tokens').select('id',{head:true,count:'exact'}),
   db.from('op_match_push_subscriptions').select('id',{head:true,count:'exact'}),
   db.from('players').select('id',{head:true,count:'exact'}).eq('status','approved')
  ]);
  if(native.error||web.error||approved.error)throw new HttpError('Notification status unavailable.',503);
  return Response.json({
   firebaseConfigured:!!nativeMessaging(), // credentials configured, not a delivery receipt
   registeredAndroidDevices:native.count||0,
   webPushDevices:web.count||0,
   approvedRosterEntries:approved.count||0,
   message:'Background Android banners require Firebase server setup, matching Android APK configuration and each player opting in on the device.'
  },{headers:noStore});
 }catch(e){return errResponse(e)}
}
