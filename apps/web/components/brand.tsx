import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-3 transition hover:opacity-90">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-forest to-leaf text-lg font-black text-white shadow-glow">SN</span>
      <span>
        <span className="block text-2xl font-extrabold tracking-[0.1em] text-ink">S N HOMES</span>
        {!compact ? <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate">Kerala Matchmaking Platform</span> : null}
      </span>
    </Link>
  );
}
