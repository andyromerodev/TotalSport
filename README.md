# ALKILO Catalog (Astro 5)

Catalogo web estatico para ALKILO organizado por tienditas independientes.

Reglas de estabilidad del desarrollo:

- `DEVELOPMENT_RULES.md`

Indice de skills del proyecto:

- `SKILLS_INDEX.md`

## Estructura por tiendita

- `src/data/stores/index.json`: metadatos de tienditas
- `src/data/stores/<slug>/products.json`: inventario de cada tiendita
- `src/data/public-stock.json`: proyeccion publica de stock (sin costos/ganancias)
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

# Admin privado local
pnpm admin:init-data
pnpm admin:start
pnpm validate-admin-data
pnpm export-public-stock
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
- `ADMIN_DATA_PATH`: ruta al repo/carpeta privada (`../totalsport-admin-data` por defecto)
- `ADMIN_PORT`: puerto del panel local (por defecto `4310`)

## Admin privado local (inventario y contabilidad)

Objetivo: mantener costos, ventas y ganancia fuera del repo publico.

Archivos esperados en `ADMIN_DATA_PATH`:

- `products-finance.json`: costo, precio de venta, stock actual, unidades vendidas, ingresos y ganancia por producto.
- `inventory-ledger.json`: historial de movimientos (`ENTRY`, `EXIT`, `ADJUSTMENT`, `SALE`).

Flujo recomendado:

1. Crea o clona tu repo privado para datos (ej: `../totalsport-admin-data`).
2. Ejecuta `pnpm admin:init-data` para bootstrap de `products-finance.json` e `inventory-ledger.json`.
3. Ejecuta `pnpm admin:start` y abre `http://127.0.0.1:4310`.
4. Registra movimientos de inventario/ventas en el panel.
5. Ejecuta `pnpm export-public-stock` (o usa el boton del panel) para actualizar `src/data/public-stock.json`.
6. Haz commit/push solo del repo publico con datos sanitizados.

El export publico incluye solo:

- `productId`, `inStock`, `availableQty`, `updatedAt`

No exporta:

- `costUsd`, `profitUsd`, `revenueUsd`, historial de ventas o notas internas.

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
