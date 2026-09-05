import "./globals.css";

export const metadata = {
  title: "Over Power Esports",
  description: "Victory is our Mission",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
