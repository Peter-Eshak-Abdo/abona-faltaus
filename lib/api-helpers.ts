import { NextResponse } from "next/server";

export function apiError(message: string, status = 500) {
  console.error(`[API Error ${status}]:`, message);
  return NextResponse.json({ error: message }, { status });
}

export function requireAuth(user: any) {
  if (!user) throw new Error("UNAUTHORIZED");
}

export function requireAdmin(user: any) {
  if (!user || user.email !== process.env.NEXT_PUBLIC_GMAIL) {
    throw new Error("FORBIDDEN");
  }
}

// Wrapper لكل API Route لمعالجة الأخطاء الموحدة
export async function withErrorHandling(
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return apiError("Unauthorized", 401);
    if (err.message === "FORBIDDEN") return apiError("Forbidden", 403);
    if (err.message === "NOT_FOUND") return apiError("Not Found", 404);
    return apiError(err.message || "Internal Server Error", 500);
  }
}
