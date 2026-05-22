import { Brand } from "@/components/brand";
import Link from "next/link";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-kerala-wave">
      <header className="sticky top-0 z-50 border-b border-cloud/70 bg-white/90 backdrop-blur-lg">
        <div className="h-1 w-full bg-gradient-to-r from-forest via-leaf to-gold" />
        <div className="page-wrap flex items-center justify-between py-4">
          <Brand compact />
          <nav className="flex items-center gap-2 text-sm font-bold text-slate">
            <Link className="btn-ghost" href="/track">Track</Link>
            <Link className="btn-ghost" href="/admin/login">Admin</Link>
          </nav>
        </div>
      </header>
      <div className="pb-16 pt-4">{children}</div>
    </main>
  );
}
