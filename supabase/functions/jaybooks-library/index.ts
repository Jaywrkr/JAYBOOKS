import { createClient } from "jsr:@supabase/supabase-js@2";

const ACCESS_CODE = "1897";
const JSON_HEADERS = { "Content-Type": "application/json" };

function response(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: JSON_HEADERS });
}

function getServiceKey() {
  const legacyKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacyKey) return legacyKey;

  const secretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (!secretKeys) return null;

  try {
    const keys = JSON.parse(secretKeys) as Record<string, string>;
    return Object.values(keys)[0] ?? null;
  } catch {
    return null;
  }
}

function isBookCard(value: unknown): value is { id: string; createdAt?: string } {
  return Boolean(value && typeof value === "object" && typeof (value as { id?: unknown }).id === "string");
}

Deno.serve(async (request) => {
  const url = new URL(request.url);
  const body = request.method === "GET" ? null : await request.json().catch(() => null);
  const accessCode = request.headers.get("x-jaybooks-pin") ?? url.searchParams.get("pin") ?? (body as { pin?: string } | null)?.pin;
  if (accessCode !== ACCESS_CODE) return response({ error: "Código de acceso incorrecto." }, 401);

  const projectUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = getServiceKey();
  if (!projectUrl || !serviceKey) return response({ error: "La biblioteca no está configurada." }, 500);

  const supabase = createClient(projectUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  if (request.method === "GET") {
    const { data, error } = await supabase.from("jaybooks_cards").select("id, card, created_at").order("created_at", { ascending: false });
    if (error) return response({ error: "No se pudo cargar la biblioteca." }, 500);
    const books = data.map(({ id, card, created_at }) => ({ ...(card as Record<string, unknown>), id, createdAt: (card as { createdAt?: string }).createdAt ?? created_at }));
    return response({ books });
  }

  if (request.method === "POST") {
    const book = (body as { book?: unknown } | null)?.book;
    if (!isBookCard(book)) return response({ error: "Tarjeta inválida." }, 400);
    const { error } = await supabase.from("jaybooks_cards").insert({ id: book.id, card: book });
    if (error) return response({ error: "No se pudo guardar la tarjeta." }, 500);
    return response({ book }, 201);
  }

  if (request.method === "DELETE") {
    const id = url.searchParams.get("id");
    if (!id) return response({ error: "Falta el identificador de la tarjeta." }, 400);
    const { error } = await supabase.from("jaybooks_cards").delete().eq("id", id);
    if (error) return response({ error: "No se pudo eliminar la tarjeta." }, 500);
    return response({ ok: true });
  }

  return response({ error: "Método no permitido." }, 405);
});
