import Anthropic from "@anthropic-ai/sdk";
import type { ContentBlockParam } from "@anthropic-ai/sdk/resources/messages";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const instructions = `Eres un extractor de información para una app de tarjetas de libros. Recibirás un resumen de texto, una imagen o ambos. Extrae exclusivamente información visible. No inventes datos: si autor, categoría o frase no aparecen, usa null. Genera máximo tres ideas clave y aplicaciones directas para un Project Manager / futuro General Manager de soluciones tecnológicas (infraestructura, cloud, ciberseguridad) que crea contenido en @jaywrkr. La aplicación de vida diaria debe ser una acción concreta para esta semana. La idea de contenido debe ser un post directo y simple. Responde ÚNICAMENTE con JSON válido, sin bloques de código, con estas claves exactas: titulo, autor, categoria, ideas_clave, aplicacion_vida_diaria, aplicacion_contenido, aplicacion_profesional, frase_destacada, nivel_relevancia. nivel_relevancia debe ser alta, media o baja.`;

function parseCard(text: string) {
  const cleaned = text.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
  const json = cleaned.slice(cleaned.indexOf("{"), cleaned.lastIndexOf("}") + 1);
  return JSON.parse(json);
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Falta configurar ANTHROPIC_API_KEY en el servidor." }, { status: 503 });
  }

  try {
    const { text, image } = (await request.json()) as { text?: string; image?: string };
    if (!text?.trim() && !image) {
      return NextResponse.json({ error: "Comparte un resumen o una imagen." }, { status: 400 });
    }

    const content: ContentBlockParam[] = [];
    if (image) {
      const match = image.match(/^data:(image\/(?:jpeg|png|gif|webp));base64,(.+)$/);
      if (!match) return NextResponse.json({ error: "El formato de imagen no es compatible." }, { status: 400 });
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: match[1] as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
          data: match[2],
        },
      });
    }
    if (text?.trim()) content.push({ type: "text", text });

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
      max_tokens: 1400,
      system: instructions,
      messages: [{ role: "user", content }],
    });
    const answer = response.content.find((block) => block.type === "text");
    if (!answer || answer.type !== "text") throw new Error("Claude no devolvió texto.");
    return NextResponse.json(parseCard(answer.text));
  } catch (error) {
    console.error("Book extraction failed", error);
    if (error instanceof Anthropic.APIError) {
      const message = error.status === 401
        ? "Claude rechazó la clave configurada. Revisa ANTHROPIC_API_KEY."
        : error.status === 404
          ? "El modelo configurado no está disponible. Usa claude-sonnet-4-6."
          : error.status === 429
            ? "Claude alcanzó un límite temporal. Inténtalo en unos segundos."
            : "Claude no pudo procesar el material. Inténtalo otra vez.";
      return NextResponse.json({ error: message }, { status: error.status || 502 });
    }
    return NextResponse.json({ error: "No se pudo analizar el material con Claude. Inténtalo otra vez." }, { status: 500 });
  }
}
