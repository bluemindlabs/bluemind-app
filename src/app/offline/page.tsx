// src/app/offline/page.tsx
// Shown by the service worker when a navigation fails offline.
export default function OfflinePage() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div className="glass rounded-3xl p-8">
        <p className="text-4xl">📡</p>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink">You&apos;re offline</h1>
        <p className="mt-1 text-sm text-muted">
          BlueMind needs a connection to load new data. Reconnect and try again.
        </p>
      </div>
    </div>
  );
}
