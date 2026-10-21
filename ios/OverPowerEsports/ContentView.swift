import SwiftUI
import WebKit
import UIKit

private let home = URL(string:"https://over-power-esports.vercel.app/app")!
private let trustedHost = "over-power-esports.vercel.app"

final class ApplicationState: ObservableObject {
    @Published var isLoading = true
    @Published var errorMessage: String?
    @Published var refreshID = 0
    func refresh(){
        errorMessage = nil
        isLoading = true
        refreshID += 1
    }
}

struct SoftwareBrowser: UIViewRepresentable {
    @ObservedObject var state: ApplicationState
    func makeCoordinator() -> Coordinator { Coordinator(state:state) }
    func makeUIView(context:Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default() // Persist legitimate Supabase login.
        config.preferences.javaScriptCanOpenWindowsAutomatically = false
        config.allowsInlineMediaPlayback = true
        let view = WKWebView(frame:.zero,configuration:config)
        view.navigationDelegate = context.coordinator
        view.uiDelegate = context.coordinator
        view.isOpaque = false
        view.backgroundColor = UIColor(red:0.05,green:0.08,blue:0.17,alpha:1)
        view.scrollView.contentInsetAdjustmentBehavior = .never
        view.allowsBackForwardNavigationGestures = true
        view.load(URLRequest(url:home,cachePolicy:.reloadIgnoringLocalCacheData))
        return view
    }
    func updateUIView(_ view: WKWebView, context:Context) {
        if context.coordinator.lastRefresh != state.refreshID {
            context.coordinator.lastRefresh = state.refreshID
            view.load(URLRequest(url:home,cachePolicy:.reloadIgnoringLocalCacheData))
        }
    }
    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        var state:ApplicationState
        var lastRefresh = 0
        init(state: ApplicationState){self.state=state}
        private func internalURL(_ url:URL)->Bool {
            url.scheme?.lowercased()=="https" && url.host?.lowercased()==trustedHost
        }
        func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction,
                     decisionHandler: @escaping (WKNavigationActionPolicy)->Void) {
            if let url=action.request.url {
                if internalURL(url){decisionHandler(.allow);return}
                if url.scheme=="https" || url.scheme=="http" {
                    UIApplication.shared.open(url,options:[:],completionHandler:nil)
                }
            }
            decisionHandler(.cancel)
        }
        func webView(_ webView:WKWebView, didFinish navigation:WKNavigation!) {
            DispatchQueue.main.async {self.state.isLoading=false;self.state.errorMessage=nil}
        }
        func webView(_ webView:WKWebView, didFail navigation:WKNavigation!,
                     withError error:Error) {showError(error)}
        func webView(_ webView:WKWebView, didFailProvisionalNavigation navigation:WKNavigation!,
                     withError error:Error) {showError(error)}
        private func showError(_ error:Error) {
            let ns = error as NSError
            if ns.code == NSURLErrorCancelled {return}
            DispatchQueue.main.async {
                self.state.errorMessage="ইন্টারনেট বা সার্ভার সংযোগ পাওয়া যাচ্ছে না।"
                self.state.isLoading=false
            }
        }
        func webView(_ webView:WKWebView, createWebViewWith configuration:WKWebViewConfiguration,
                     for navigationAction:WKNavigationAction,windowFeatures:WKWindowFeatures)->WKWebView? {
            if let url=navigationAction.request.url {
                if internalURL(url){webView.load(URLRequest(url:url))}
                else if url.scheme=="http" || url.scheme=="https" {
                    UIApplication.shared.open(url,options:[:],completionHandler:nil)
                }
            }
            return nil
        }
    }
}

struct ContentView: View {
    @StateObject private var state=ApplicationState()
    var body: some View {
        ZStack {
            Color(red:0.04,green:0.07,blue:0.16).ignoresSafeArea()
            SoftwareBrowser(state:state).opacity(state.isLoading || state.errorMessage != nil ? 0 : 1)
            if state.isLoading || state.errorMessage != nil {
                VStack(spacing:17) {
                    Image("BrandLogo")
                        .resizable().scaledToFit().frame(width:168,height:168)
                        .accessibilityLabel("OVER POWER ESPORTS")
                    Text("OVER POWER ESPORTS")
                        .font(.system(size:22,weight:.black,design:.rounded))
                        .foregroundColor(.white)
                    Text("ESPORTS APPLICATION")
                        .font(.system(size:12,weight:.semibold))
                        .foregroundColor(Color(red:0.53,green:0.95,blue:0.96))
                    if let message=state.errorMessage {
                        Text(message).foregroundColor(.white.opacity(0.86))
                            .multilineTextAlignment(.center).padding(.top,20)
                        Button("আবার চেষ্টা করুন"){state.refresh()}
                            .padding(.horizontal,30).padding(.vertical,13)
                            .background(Color(red:0.35,green:0.45,blue:0.91))
                            .foregroundColor(.white).clipShape(RoundedRectangle(cornerRadius:13))
                    } else {
                        ProgressView().tint(.cyan).padding(.top,20)
                    }
                }.padding(28)
            }
        }
        .preferredColorScheme(.dark)
    }
}
