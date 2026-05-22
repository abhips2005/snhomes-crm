import { Suspense } from "react";
import { AdminLoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <AdminLoginForm />
    </Suspense>
  );
}

function LoginFallback() {
  return (
    <main className="grid min-h-[calc(100vh-3rem)] place-items-center px-5 py-8">
      <div className="w-full max-w-5xl rounded-3xl border border-cloud bg-white p-6 shadow-card sm:p-10">
        <div className="h-10 w-48 rounded-lg bg-cream" />
        <div className="mt-8 h-8 w-40 rounded-lg bg-cream" />
        <div className="mt-4 h-28 rounded-lg bg-cream" />
      </div>
    </main>
  );
}
