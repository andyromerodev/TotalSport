# Clean Architecture + SOLID Refactor — TotalSport

## Contexto

`src/lib/catalog.ts` (119 líneas) hace siete cosas distintas: tipos, imports estáticos de JSON, enriquecimiento de stock, queries del catálogo, construcción de URLs de WhatsApp, slugificación de categorías y helpers de imágenes. Cualquier cambio en una responsabilidad toca el mismo archivo donde viven las demás.

`scripts/admin-data-core.mjs` (339 líneas) mezcla I/O de archivos, lógica de negocio, validación de esquemas y normalización de inputs en un solo módulo.

El refactor introduce capas claras (Domain → Application → Infrastructure → Presentation), aplica SOLID con ejemplos concretos del codebase, y mantiene cada paso verificable con `pnpm build`.

**Restricciones que moldean cada decisión:**
- Astro SSG (`output: 'static'`) — sin DI container en runtime; la composición es module-level
- Sin framework JS (React/Vue) — componentes Astro puros
- Pipeline de build intacto: `validate-products && astro build && validate-home-performance`
- `src/data/public-stock.json` es el único archivo que cruza la frontera público/privado (su path y shape no cambian)
- Rutas fijas por `DEVELOPMENT_RULES.md`

---

## Estructura objetivo

### `src/` — Catálogo público

```
src/
├── domain/
│   ├── catalog.types.ts           # RawProduct, Product, StoreMeta, ProductVariant — solo tipos
│   └── catalog.repository.ts     # ICatalogRepository, IStockRepository — solo interfaces
│
├── application/
│   ├── getStores.ts
│   ├── getStoreProducts.ts
│   ├── getStoreCategories.ts
│   ├── getStoreProductsByCategory.ts
│   ├── getProductById.ts
│   └── getAllProducts.ts
│
├── infrastructure/
│   ├── jsonCatalogRepository.ts   # Implementa ICatalogRepository con imports estáticos de JSON
│   └── jsonStockRepository.ts     # Implementa IStockRepository con public-stock.json
│
├── lib/
│   ├── slugify.ts                 # slugifyCategory()
│   ├── whatsapp.ts                # buildWhatsAppLink()
│   └── productImages.ts           # getProductImages()
│
├── components/, layouts/, pages/, styles/   # sin cambios estructurales
└── data/                                    # sin cambios (archivos JSON intactos)
```

### `scripts/` — Admin panel

```
scripts/
├── domain/
│   ├── inventory.rules.mjs        # applyMovement, computeDashboard, bootstrapFinanceFromCatalog, validate*
│   └── stock.projection.mjs       # buildPublicStock() — sin I/O
│
├── application/
│   ├── registerMovement.mjs
│   ├── getDashboard.mjs
│   ├── getProducts.mjs
│   ├── getLedger.mjs
│   └── exportPublicStock.mjs
│
├── infrastructure/
│   ├── jsonAdminRepository.mjs    # readJson/writeJson, resolve paths, ensureFiles
│   ├── jsonCatalogReader.mjs      # loadCatalogProducts()
│   └── publicStockWriter.mjs      # writeFile wrapper
│
├── lib/
│   ├── assert.mjs
│   ├── money.mjs                  # roundMoney()
│   └── normalize.mjs              # normalizeMovementInput()
│
├── admin-server.mjs               # SOLO routing HTTP + wiring de dependencias
└── admin-panel/                   # sin cambios
```

---

## Principios SOLID aplicados

### SRP — Responsabilidad única

| Antes | Después |
|-------|---------|
| `catalog.ts` hace 7 cosas | 7 archivos con una razón de cambio cada uno |
| `admin-data-core.mjs` hace 5 cosas | `domain/`, `application/`, `infrastructure/`, `lib/` separados |

### OCP — Abierto/Cerrado

`ICatalogRepository` absorbe la variabilidad de la fuente de datos. Agregar una nueva tienda solo toca `jsonCatalogRepository.ts` (el único import estático). Las páginas y use cases no cambian.

```typescript
// src/domain/catalog.repository.ts
export interface ICatalogRepository {
  getStores(): StoreMeta[];
  getProductsByStore(storeSlug: string): Product[];  // ya enriquecido con stock
}

export interface IStockRepository {
  getStockMap(): Map<string, { inStock: boolean; availableQty?: number }>;
}
```

### LSP — Sustitución de Liskov

Tipos separados para raw (JSON) vs enriquecido (entidad de dominio):

```typescript
// src/domain/catalog.types.ts
export type RawProduct = { id, name, category, priceUsd, active, ... };  // shape del JSON
export type Product = RawProduct & { inStock: boolean; availableQty?: number };  // entidad
```

Cualquier `ICatalogRepository` concreto devuelve `Product[]` completamente enriquecido. Nunca más `Omit<>` dispersos.

### ISP — Segregación de interfaces

Las páginas importan solo lo que usan:

```typescript
// pages/productos/[id].astro
import { getProductById } from '../../application/getProductById';
import { getAllProducts } from '../../application/getAllProducts';
import { buildWhatsAppLink } from '../../lib/whatsapp';
import { getProductImages } from '../../lib/productImages';
// NO importa getStores(), slugifyCategory(), etc.
```

En admin, `IAdminReadRepository` e `IAdminWriteRepository` están separados: `getDashboard` solo necesita read, `registerMovement` necesita ambos.

### DIP — Inversión de dependencias

```
pages/[id].astro
  → application/getProductById.ts     (use case — depende de la interfaz)
     → domain/catalog.repository.ts   (interfaz — sin imports externos)
        ← infrastructure/jsonCatalogRepository.ts  (implementación concreta)
```

Pattern de composition root con parámetro default (compatible con Astro SSG):

```typescript
// src/application/getProductById.ts
export function getProductById(
  id: string,
  repo: ICatalogRepository = jsonCatalogRepository  // default = producción; tests pasan stub
): Product | undefined {
  return repo
    .getStores()
    .flatMap((store) => repo.getProductsByStore(store.slug))
    .find((product) => product.id === id);
}
```

---

## Migración — Pasos ordenados y seguros

Cada paso termina con `pnpm build` verde. No hay big-bang.

### Fase 1 — `src/` catálogo público

**1.1** Crear `src/domain/catalog.types.ts` con `RawProduct`, `Product`, `StoreMeta`, `ProductVariant`. Agregar re-exports en `catalog.ts` como shim temporal.

**1.2** Crear `src/lib/slugify.ts`, `whatsapp.ts`, `productImages.ts`. Mover funciones puras. Re-exportar desde `catalog.ts`.

**1.3** Crear `src/domain/catalog.repository.ts` e `src/infrastructure/jsonStockRepository.ts`. Mover `publicStockMap` construction.

**1.4** Crear `src/infrastructure/jsonCatalogRepository.ts`. Mover todos los imports estáticos de JSON y `enrichWithStock()`. `catalog.ts` delega al repositorio.

**1.5** Crear archivos en `src/application/`. Cada use case importa desde el repositorio (interfaz + default concreto). `catalog.ts` delega a los use cases.

**1.6** Actualizar imports en 4 páginas y `ProductCard.astro` para apuntar a los nuevos módulos. Eliminar shims de `catalog.ts`. Eliminar `catalog.ts`.

### Fase 2 — `scripts/` admin panel

**2.1** Crear `scripts/lib/assert.mjs`, `money.mjs`, `normalize.mjs`. Re-exportar desde `admin-data-core.mjs`.

**2.2** Crear `scripts/infrastructure/jsonAdminRepository.mjs` y `jsonCatalogReader.mjs`. Mover todo el I/O.

**2.3** Crear `scripts/domain/inventory.rules.mjs` y `stock.projection.mjs`. Solo lógica pura, sin `fs`.

**2.4** Crear archivos en `scripts/application/`. Cada use case orquesta domain + infrastructure.

**2.5** Refactorizar `admin-server.mjs`: mover `withCatalogMeta` y `filterFinanceRecords` a sus use cases. `handleApi` queda como routing puro.

**2.6** Eliminar `admin-data-core.mjs`.

---

## Archivos críticos

| Archivo | Rol en la migración |
|---------|---------------------|
| `src/lib/catalog.ts` | Punto de partida Fase 1; shim temporal |
| `scripts/admin-data-core.mjs` | Punto de partida Fase 2; shim temporal |
| `scripts/admin-server.mjs` | Limpieza en Fase 2 paso 2.5 (`withCatalogMeta`, `filterFinanceRecords`) |
| `src/pages/productos/[id].astro` | Página más grande (255 líneas); representa el update final de imports |
| `src/components/ProductCard.astro` | Valida la extracción de `lib/` utilities |

---

## Verificación

### Build (cada paso)
```bash
pnpm validate-products
pnpm build   # incluye validate-home-performance
```

### Admin (Fase 2)
```bash
pnpm validate-admin-data
pnpm export-public-stock
pnpm admin:start  # smoke test manual de endpoints
```

### Smoke test admin (post Fase 2)
- [ ] `GET /api/health` → `{ ok: true }`
- [ ] `GET /api/products` → array con `name`, `category`, `inStock`
- [ ] `GET /api/products?store=deportes` → filtrado correcto
- [ ] `GET /api/dashboard` → métricas numéricas
- [ ] `POST /api/movements` SALE válido → 201
- [ ] `POST /api/export-public-stock` → escribe `public-stock.json` y `pnpm build` sigue verde

### Tests unitarios (habilitados por el refactor)
Estos archivos quedan sin dependencias de Node.js/Astro y se pueden testear con `node --test`:
- `scripts/domain/inventory.rules.mjs`
- `scripts/domain/stock.projection.mjs`
- `scripts/lib/normalize.mjs`
- `src/lib/slugify.ts`
- `src/lib/whatsapp.ts`
- `src/application/getProductById.ts` (con stub de repositorio)

---

## Decisiones clave

| Decisión | Razón |
|----------|-------|
| Composition root con parámetro default | Astro SSG hace análisis estático en build; los DI containers dinámicos rompen `getStaticPaths` |
| Shim `catalog.ts` durante la transición | Migración incremental sin riesgo de big-bang; se elimina en el paso final |
| `RawProduct` vs `Product` | Hace explícita la garantía de enriquecimiento; elimina todos los `Omit<>` casts |
| JSDoc types en `scripts/` (no TypeScript) | Los admin scripts son `.mjs` sin paso de compilación; consistente con el estilo actual |
| Shim `admin-data-core.mjs` durante la transición | Los thin orchestrators (`admin-init-data`, `export-public-stock`, `validate-admin-data`) lo importan; se actualiza solo al final |
| Path de `public-stock.json` sin cambios | Cruza la frontera público/privado; cambiarlo requeriría coordinación entre dos repos |
| Zero dependencias nuevas | `package.json` sin cambios |
