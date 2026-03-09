---
name: astro-image-pipeline
description: Pipeline para asociar imagenes de producto (portada + galeria) y corregir extensiones/urls.
user-invokable: true
args:
  - name: store_slug
    description: slug de la tienda destino
    required: true
  - name: product_id
    description: id del producto
    required: true
---

Administra imagenes para un producto de una tiendita.

## Flujo
1. Verificar archivos en `public/images/stores/<store_slug>/`.
2. Ordenar portada y galeria (`imageUrl` + `images[]`).
3. Corregir extensiones mal referenciadas (`.jpg`, `.png`, `.webp`).
4. Actualizar URLs raw en `products.json`.
5. Ejecutar `pnpm validate-products`.

## Reglas
- Siempre usar URLs `raw.githubusercontent.com` validas.
- No dejar `images[]` vacio si se declara.
- Priorizar nombres estables basados en `product_id`.
