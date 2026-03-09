---
name: astro-catalog-validator
description: Ejecuta validaciones integrales del catalogo multi-tienda y reporta hallazgos accionables.
user-invokable: true
---

Valida integridad del catalogo sin mutar datos.

## Chequeos
1. `pnpm validate-products`.
2. IDs duplicados globales.
3. Tiendas sin `products.json` o vacias.
4. URLs de imagen no resolubles por nombre/extensiones locales.
5. Categorias huérfanas o inconsistentes por tienda.

## Salida
- Reporte corto por severidad: bloqueante, advertencia, mejora.
- Ruta exacta y `id` afectado.
