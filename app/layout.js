import "./globals.css";
// Match page styles are scoped to .op-match-page, preserving the rest of the site.
import "./admin/matches/match-premium.css";
import PageTransition from "./components/PageTransition";
import VisitorTracker from "./components/VisitorTracker";

export const metadata = {
  title: "Over Power Esports",
  description: "Victory is our Mission",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700;800&family=Noto+Serif+Bengali:wght@400;500;600;700&family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        />
      </head>

      <body
        style={{
          "--font-orbitron": '"Orbitron", sans-serif',
          "--font-rajdhani": '"Rajdhani", sans-serif',
          "--font-bangla": '"Hind Siliguri", "Kalpurush", sans-serif',
        }}
      >
        <PageTransition />
        <VisitorTracker />
        {children}
      </body>
    </html>
  );
}
