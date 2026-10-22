package com.overpower.esports;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.os.Build;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.net.Uri;
import androidx.core.content.ContextCompat;
import androidx.core.app.NotificationCompat;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import java.util.Map;

public class MatchFirebaseMessagingService extends FirebaseMessagingService {
    public static final String CHANNEL_ID="over_power_match_alerts_v2";
    public static void ensureChannel(android.content.Context context){
        if(Build.VERSION.SDK_INT>=26){
            NotificationManager manager=(NotificationManager)context.getSystemService(NOTIFICATION_SERVICE);
            NotificationChannel channel=new NotificationChannel(CHANNEL_ID,"Match Announcements & Reminders",
                NotificationManager.IMPORTANCE_HIGH);
            channel.setDescription("New approved-squad matches and 60/30/15-minute reminders");
            channel.enableVibration(true);
            channel.setSound(android.media.RingtoneManager.getDefaultUri(android.media.RingtoneManager.TYPE_NOTIFICATION),new android.media.AudioAttributes.Builder().setUsage(android.media.AudioAttributes.USAGE_NOTIFICATION).build());
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
        Bitmap brandLogo=null;
        try{
            Drawable drawable=ContextCompat.getDrawable(this,R.mipmap.ic_launcher);
            if(drawable instanceof BitmapDrawable)brandLogo=((BitmapDrawable)drawable).getBitmap();
            else if(drawable!=null){
                int size=(int)(64*getResources().getDisplayMetrics().density);
                Bitmap bitmap=Bitmap.createBitmap(size,size,Bitmap.Config.ARGB_8888);
                android.graphics.Canvas canvas=new android.graphics.Canvas(bitmap);
                drawable.setBounds(0,0,size,size);
                drawable.draw(canvas);
                brandLogo=bitmap;
            }
        }catch(Exception ignored){}
        String matchName=data.get("match_name");
        String matchTime=data.get("match_time");
        String tournament=data.get("tournament");
        StringBuilder detail=new StringBuilder(body);
        if(tournament!=null&&!tournament.isEmpty()&&!body.contains(tournament))detail.append("\\nTournament: ").append(tournament);
        if(matchName!=null&&!matchName.isEmpty()&&!body.contains(matchName))detail.append("\\nMatch: ").append(matchName);
        if(matchTime!=null&&!matchTime.isEmpty()&&!body.contains(matchTime))detail.append("\\nStart: ").append(matchTime);
        NotificationCompat.Builder builder=new NotificationCompat.Builder(this,CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(detail.toString()).setBigContentTitle(title))
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_EVENT)
            .setContentIntent(pending)
            .setColor(android.graphics.Color.rgb(147,94,222))
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setDefaults(NotificationCompat.DEFAULT_ALL)
            .addAction(android.R.drawable.ic_menu_view,"View Match",pending);
        if(brandLogo!=null)builder.setLargeIcon(brandLogo);
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
