---
name: nanobot-soul-sync
description: Sincroniza SOUL.md desde todas las tienditas manteniendo formato estable y delimitadores.
user-invokable: true
---

Ejecuta y valida sync de inventario para Nanobot.

## Flujo
1. Ejecutar `pnpm sync-soul`.
2. Verificar bloque entre `<!-- CATALOG:START -->` y `<!-- CATALOG:END -->`.
3. Confirmar que no se alteran otras secciones de SOUL.
4. Reportar categorias/productos faltantes por tienda.

## Reglas
- No editar manualmente el bloque generado.
- Si falla escritura de SOUL por permisos, reportar causa exacta.
