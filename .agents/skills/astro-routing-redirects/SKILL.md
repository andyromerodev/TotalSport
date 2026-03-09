---
name: astro-routing-redirects
description: Gestiona rutas nuevas y redirecciones legacy sin romper enlaces compartidos.
user-invokable: true
---

Mantiene compatibilidad de rutas en ALKILO.

## Objetivo
- Rutas oficiales: `/tienda/<slug>/...`
- Legacy: `/coleccion/*`, `/categoria/*` redirigen.

## Flujo
1. Verificar `getStaticPaths` en rutas dinamicas.
2. Confirmar que redirecciones apuntan a tienda/categoria correcta.
3. Validar `BASE_URL` y slash final.
4. Ejecutar `pnpm build` y revisar rutas generadas.

## Reglas
- Nunca romper enlaces antiguos sin redireccion equivalente.
