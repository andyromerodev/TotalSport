# Total Sport Catalog (Astro 5)

Catalogo web estatico y rapido para Total Sport, con productos por categoria y sincronizacion de inventario con Nanobot.

## Stack

- Astro 5
- JSON como fuente unica de verdad (`src/data/products.json`)
- Scripts Node para validar datos y sincronizar `SOUL.md`

## Estructura

- `src/data/products.json`: inventario principal
- `src/pages/index.astro`: home + categorias + grid de productos
- `src/pages/productos/[id].astro`: detalle de producto
- `scripts/validate-products.mjs`: valida estructura de productos
- `scripts/sync-soul.mjs`: actualiza bloque de catalogo en SOUL

## Comandos

```bash
pnpm install
pnpm dev
pnpm validate-products
pnpm sync-soul
pnpm build
```

## Variables opcionales

- `PUBLIC_WHATSAPP_NUMBER`: numero para enlaces `wa.me` (solo digitos, ej. `5351234567`)
- `PUBLIC_SITE_URL`: URL publica del sitio para metadatos
- `PUBLIC_BASE_PATH`: base path si publicas en subruta
- `SOUL_PATH`: ruta custom para `SOUL.md` al sincronizar

### Configuracion recomendada

1. Copia `.env.example` a `.env`.
2. Completa al menos:
   - `PUBLIC_WHATSAPP_NUMBER`
   - `PUBLIC_SITE_URL`
3. Para GitHub Pages, crea variables en el repo:
   - `PUBLIC_WHATSAPP_NUMBER`
   - `PUBLIC_SITE_URL` (ejemplo: `https://TU_USUARIO.github.io`)
   - `PUBLIC_BASE_PATH` (vacio para user/org page, o `/<repo>` para project page)

## Flujo operativo recomendado

1. Agrega o edita productos en `src/data/products.json`.
2. Sube fotos a `public/images/` con el nombre esperado en `imageUrl`.
3. Corre `pnpm validate-products`.
4. Corre `pnpm sync-soul` para actualizar `/Users/andy/Documents/nanobot-local/SOUL.md`.
5. Publica en GitHub para desplegar en GitHub Pages.

## Marcadores en SOUL

El script usa estos delimitadores:

- `<!-- CATALOG:START -->`
- `<!-- CATALOG:END -->`

Si no existen, intenta insertar automaticamente el bloque entre `PRODUCTOS DISPONIBLES` y `REGLAS GENERALES`.
