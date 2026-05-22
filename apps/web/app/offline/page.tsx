import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="grid min-h-screen place-items-center bg-cream px-5 text-center">
      <div className="surface-card max-w-xl p-10">
        <h1 className="text-4xl font-extrabold text-ink">You&apos;re offline</h1>
        <p className="mt-3 text-slate">S N Homes will reconnect as soon as your network is available again.</p>
        <Link className="btn-primary mt-6" href="/">Open Home</Link>
      </div>
    </main>
  );
}
