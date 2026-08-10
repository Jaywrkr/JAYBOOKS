# Handoff técnico de JAYBOOKS

Documento para retomar este proyecto en otra sesión.

## Estado actual

La aplicación está desplegada y operativa en https://jaybooks.vercel.app.

| Área | Estado |
| --- | --- |
| Interfaz minimalista con Geist Mono | Lista |
| Extracción de texto e imágenes con Claude | Lista, depende de clave Anthropic válida |
| Persistencia multidispositivo | Lista con Supabase |
| Acceso sin correo | Código de prueba `1897` |
| Crear, consultar, editar y eliminar tarjetas | Listo |
| Migración de tarjetas antiguas de navegador | Lista, se realiza al primer acceso |

Último commit publicado: `e7b778a Allow editing book titles and authors`.

## Uso de la app

1. Abrir https://jaybooks.vercel.app.
2. Ingresar `1897`.
3. Pegar un resumen o subir una imagen.
4. Crear la tarjeta.
5. Hacer clic sobre una tarjeta para ver el detalle.
6. Elegir **Editar** para corregir el título o autor y pulsar **Guardar**.

Los cambios se escriben en Supabase y sobreviven a recargas, cambio de navegador y cambio de dispositivo.

## Estructura relevante

```text
app/
  api/extract/route.ts       # Llamada a Anthropic y validación del JSON
  api/books/route.ts         # Proxy hacia la función de Supabase
  components/book-library.tsx# Acceso, lista, alta, baja, actualización y migración local
  components/book-form.tsx   # Entrada de texto/imagen y extracción
  components/book-detail.tsx # Detalle y edición de título/autor
  globals.css                # Estilos de la interfaz
  types.ts                   # BookInsight y BookCard
supabase/functions/jaybooks-library/index.ts
                              # Backend persistente de tarjetas
```

## Datos y seguridad

### Supabase

- Proyecto: `hfttsiwhkfpkavvhhlss`.
- Tabla: `public.jaybooks_cards`.
- Campos: `id` (UUID), `card` (JSONB), `created_at`.
- RLS: activado.
- Políticas públicas: ninguna, intencionalmente. El linter muestra el aviso informativo `rls_enabled_no_policy` por este diseño cerrado.
- Edge Function: `jaybooks-library`, versión 2 al momento de escribir este documento.
- La función valida el encabezado `x-jaybooks-pin` y admite `GET`, `POST`, `PATCH` y `DELETE`.

No hay claves de servicio de Supabase en el frontend ni en Vercel. La función usa las variables internas disponibles dentro de Supabase.

### Anthropic

- Variable obligatoria en Vercel: `ANTHROPIC_API_KEY`.
- Modelo por defecto del código: `claude-sonnet-4-6`.
- Si existe `ANTHROPIC_MODEL` en Vercel, sobrescribe el valor por defecto.

Pendiente conocido: hubo registros de error porque la variable de Vercel tenía el modelo antiguo `claude-sonnet-4-20250514`. Si la extracción falla con un mensaje de modelo no disponible, actualizar o eliminar `ANTHROPIC_MODEL` en Vercel para usar `claude-sonnet-4-6`.

## Despliegue y verificación

El repositorio no debe contener secretos. Después de cambios:

```bash
npx tsc --noEmit --incremental false
git add <archivos>
git commit -m "descripción"
git push origin master
```

Luego desplegar en Vercel como producción. En esta instalación el proyecto se ha publicado mediante el conector de Vercel, cargando los archivos fuente explícitamente. Confirmar que el alias final siga siendo `jaybooks.vercel.app`.

Pruebas mínimas:

1. Cargar la página y comprobar que aparece el acceso privado.
2. Consultar `GET /api/books` con el encabezado `x-jaybooks-pin: 1897`.
3. Crear una tarjeta, editar título/autor, recargar y confirmar que el cambio permanece.
4. Revisar los logs de Vercel para `/api/extract` y `/api/books`.

## Decisiones y límites actuales

- El PIN `1897` es deliberadamente simple porque la aplicación es una prueba personal. No es suficiente para un uso público.
- Las tarjetas guardan el contenido estructurado de la ficha. La imagen original se usa para la extracción y no se persiste como portada, para evitar guardar datos Base64 grandes en la tabla.
- Para una versión pública se recomienda: Supabase Auth, usuarios por tarjeta, políticas RLS por propietario y Supabase Storage para portadas.
- El comando completo `npm run build` ha sido lento en este equipo; `npx tsc --noEmit --incremental false` y ESLint de componentes se han usado como chequeos locales. Los despliegues de Vercel finalizaron correctamente.

## Historial reciente

- `e7b778a`: edición persistente de título y autor.
- `b44c858`: migración de tarjetas guardadas anteriormente en el navegador.
- `29a8413`: Supabase, Edge Function, código de acceso y persistencia.
- `ef1e4c3`: modelo por defecto actualizado a Claude Sonnet 4.6.
- `a395b5d`: simplificación visual lineal de la biblioteca.
