"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { Brand } from "@/components/brand";

const links = [
  { label: "Dashboard", href: "/admin" },
  { label: "Leads", href: "/admin/leads" },
  { label: "Properties", href: "/admin/properties" },
  { label: "Matching", href: "/admin/matching" },
  { label: "Followups", href: "/admin/followups" },
  { label: "Visits", href: "/admin/visits" },
  { label: "Activity", href: "/admin/activity" },
  { label: "Analytics", href: "/admin/analytics" },
  { label: "Settings", href: "/admin/settings" }
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

function navLinkClass(active: boolean, variant: "bar" | "drawer") {
  if (variant === "drawer") {
    return `mb-1 block rounded-xl px-4 py-3 text-sm font-bold transition ${
      active ? "bg-forest text-white shadow-sm" : "text-slate hover:bg-cream hover:text-forest"
    }`;
  }

  return `whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-bold transition ${
    active
      ? "border-forest bg-forest text-white shadow-sm"
      : "border-cloud/80 bg-cream hover:border-leaf/40 hover:bg-white hover:text-forest"
  }`;
}

export function AdminNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const mobileMenu =
    open && mounted ? (
      <>
        <button
          type="button"
          aria-label="Close menu overlay"
          className="fixed inset-0 z-[100] bg-ink/40 backdrop-blur-[2px] lg:hidden"
          onClick={() => setOpen(false)}
        />
        <aside className="fixed right-0 top-0 z-[110] flex h-dvh w-full max-w-xs flex-col border-l border-cloud bg-white shadow-soft lg:hidden">
          <div className="flex shrink-0 items-center justify-between border-b border-cloud px-5 py-4">
            <p className="text-sm font-black uppercase tracking-[0.14em] text-forest">CRM Menu</p>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="grid h-10 w-10 place-items-center rounded-lg border border-cloud text-forest transition hover:bg-cream"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto p-3">
            {links.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={navLinkClass(active, "drawer")}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="shrink-0 space-y-2 border-t border-cloud p-4">
            <AdminLogoutButton variant="drawer" onLoggedOut={() => setOpen(false)} />
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="block rounded-xl border border-cloud bg-cream px-4 py-3 text-center text-sm font-semibold text-slate transition hover:border-leaf/40 hover:text-forest"
            >
              Back to site
            </Link>
          </div>
        </aside>
      </>
    ) : null;

  return (
    <header className="sticky top-0 z-50 border-b border-cloud/80 bg-white/95">
      <div className="h-1 w-full bg-gradient-to-r from-forest via-leaf to-gold" />
      <div className="page-wrap py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Brand compact />
            <span className="hidden rounded-full border border-leaf/25 bg-leaf/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-forest sm:inline-flex">
              Internal CRM
            </span>
          </div>

          <div className="hidden items-center gap-4 lg:flex">
            <Link href="/" className="text-sm font-semibold text-slate transition hover:text-forest">
              Back to site
            </Link>
            <AdminLogoutButton />
          </div>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="grid h-11 w-11 place-items-center rounded-xl border border-cloud bg-cream text-forest transition hover:border-leaf/40 hover:bg-white lg:hidden"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <nav className="mt-3 hidden gap-2 overflow-x-auto pb-1 lg:flex">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link key={link.href} href={link.href} className={navLinkClass(active, "bar")}>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {mobileMenu && mounted ? createPortal(mobileMenu, document.body) : null}
    </header>
  );
}
