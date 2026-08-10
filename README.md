# JAYBOOKS

Biblioteca personal de tarjetas de libros para Jay. Convierte un resumen escrito o una imagen en una ficha estructurada con Claude y la guarda de forma persistente en Supabase.

## Qué hace

- Recibe texto, una imagen o ambos y crea una tarjeta de libro con Claude.
- Muestra una biblioteca minimalista, buscable y con ficha de detalle.
- Permite editar el título y el autor de una tarjeta ya creada.
- Guarda, actualiza y elimina tarjetas en Supabase; no depende de `localStorage`.
- Protege la biblioteca de prueba con el código `1897`, sin correo ni cuenta.
- Migra automáticamente las tarjetas antiguas de `localStorage` cuando se entra por primera vez con el código.

## Ejecutar localmente

1. Copia `.env.example` como `.env.local`.
2. Añade una clave válida de Anthropic en `ANTHROPIC_API_KEY`.
3. Ejecuta `npm install`.
4. Ejecuta `npm run dev`.
5. Abre `http://localhost:3000` e ingresa el código `1897`.

## Variables de entorno

```bash
ANTHROPIC_API_KEY=tu_clave_de_anthropic
ANTHROPIC_MODEL=claude-sonnet-4-6
```

`ANTHROPIC_MODEL` es opcional, pero si existe en Vercel debe contener un modelo disponible. La app usa `claude-sonnet-4-6` como valor por defecto.

Nunca publiques ni guardes claves reales en Git.

## Arquitectura

```text
Navegador
  ├─ /api/extract → Anthropic Claude → tarjeta estructurada
  └─ /api/books → Supabase Edge Function → public.jaybooks_cards
```

- `app/api/extract/route.ts`: extracción con Claude.
- `app/api/books/route.ts`: proxy del servidor hacia Supabase; evita exponer credenciales de base de datos.
- `supabase/functions/jaybooks-library/index.ts`: valida el código y realiza GET, POST, PATCH y DELETE sobre las tarjetas.
- `public.jaybooks_cards`: tabla con RLS activado y sin políticas públicas. Solo la Edge Function, usando la clave de servicio interna de Supabase, puede acceder.

El código de prueba no equivale a autenticación de producción. Para compartir la app con otras personas se debe reemplazar por un sistema de usuarios real.

## Despliegue

- Repositorio: https://github.com/Jaywrkr/JAYBOOKS
- Producción: https://jaybooks.vercel.app
- Base de datos: proyecto Supabase `hfttsiwhkfpkavvhhlss`.

En Vercel se necesita `ANTHROPIC_API_KEY`. La persistencia no requiere variables adicionales de Vercel porque la ruta de servidor se comunica con la Edge Function de Supabase.

Ver [HANDOFF.md](./HANDOFF.md) para el estado técnico completo y cómo retomar el trabajo.
