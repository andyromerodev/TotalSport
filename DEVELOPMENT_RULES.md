# Reglas De Desarrollo Estable (ALKILO)

Estas reglas son obligatorias para mantener el sitio estable, escalable y facil de mantener.

## 1) Estructura por tiendita (obligatorio)
- Cada tiendita debe vivir en `src/data/stores/<slug>/products.json`.
- Cada tiendita debe tener su carpeta de imagenes en `public/images/stores/<slug>/`.
- Toda nueva tiendita debe registrarse en `src/data/stores/index.json`.
- No volver a usar `src/data/products.json` como fuente principal.

## 2) Contrato de producto (obligatorio)
- Campos minimos: `id`, `name`, `category`, `priceUsd`, `active`.
- Campos opcionales: `description`, `variants`, `imageUrl`, `images`, `aliases`.
- `id` debe ser unico global (entre todas las tienditas).
- `priceUsd` debe ser numero mayor o igual a 0.

## 3) Imagenes y URLs
- Guardar imagenes con nombres consistentes y en ASCII.
- Usar URLs `raw.githubusercontent.com` apuntando al archivo real.
- Si hay varias fotos, usar `images[]`; `imageUrl` debe ser portada.
- No dejar extensiones incorrectas (`.jpg` vs `.png` vs `.webp`).

## 4) Rutas y navegación
- Rutas oficiales:
  - `/`
  - `/tienda/<slug>/`
  - `/tienda/<slug>/categoria/<category-slug>/`
  - `/productos/<id>/`
- Mantener redirecciones legacy (`/coleccion/*`, `/categoria/*`) hacia `/tienda/*`.
- Las tienditas se acceden desde cards de Home; no exponer selector de tienda en vistas internas.

## 5) Branding y UX
- El nombre del sitio es `ALKILO`.
- El texto/logo `ALKILO` siempre debe llevar al Home.
- Mantener diseño responsive y enfoque de carga rapida.
- Mantener efecto blur-up en imagenes clave durante carga.

## 6) Calidad antes de push
- Antes de cada push ejecutar siempre:
  - `pnpm validate-products`
  - `pnpm build`
- Si alguno falla, no hacer merge/push a `main`.

## 7) Sincronización con SOUL
- Cambios de inventario deben sincronizarse con:
  - `pnpm sync-soul`
- No editar manualmente el bloque entre `<!-- CATALOG:START -->` y `<!-- CATALOG:END -->`.

## 8) Compatibilidad y cambios grandes
- No romper rutas existentes sin añadir redirección.
- No eliminar campos de producto sin migración explícita.
- Para cambios estructurales, crear script de migración y backup.

## 9) Git y despliegue
- Commits pequenos y descriptivos.
- No mezclar cambios de datos, UI y scripts en un commit sin necesidad.
- Verificar GitHub Pages despues de cada deploy importante.

## 10) Regla de oro
- Si una mejora compromete estabilidad, priorizar estabilidad.
