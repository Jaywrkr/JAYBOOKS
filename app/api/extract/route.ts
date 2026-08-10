import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const schema = {
  type: "object",
  additionalProperties: false,
  required: [
    "titulo",
    "autor",
    "categoria",
    "ideas_clave",
    "aplicacion_vida_diaria",
    "aplicacion_contenido",
    "aplicacion_profesional",
    "frase_destacada",
    "nivel_relevancia",
  ],
  properties: {
    titulo: { type: "string" },
    autor: { type: ["string", "null"] },
    categoria: { type: ["string", "null"] },
    ideas_clave: { type: "array", items: { type: "string" }, maxItems: 3 },
    aplicacion_vida_diaria: { type: "string" },
    aplicacion_contenido: { type: "string" },
    aplicacion_profesional: { type: "string" },
    frase_destacada: { type: ["string", "null"] },
    nivel_relevancia: { type: "string", enum: ["alta", "media", "baja"] },
  },
};

const instructions = `Eres un extractor de información para una app de tarjetas de libros. Recibirás un resumen de texto, una imagen o ambos. Extrae exclusivamente información visible. No inventes datos: si autor, categoría o frase no aparecen, usa null. Genera máximo tres ideas clave y aplicaciones directas para un Project Manager / futuro General Manager de soluciones tecnológicas (infraestructura, cloud, ciberseguridad) que crea contenido en @jaywrkr. La aplicación de vida diaria debe ser una acción concreta para esta semana. La idea de contenido debe ser un post directo y simple. Responde en el formato JSON solicitado.`;

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "Falta configurar OPENAI_API_KEY en el servidor." }, { status: 503 });
  }

  try {
    const { text, image } = (await request.json()) as { text?: string; image?: string };
    if (!text?.trim() && !image) {
      return NextResponse.json({ error: "Comparte un resumen o una imagen." }, { status: 400 });
    }

    const content: Array<{ type: "input_text"; text: string } | { type: "input_image"; image_url: string; detail: "high" }> = [];
    if (text?.trim()) content.push({ type: "input_text", text });
    if (image) content.push({ type: "input_image", image_url: image, detail: "high" });

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5",
      instructions,
      input: [{ role: "user", content }],
      text: { format: { type: "json_schema", name: "book_card", strict: true, schema } },
    });

    return NextResponse.json(JSON.parse(response.output_text));
  } catch (error) {
    console.error("Book extraction failed", error);
    return NextResponse.json({ error: "No se pudo analizar el material. Inténtalo otra vez." }, { status: 500 });
  }
}
