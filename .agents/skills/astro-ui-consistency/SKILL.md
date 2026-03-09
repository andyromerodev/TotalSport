---
name: astro-ui-consistency
description: Mantiene consistencia visual de componentes y patrones UI del catalogo.
user-invokable: true
---

Aplica reglas de consistencia de UI.

## Reglas visuales
1. Tipografia y espaciado segun `src/styles/global.css`.
2. Cards con jerarquia clara y CTAs consistentes.
3. Imagenes con blur-up en carga (`data-blur-up`).
4. Navegacion estable por tiendita/categoria.
5. Responsive sin romper diseño movil.

## Flujo
1. Revisar componentes modificados.
2. Detectar desviaciones de estilo.
3. Proponer/ejecutar ajustes minimos para unificar.
4. Validar con `pnpm build`.
