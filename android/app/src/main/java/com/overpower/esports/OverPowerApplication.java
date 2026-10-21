package com.overpower.esports;

import android.app.Application;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

public class OverPowerApplication extends Application {
 @Override public void onCreate(){
  super.onCreate();
  // Initialized for both Activity and background FCM service process start.
  // Public Firebase app identifiers only; no private service account credentials.
  String key=BuildConfig.FCM_API_KEY;
  String appId=BuildConfig.FCM_APP_ID;
  String sender=BuildConfig.FCM_SENDER_ID;
  String project=BuildConfig.FCM_PROJECT_ID;
  if(key.isEmpty()||appId.isEmpty()||sender.isEmpty()||project.isEmpty())return;
  try{
   if(FirebaseApp.getApps(this).isEmpty()){
    FirebaseOptions options=new FirebaseOptions.Builder()
      .setApiKey(key).setApplicationId(appId)
      .setGcmSenderId(sender).setProjectId(project).build();
    FirebaseApp.initializeApp(this,options);
   }
   MatchFirebaseMessagingService.ensureChannel(this);
  }catch(RuntimeException ignored){
   // The native settings UI explains when Firebase configuration is missing.
  }
 }
}
