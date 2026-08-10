# JAYBOOKS

Biblioteca personal de tarjetas de libros para Jay. Pega un resumen o sube una imagen: la app extrae las ideas, genera aplicaciones para vida, contenido y trabajo, y guarda cada tarjeta en el navegador.

## Ejecutar localmente

1. Copia `.env.example` a `.env.local` y añade `ANTHROPIC_API_KEY`.
2. Ejecuta `npm install`.
3. Ejecuta `npm run dev`.

## Desplegar en Vercel

Importa el repositorio en Vercel y agrega `ANTHROPIC_API_KEY` (y opcionalmente `ANTHROPIC_MODEL`) en **Project Settings → Environment Variables**. Los libros se guardan actualmente en el almacenamiento local de cada navegador; conectar una base de datos como Supabase es el siguiente paso si se requiere una biblioteca compartida o multidispositivo.
