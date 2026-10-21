package com.overpower.esports;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.Context;
import android.media.RingtoneManager;
import android.os.Build;
import android.Manifest;
import android.content.pm.PackageManager;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class MatchFirebaseMessagingService extends FirebaseMessagingService {
    private static final String CHANNEL = "overpower_match_alerts_v2";
    public static void ensureChannel(Context context) {
        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager=(NotificationManager)context.getSystemService(Context.NOTIFICATION_SERVICE);
            if(manager!=null){
                NotificationChannel channel=new NotificationChannel(CHANNEL,"Match Alerts",NotificationManager.IMPORTANCE_HIGH);
                channel.setDescription("New match announcements and scheduled match reminders");
                channel.enableVibration(true);
                manager.createNotificationChannel(channel);
            }
        }
    }
    @Override public void onNewToken(String token){
        super.onNewToken(token);
        // Never upload anonymously. Sync after the signed-in player next opens
        // the app; the verified browser-side Bearer token authorizes registration.
        getSharedPreferences("overpower_push",MODE_PRIVATE).edit().putString("current_token",token).apply();
    }
    @Override public void onMessageReceived(RemoteMessage remote){
        super.onMessageReceived(remote);
        if(!"overpower".equals(remote.getData().getOrDefault("sender","overpower")))return;
        if(!getSharedPreferences("overpower_push",MODE_PRIVATE).getBoolean("enabled",false))return;
        String title=remote.getData().get("title"),body=remote.getData().get("body");
        String id=remote.getData().get("notificationId");
        if(title==null||title.length()==0)title="OVER POWER Match Alert";
        if(body==null)body="You have a new match notification.";
        if(Build.VERSION.SDK_INT>=33&&checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED)return;
        ensureChannel(this);
        Intent launch=new Intent(this,MainActivity.class);
        launch.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP|Intent.FLAG_ACTIVITY_SINGLE_TOP);
        launch.putExtra("app_url","/app?tab=alerts");
        int numericId=id!=null?id.hashCode():title.hashCode();
        PendingIntent pi=PendingIntent.getActivity(this,numericId,launch,
          PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
        NotificationCompat.Builder notification=new NotificationCompat.Builder(this,CHANNEL)
          .setSmallIcon(android.R.drawable.ic_dialog_info)
          .setContentTitle(title).setContentText(body)
          .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
          .setPriority(NotificationCompat.PRIORITY_HIGH)
          .setCategory(NotificationCompat.CATEGORY_REMINDER)
          .setDefaults(NotificationCompat.DEFAULT_ALL)
          .setAutoCancel(true).setContentIntent(pi)
          .setVisibility(NotificationCompat.VISIBILITY_PRIVATE);
        try {
            NotificationManagerCompat.from(this).notify(numericId,notification.build());
        }catch(SecurityException denied){
            Log.w("OverPowerFCM","Notification permission was not granted");
        }
    }
}
