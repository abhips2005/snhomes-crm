import Image from "next/image";
import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-3 transition hover:opacity-90">
      <Image
        src="/logo.png"
        alt="S N Homes"
        width={compact ? 140 : 180}
        height={compact ? 40 : 52}
        priority
        className={`h-auto w-auto object-contain ${compact ? "max-h-9 sm:max-h-10" : "max-h-11 sm:max-h-12"}`}
      />
      {!compact ? (
        <span className="hidden text-xs font-semibold uppercase tracking-[0.16em] text-slate sm:block">
          
        </span>
      ) : null}
    </Link>
  );
}
