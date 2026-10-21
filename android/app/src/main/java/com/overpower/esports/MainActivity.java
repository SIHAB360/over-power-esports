package com.overpower.esports;

import android.app.Activity;
import android.os.Bundle;
import android.os.Build;
import android.graphics.Color;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceError;
import android.webkit.WebResourceResponse;
import android.webkit.SslErrorHandler;
import android.net.http.SslError;
import android.webkit.DownloadListener;
import android.content.Intent;
import android.net.Uri;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Button;
import android.widget.ProgressBar;
import android.widget.FrameLayout;
import android.graphics.Typeface;
import android.Manifest;
import android.content.pm.PackageManager;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;
import androidx.webkit.JavaScriptReplyProxy;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import java.util.Collections;
import org.json.JSONObject;

public class MainActivity extends Activity {
    private static final String ROOT = "https://over-power-esports.vercel.app";
    private static final String START = ROOT + "/app";
    private WebView webView;
    private FrameLayout rootView;
    private LinearLayout errorView;
    private ProgressBar progress;
    private JavaScriptReplyProxy pendingPushReply;
    private static final int NOTIFICATION_PERMISSION_REQUEST=1742;
    private boolean firebaseReady=false;

    private boolean official(Uri uri) {
        return "https".equalsIgnoreCase(uri.getScheme())
            && "over-power-esports.vercel.app".equalsIgnoreCase(uri.getHost())
            && (uri.getPort() == -1 || uri.getPort() == 443);
    }

    private void external(Uri uri) {
        String scheme = uri.getScheme();
        if (!"https".equalsIgnoreCase(scheme) && !"http".equalsIgnoreCase(scheme)) return;
        try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); } catch (Exception ignored) {}
    }

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.rgb(13, 25, 55));
        getWindow().setNavigationBarColor(Color.rgb(13, 25, 55));
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);

        rootView = new FrameLayout(this);
        rootView.setBackgroundColor(Color.rgb(10, 21, 46));
        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(10, 21, 46));
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setAllowFileAccess(false);
        webView.getSettings().setAllowContentAccess(true);
        webView.getSettings().setJavaScriptCanOpenWindowsAutomatically(false);
        webView.getSettings().setSupportMultipleWindows(false);
        webView.getSettings().setMixedContentMode(android.webkit.WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        webView.getSettings().setCacheMode(android.webkit.WebSettings.LOAD_DEFAULT);
        webView.getSettings().setMediaPlaybackRequiresUserGesture(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            webView.getSettings().setSafeBrowsingEnabled(true);
        }
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, false);
        WebView.setWebContentsDebuggingEnabled(false);
        webView.getSettings().setUserAgentString(webView.getSettings().getUserAgentString()+" OverPowerNative/2.1");
        initializeFirebase();
        MatchFirebaseMessagingService.ensureChannel(this);
        // Origin-restricted WebMessageListener: unlike addJavascriptInterface,
        // untrusted iframes or external sites cannot invoke the native bridge.
        if(WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)){
            WebViewCompat.addWebMessageListener(webView,"OverPowerNative",
                Collections.singleton(ROOT),(view,message,sourceOrigin,isMainFrame,replyProxy)->{
                    if(!isMainFrame||!ROOT.equals(sourceOrigin.toString()))return;
                    String command=message.getData();
                    if("enable-push".equals(command)){
                        runOnUiThread(()->enableNativePush(replyProxy,false));
                    }else if("refresh-push".equals(command)){
                        runOnUiThread(()->enableNativePush(replyProxy,true));
                    }else if("disable-push".equals(command)){
                        runOnUiThread(()->disableNativePush(replyProxy));
                    }
                });
        }
        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (!request.isForMainFrame()) return false;
                Uri uri=request.getUrl();
                if (official(uri)) return false;
                external(uri);
                return true;
            }
            @Override public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                progress.setVisibility(View.VISIBLE);
                if(errorView != null)errorView.setVisibility(View.GONE);
            }
            @Override public void onPageFinished(WebView view, String url) {
                progress.setVisibility(View.GONE);
                CookieManager.getInstance().flush();
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if(request.isForMainFrame())showError();
            }
            @Override public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse response) {
                if(request.isForMainFrame() && response.getStatusCode() >= 500)showError();
            }
            @Override public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                handler.cancel();
                showError();
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override public void onProgressChanged(WebView view, int newProgress) {
                progress.setProgress(newProgress);
                if(newProgress >= 100) progress.setVisibility(View.GONE);
            }
        });
        webView.setDownloadListener((url,agent,disposition,mimeType,size) -> {
            try {
                Uri uri=Uri.parse(url);
                if ("https".equalsIgnoreCase(uri.getScheme())) external(uri);
            } catch(Exception ignored){}
        });
        rootView.addView(webView,new FrameLayout.LayoutParams(-1,-1));

        progress = new ProgressBar(this,null,android.R.attr.progressBarStyleHorizontal);
        progress.setMax(100);
        progress.setProgressTintList(android.content.res.ColorStateList.valueOf(Color.rgb(103, 235, 240)));
        FrameLayout.LayoutParams progParams=new FrameLayout.LayoutParams(-1,6);
        rootView.addView(progress,progParams);

        errorView=new LinearLayout(this);
        errorView.setOrientation(LinearLayout.VERTICAL);
        errorView.setGravity(android.view.Gravity.CENTER);
        errorView.setPadding(44,35,44,35);
        errorView.setBackgroundColor(Color.rgb(13,26,55));
        TextView icon=new TextView(this);
        icon.setText("OVER POWER");
        icon.setTextColor(Color.rgb(114,240,241));
        icon.setTextSize(27);
        icon.setTypeface(null,Typeface.BOLD);
        icon.setGravity(android.view.Gravity.CENTER);
        errorView.addView(icon);
        TextView title=new TextView(this);
        title.setText("Check your internet connection\nThen try again");
        title.setTextColor(Color.WHITE);
        title.setTextSize(19);
        title.setGravity(android.view.Gravity.CENTER);
        title.setPadding(0,24,0,24);
        errorView.addView(title);
        Button retry=new Button(this);
        retry.setText("Try Again");
        retry.setOnClickListener(v -> webView.loadUrl(START));
        errorView.addView(retry);
        FrameLayout.LayoutParams errParams=new FrameLayout.LayoutParams(-1,-1);
        rootView.addView(errorView,errParams);
        errorView.setVisibility(View.GONE);
        setContentView(rootView);
        webView.loadUrl(startUrl());
    }
    private String startUrl(){
        String path=getIntent()!=null?getIntent().getStringExtra("matchUrl"):null;
        if(path!=null && path.startsWith("/app")&&!path.startsWith("//")){
            return ROOT+path;
        }
        return START;
    }
    @Override protected void onNewIntent(Intent intent){
        super.onNewIntent(intent);
        setIntent(intent);
        if(webView!=null)webView.loadUrl(startUrl());
    }
    private void initializeFirebase(){
        String appId=getString(R.string.op_firebase_app_id);
        String apiKey=getString(R.string.op_firebase_api_key);
        String projectId=getString(R.string.op_firebase_project_id);
        String senderId=getString(R.string.op_firebase_sender_id);
        if(appId.isEmpty()||apiKey.isEmpty()||projectId.isEmpty()||senderId.isEmpty()){
            firebaseReady=false;
            return;
        }
        try{
            FirebaseApp existing=FirebaseApp.getApps(this).isEmpty()?null:FirebaseApp.getInstance();
            if(existing==null){
                FirebaseOptions options=new FirebaseOptions.Builder()
                    .setApplicationId(appId).setApiKey(apiKey).setProjectId(projectId)
                    .setGcmSenderId(senderId).build();
                FirebaseApp.initializeApp(this,options);
            }
            firebaseReady=true;
        }catch(Exception e){firebaseReady=false;android.util.Log.w("OverPowerFCM","FCM initialization unavailable: "+e.getClass().getSimpleName());}
    }
    private void replyError(JavaScriptReplyProxy reply,String message){
        try{reply.postMessage("{\"type\":\"push-error\",\"message\":"+JSONObject.quote(message)+"}");}
        catch(Exception ignored){}
    }
    private void enableNativePush(JavaScriptReplyProxy reply,boolean silentRefresh){
        if(!firebaseReady){
            replyError(reply,"Firebase is not yet configured for this APK. Contact the app administrator.");
            return;
        }
        pendingPushReply=reply;
        FirebaseMessaging.getInstance().setAutoInitEnabled(true);
        if(Build.VERSION.SDK_INT>=33 &&
            ContextCompat.checkSelfPermission(this,Manifest.permission.POST_NOTIFICATIONS)
                !=PackageManager.PERMISSION_GRANTED){
            if(silentRefresh){
                replyError(reply,"Notifications are disabled in Android Settings.");
                pendingPushReply=null;
                return;
            }
            ActivityCompat.requestPermissions(this,
                new String[]{Manifest.permission.POST_NOTIFICATIONS},NOTIFICATION_PERMISSION_REQUEST);
            return;
        }
        requestFcmToken();
    }
    private void disableNativePush(JavaScriptReplyProxy reply){
        if(!firebaseReady){
            replyError(reply,"Firebase is not configured.");
            return;
        }
        FirebaseMessaging.getInstance().setAutoInitEnabled(false);
        FirebaseMessaging.getInstance().deleteToken().addOnCompleteListener(task->{
            try{reply.postMessage("{\\"type\\":\\"push-disabled\\"}");}
            catch(Exception ignored){}
        });
    }
    private void requestFcmToken(){
        final JavaScriptReplyProxy reply=pendingPushReply;
        if(reply==null)return;
        FirebaseMessaging.getInstance().getToken().addOnCompleteListener(task->{
            if(!task.isSuccessful()||task.getResult()==null||task.getResult().isEmpty()){
                replyError(reply,"Unable to register this Android device for notifications.");
            }else{
                String token=task.getResult();
                try{reply.postMessage("{\"type\":\"push-token\",\"token\":"+JSONObject.quote(token)+"}");}
                catch(Exception ignored){}
            }
            pendingPushReply=null;
        });
    }
    @Override public void onRequestPermissionsResult(int requestCode,String[] permissions,int[] grantResults){
        super.onRequestPermissionsResult(requestCode,permissions,grantResults);
        if(requestCode!=NOTIFICATION_PERMISSION_REQUEST)return;
        if(grantResults.length>0&&grantResults[0]==PackageManager.PERMISSION_GRANTED)
            requestFcmToken();
        else{
            if(pendingPushReply!=null)replyError(pendingPushReply,
               "Android notification permission was declined. Enable it in Settings to receive banners.");
            pendingPushReply=null;
        }
    }
    private void showError() {
        runOnUiThread(() -> { progress.setVisibility(View.GONE);errorView.setVisibility(View.VISIBLE); });
    }
    @Override public void onBackPressed() {
        if(errorView.getVisibility()==View.VISIBLE){
            errorView.setVisibility(View.GONE);
            webView.loadUrl(START);
        } else if(webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }
    @Override protected void onPause(){super.onPause();if(webView!=null)webView.onPause();}
    @Override protected void onResume(){super.onResume();if(webView!=null)webView.onResume();}
    @Override protected void onDestroy(){if(webView!=null){rootView.removeView(webView);webView.destroy();webView=null;}super.onDestroy();}
}
