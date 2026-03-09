---
name: astro-store-scaffold
description: Crea una nueva tiendita en ALKILO con estructura de datos, imagenes y rutas base.
user-invokable: true
args:
  - name: store_slug
    description: slug de la tiendita (ej. belleza)
    required: true
  - name: store_title
    description: nombre visible de la tiendita
    required: true
---

Crea una nueva tiendita siguiendo la arquitectura actual.

## Pasos
1. Crear `src/data/stores/<store_slug>/products.json` con `[]`.
2. Crear carpeta `public/images/stores/<store_slug>/`.
3. Agregar entrada en `src/data/stores/index.json` con `slug`, `title`, `description`.
4. Verificar que las rutas dinamicas `/tienda/<store_slug>/` y `/tienda/<store_slug>/categoria/...` se generen.
5. Ejecutar `pnpm validate-products` y `pnpm build`.

## Reglas
- No tocar otras tienditas.
- Mantener slugs en minusculas y con guion.
- Si falta descripcion, usar una temporal clara y luego actualizar.
