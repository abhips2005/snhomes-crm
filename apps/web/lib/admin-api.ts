import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";

export async function requireAdminRoute() {
  const auth = await getAuthenticatedAdmin();
  if (!auth) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized admin request" }, { status: 401 })
    };
  }
  return {
    ok: true as const,
    admin: auth.admin
  };
}

function mergeQuery(targetPath: string, key: string, value: string) {
  const [path, query = ""] = targetPath.split("?");
  const params = new URLSearchParams(query);
  params.set(key, value);
  return `${path}?${params.toString()}`;
}

export function redirectWithStatus(request: Request, redirectPath: string | null | undefined, fallbackPath: string, status: "ok" | "error", detail?: string) {
  const base = redirectPath && redirectPath.startsWith("/") ? redirectPath : fallbackPath;
  const withStatus = mergeQuery(base, status, "1");
  const withDetail = detail ? mergeQuery(withStatus, "detail", detail) : withStatus;
  return NextResponse.redirect(new URL(withDetail, request.url), 303);
}

export function parseFormData<T>(schema: z.ZodSchema<T>, formData: FormData) {
  const raw: Record<string, string> = {};
  formData.forEach((value, key) => {
    raw[key] = String(value);
  });
  return schema.safeParse(raw);
}
