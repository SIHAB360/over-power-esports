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

public class MainActivity extends Activity {
    private static final String ROOT = "https://over-power-esports.vercel.app";
    private static final String START = ROOT + "/app";
    private WebView webView;
    private FrameLayout rootView;
    private LinearLayout errorView;
    private ProgressBar progress;

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
        webView.loadUrl(START);
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
