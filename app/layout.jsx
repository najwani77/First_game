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
        (function () {
          var v = "${process.env.NEXT_PUBLIC_DEPLOY_ID}";
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function () {
              navigator.serviceWorker.register('/sw.js?v=' + v).then(function (reg) {
                // When the new SW takes control, refresh once to show the newest build
                navigator.serviceWorker.addEventListener('controllerchange', function () {
                  if (!window.__reloaded) { window.__reloaded = true; window.location.reload(); }
                });
              });
            });
          }
        })();
      `,
    }}
  />
)}

      </body>
    </html>
  );
}
