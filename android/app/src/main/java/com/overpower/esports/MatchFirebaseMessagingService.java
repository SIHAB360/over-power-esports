package com.overpower.esports;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import java.util.Map;

public class MatchFirebaseMessagingService extends FirebaseMessagingService {
    public static final String CHANNEL_ID="over_power_match_alerts";
    public static void ensureChannel(android.content.Context context){
        if(Build.VERSION.SDK_INT>=26){
            NotificationManager manager=(NotificationManager)context.getSystemService(NOTIFICATION_SERVICE);
            NotificationChannel channel=new NotificationChannel(CHANNEL_ID,"Match Announcements & Reminders",
                NotificationManager.IMPORTANCE_HIGH);
            channel.setDescription("New approved-squad matches and 60/30/15-minute reminders");
            channel.enableVibration(true);
            manager.createNotificationChannel(channel);
        }
    }
    @Override public void onMessageReceived(RemoteMessage remote){
        Map<String,String> data=remote.getData();
        String title=data.get("title");
        if(title==null||title.length()==0)title="OVER POWER ESPORTS";
        String body=data.get("body");
        if(body==null)body="You have a new match notification.";
        String url=data.get("url");
        if(url==null||!url.startsWith("/app")||url.startsWith("//"))url="/app?tab=alerts";
        ensureChannel(this);
        Intent intent=new Intent(this,MainActivity.class);
        intent.putExtra("matchUrl",url);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP|Intent.FLAG_ACTIVITY_SINGLE_TOP);
        int id=Math.abs((data.getOrDefault("notification_id",title+body)).hashCode());
        PendingIntent pending=PendingIntent.getActivity(this,id,intent,
            PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
        NotificationCompat.Builder builder=new NotificationCompat.Builder(this,CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_EVENT)
            .setContentIntent(pending);
        NotificationManager manager=(NotificationManager)getSystemService(NOTIFICATION_SERVICE);
        manager.notify(id,builder.build());
    }
    @Override public void onNewToken(String token){
        super.onNewToken(token);
        // No secret session stored in Android. Token registers via the authenticated
        // /app JavaScript session on next foreground opening/explicit permission.
        getSharedPreferences("match_alerts",MODE_PRIVATE).edit().putBoolean("token_refresh_pending",true).apply();
    }
}
