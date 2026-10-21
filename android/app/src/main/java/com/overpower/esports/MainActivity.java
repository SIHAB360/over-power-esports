package com.overpower.esports;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.webkit.CookieManager;
import android.webkit.PermissionRequest;
import android.webkit.SslErrorHandler;
import android.net.http.SslError;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

public class MainActivity extends Activity {
    private static final String START_URL = "https://over-power-esports.vercel.app/app";
    private static final String ALLOWED_HOST = "over-power-esports.vercel.app";
    private static final int FILE_CHOOSER_REQUEST = 714;
    private WebView browser;
    private FrameLayout splash;
    private TextView status;
    private Button retry;
    private ProgressBar progress;
    private ValueCallback<Uri[]> fileCallback;
    private boolean firstPageLoaded = false;

    private int dp(float v) {
        return Math.round(getResources().getDisplayMetrics().density * v);
    }
    private boolean isOfficial(Uri uri) {
        return uri != null && "https".equalsIgnoreCase(uri.getScheme())
                && ALLOWED_HOST.equalsIgnoreCase(uri.getHost())
                && (uri.getPort() == -1 || uri.getPort() == 443);
    }
    private boolean openExternal(Uri uri) {
        if (uri == null) return true;
        String scheme = uri.getScheme();
        if (!"https".equalsIgnoreCase(scheme) && !"http".equalsIgnoreCase(scheme)) return true;
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, uri)
                    .addCategory(Intent.CATEGORY_BROWSABLE));
        } catch (ActivityNotFoundException ignored) {
            showError("No browser available to open this link.");
        }
        return true;
    }
    private void showError(String message) {
        if (browser != null) browser.setVisibility(View.INVISIBLE);
        if (splash != null) splash.setVisibility(View.VISIBLE);
        if (status != null) status.setText(message);
        if (retry != null) retry.setVisibility(View.VISIBLE);
    }
    private void showContent() {
        if (browser == null || splash == null) return;
        firstPageLoaded = true;
        browser.setVisibility(View.VISIBLE);
        splash.setVisibility(View.GONE);
    }
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.rgb(11, 21, 47));
        getWindow().setNavigationBarColor(Color.rgb(11, 21, 47));

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(9, 17, 40));
        browser = new WebView(this);
        browser.setBackgroundColor(Color.rgb(11, 19, 41));
        browser.setVisibility(View.INVISIBLE);
        WebSettings settings = browser.getSettings();
        settings.setJavaScriptEnabled(true); // Next.js app needs JavaScript; no Android bridge is attached.
        settings.setDomStorageEnabled(true); // Supabase manages signed-in sessions.
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true); // Only the user-chosen file picker URI is readable.
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSafeBrowsingEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setMediaPlaybackRequiresUserGesture(true);
        browser.setOverScrollMode(View.OVER_SCROLL_NEVER);
        WebView.setWebContentsDebuggingEnabled(false);
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(browser, false);

        browser.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (isOfficial(uri)) return false;
                if (!request.isForMainFrame()) return false;
                return openExternal(uri);
            }
            @Override public void onPageFinished(WebView view, String url) {
                if (url != null && url.startsWith("https://" + ALLOWED_HOST + "/")) {
                    progress.setVisibility(View.GONE);
                    showContent();
                }
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest req, WebResourceError error) {
                if (req.isForMainFrame()) showError("No internet connection. Reconnect and retry.");
            }
            @Override public void onReceivedHttpError(WebView view, WebResourceRequest req, android.webkit.WebResourceResponse response) {
                if (req.isForMainFrame() && response.getStatusCode() >= 500)
                    showError("The server is temporarily unavailable. Please retry.");
            }
            @Override public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                handler.cancel(); // NEVER bypass certificate errors.
                showError("Secure connection could not be verified.");
            }
        });
        browser.setWebChromeClient(new WebChromeClient() {
            @Override public void onProgressChanged(WebView view, int value) {
                if (progress != null) {
                    progress.setProgress(value);
                    if (value == 100) progress.setVisibility(View.GONE);
                }
            }
            @Override public void onPermissionRequest(PermissionRequest request) {
                request.deny(); // No silent microphone, camera, location or OS permissions.
            }
            @Override public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> callback,
                                                        FileChooserParams chooserParams) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                try {
                    Intent intent = chooserParams.createIntent();
                    startActivityForResult(intent, FILE_CHOOSER_REQUEST);
                    return true;
                } catch (ActivityNotFoundException e) {
                    fileCallback = null;
                    callback.onReceiveValue(null);
                    return false;
                }
            }
        });
        root.addView(browser, new FrameLayout.LayoutParams(-1, -1));

        splash = new FrameLayout(this);
        GradientDrawable gradient = new GradientDrawable(GradientDrawable.Orientation.TL_BR,
                new int[]{0xff101f52, 0xff121c3e, 0xff381f60});
        splash.setBackground(gradient);

        LinearLayout center = new LinearLayout(this);
        center.setGravity(Gravity.CENTER);
        center.setOrientation(LinearLayout.VERTICAL);
        center.setPadding(dp(26), dp(25), dp(26), dp(25));

        ImageView logo = new ImageView(this);
        logo.setImageResource(R.drawable.over_power_logo); // EXACT homepage brand, not placeholder.
        logo.setScaleType(ImageView.ScaleType.FIT_CENTER);
        LinearLayout.LayoutParams logoParams = new LinearLayout.LayoutParams(dp(174), dp(174));
        logoParams.bottomMargin = dp(16);
        center.addView(logo, logoParams);

        TextView title = new TextView(this);
        title.setText("OVER POWER ESPORTS");
        title.setTextColor(Color.WHITE);
        title.setGravity(Gravity.CENTER);
        title.setTextSize(22);
        title.setTypeface(null, 1);
        center.addView(title, new LinearLayout.LayoutParams(-2,-2));

        TextView subtitle = new TextView(this);
        subtitle.setText("ESPORTS APPLICATION");
        subtitle.setTextColor(0xff9bebfa);
        subtitle.setTextSize(11);
        subtitle.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams subParams = new LinearLayout.LayoutParams(-2,-2);
        subParams.topMargin = dp(5);
        center.addView(subtitle, subParams);

        status = new TextView(this);
        status.setText("Opening your app…");
        status.setTextSize(14);
        status.setTextColor(0xffcadcf7);
        status.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams statusParams = new LinearLayout.LayoutParams(-1,-2);
        statusParams.topMargin = dp(26);
        center.addView(status, statusParams);

        retry = new Button(this);
        retry.setText("Try Again");
        retry.setAllCaps(false);
        retry.setVisibility(View.GONE);
        retry.setOnClickListener(v -> {
            status.setText("Opening your app…");
            retry.setVisibility(View.GONE);
            progress.setVisibility(View.VISIBLE);
            browser.loadUrl(START_URL);
        });
        LinearLayout.LayoutParams retryParams = new LinearLayout.LayoutParams(-2, dp(52));
        retryParams.topMargin = dp(17);
        center.addView(retry, retryParams);

        FrameLayout.LayoutParams contentParams =
                new FrameLayout.LayoutParams(-1,-2,Gravity.CENTER);
        splash.addView(center, contentParams);
        root.addView(splash, new FrameLayout.LayoutParams(-1,-1));

        progress = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progress.setIndeterminate(false);
        progress.setMax(100);
        progress.setProgressTintList(android.content.res.ColorStateList.valueOf(0xff67e8f9));
        FrameLayout.LayoutParams progressParams = new FrameLayout.LayoutParams(-1,dp(3),Gravity.TOP);
        root.addView(progress, progressParams);
        setContentView(root);

        // Always load the *separate app UI*; never launch Chrome or the website home.
        browser.loadUrl(START_URL);
    }
    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode,resultCode,data);
        if (requestCode == FILE_CHOOSER_REQUEST && fileCallback != null) {
            fileCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode,data));
            fileCallback = null;
        }
    }
    @Override public void onBackPressed() {
        if (browser != null && browser.canGoBack() && firstPageLoaded) browser.goBack();
        else new AlertDialog.Builder(this).setTitle("OVER POWER ESPORTS")
                .setMessage("Do you want to close the app?")
                .setNegativeButton("No", (d,w) -> d.dismiss())
                .setPositiveButton("Exit", (d,w) -> finish())
                .show();
    }
    @Override protected void onPause() {
        if (browser != null) browser.onPause();
        super.onPause();
    }
    @Override protected void onResume() {
        super.onResume();
        if (browser != null) {
            browser.onResume();
            if (firstPageLoaded) browser.evaluateJavascript("window.dispatchEvent(new Event('focus'))", null);
        }
    }
    @Override protected void onDestroy() {
        if (fileCallback != null) {fileCallback.onReceiveValue(null);fileCallback=null;}
        if (browser != null) {
            ((ViewGroup)browser.getParent()).removeView(browser);
            browser.destroy();
            browser=null;
        }
        super.onDestroy();
    }
}
