---
name: astro-lighthouse-guardrail
description: Mantiene el puntaje de Lighthouse en Home con validaciones obligatorias de LCP/imagenes y reglas anti-regresion.
user-invokable: true
---

Aplica y valida guardrails de rendimiento para evitar regresiones en Lighthouse.

## Cuando usar
- Antes de push/deploy si hubo cambios en Home, imagenes o layout.
- Cuando el score de Performance baje y quieras identificar causa rapida.
- Cuando se agreguen nuevas portadas o cambie la estrategia de carga de imagen.

## Flujo
1. Ejecutar `pnpm build` (incluye validacion de performance de Home).
2. Si falla, revisar `scripts/validate-home-performance.mjs` y corregir:
   - `loading=\"eager\"` + `fetchpriority=\"high\"` en la primera portada.
   - `srcset` responsivo en WebP para `store-cover`.
   - evitar `.jpg/.jpeg` en portadas de Home.
3. Confirmar que no se rompan validaciones de catalogo (`pnpm validate-products`).
4. Publicar solo cuando build y guardrail pasen.

## Reglas anti-regresion
- No mezclar cambios que aumenten peso de portadas sin nueva optimizacion.
- Mantener Home con imagenes responsivas y formato moderno.
- Si se cambian nombres/paths de portadas, actualizar la fuente en Home y revalidar build.

## Comandos utiles
```bash
pnpm build
node scripts/validate-home-performance.mjs
pnpm validate-products
```
