import "./globals.css";

export const metadata = {
  title: "قف من أنت",
  description: "لعبة تفاعلية",
  manifest: "/manifest.webmanifest"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <main className="min-h-dvh">{children}</main>

{process.env.NODE_ENV === 'production' && (
  <script
    dangerouslySetInnerHTML={{
      __html: `
        if ('serviceWorker' in navigator) {
          window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js');
          });
        }`
    }}
  />
)}

      </body>
    </html>
  );
}
