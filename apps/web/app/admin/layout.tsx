"use client";

import { AdminNav } from "@/components/admin-nav";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  return (
    <main className="crm-shell">
      {!isLoginPage ? <AdminNav /> : null}
      <section className="page-wrap py-8">
        {isLoginPage ? children : <div className="space-y-6">{children}</div>}
      </section>
    </main>
  );
}
