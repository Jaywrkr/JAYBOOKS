import { NextResponse } from "next/server";

const LIBRARY_URL = process.env.JAYBOOKS_LIBRARY_FUNCTION_URL ?? "https://hfttsiwhkfpkavvhhlss.supabase.co/functions/v1/jaybooks-library";

async function forward(request: Request) {
  const requestUrl = new URL(request.url);
  const body = request.method === "GET" ? undefined : await request.text();
  try {
    const upstream = await fetch(`${LIBRARY_URL}${requestUrl.search}`, {
      method: request.method,
      headers: { "Content-Type": "application/json", "x-jaybooks-pin": request.headers.get("x-jaybooks-pin") ?? "" },
      body,
      cache: "no-store",
    });
    return new NextResponse(upstream.body, { status: upstream.status, headers: { "Content-Type": "application/json" } });
  } catch {
    return NextResponse.json({ error: "No se pudo conectar con la biblioteca." }, { status: 503 });
  }
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
export const DELETE = forward;
