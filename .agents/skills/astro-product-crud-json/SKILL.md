---
name: astro-product-crud-json
description: Alta, edicion y baja segura de productos en products.json por tiendita.
user-invokable: true
args:
  - name: store_slug
    description: slug de la tiendita
    required: true
  - name: action
    description: add | update | delete
    required: true
---

Gestiona productos dentro de `src/data/stores/<store_slug>/products.json`.

## Flujo
1. Cargar JSON de tienda y validar estructura.
2. `add`: insertar producto completo con contrato minimo.
3. `update`: localizar por `id` y modificar solo campos solicitados.
4. `delete`: eliminar por `id` con confirmacion en salida.
5. Ejecutar `pnpm validate-products`.

## Reglas
- `id` global unico entre todas las tiendas.
- No inventar precios ni variantes si usuario no las dio.
- Conservar formato JSON con indentacion 2 espacios.
