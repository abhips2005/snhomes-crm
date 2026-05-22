"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [{ label: "Track Request", href: "/track" }] as const;

export function LandingNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (mq.matches) setOpen(false);
    };
    closeOnDesktop();
    mq.addEventListener("change", closeOnDesktop);
    return () => mq.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="flex shrink-0 items-center justify-end">
      <nav className="hidden items-center gap-2 lg:flex">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-xl border border-forest/25 bg-white/90 px-4 py-2 text-sm font-bold text-forest transition hover:border-leaf/50 hover:bg-white"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="relative lg:hidden">
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="grid h-11 w-11 place-items-center rounded-xl border border-forest/25 bg-white/90 text-forest shadow-sm transition hover:border-leaf/50 hover:bg-white"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        {open ? (
          <>
            <button
              type="button"
              aria-label="Close menu overlay"
              className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-[2px]"
              onClick={() => setOpen(false)}
            />
            <nav className="absolute right-0 top-full z-50 mt-2 min-w-[12rem] overflow-hidden rounded-2xl border border-cloud bg-white shadow-card">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block px-5 py-3.5 text-sm font-bold text-forest transition hover:bg-cream"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </>
        ) : null}
      </div>
    </div>
  );
}
