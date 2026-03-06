# ALKILO Catalog (Astro 5)

Catalogo web estatico para ALKILO organizado por tienditas independientes.

## Estructura por tiendita

- `src/data/stores/index.json`: metadatos de tienditas
- `src/data/stores/<slug>/products.json`: inventario de cada tiendita
- `public/images/stores/<slug>/`: imagenes de cada tiendita
- `src/pages/tienda/[store].astro`: entrada de cada tiendita
- `src/pages/tienda/[store]/categoria/[category].astro`: categoria dentro de la tiendita
- `src/pages/productos/[id].astro`: detalle de producto (global)

## Comandos

```bash
pnpm install
pnpm dev
pnpm validate-products
pnpm sync-soul
pnpm build
```

Comando de migracion (una sola vez):

```bash
pnpm migrate-stores
```

## Modelo de producto

Campos por producto en cada `products.json`:

- `id`, `name`, `category`, `priceUsd`, `active`
- opcionales: `description`, `variants`, `imageUrl`, `images`, `aliases`

## Variables opcionales

- `PUBLIC_WHATSAPP_NUMBER`: numero para enlaces `wa.me` (solo digitos)
- `PUBLIC_SITE_URL`: URL publica del sitio
- `PUBLIC_BASE_PATH`: base path del sitio
- `SOUL_PATH`: ruta custom para `SOUL.md`

## Flujo recomendado

1. Edita inventario en `src/data/stores/<slug>/products.json`.
2. Sube imagenes en `public/images/stores/<slug>/`.
3. Ejecuta `pnpm validate-products`.
4. Ejecuta `pnpm sync-soul` para actualizar `/Users/andy/Documents/nanobot-local/SOUL.md`.
5. Publica con push a GitHub.

## Compatibilidad

- `src/data/products.json` quedo marcado como deprecado.
- Rutas legacy `/coleccion/...` y `/categoria/...` redirigen a `/tienda/...`.

## Marcadores en SOUL

El sync usa:

- `<!-- CATALOG:START -->`
- `<!-- CATALOG:END -->`
