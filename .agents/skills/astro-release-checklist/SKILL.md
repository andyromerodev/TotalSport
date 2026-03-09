---
name: astro-release-checklist
description: Checklist de pre-release para ALKILO antes de push/deploy.
user-invokable: true
---

Checklist minimo obligatorio.

## Pasos
1. `pnpm validate-products`
2. `pnpm build`
3. Verificar rutas clave:
   - `/`
   - `/tienda/deportes/`
   - una categoria por tienda
   - un detalle de producto
4. Verificar previews sociales de un producto compartible.
5. Si hubo cambios de inventario: `pnpm sync-soul`.
6. Revisar `git status` limpio o cambios intencionales.

## Salida
- Aprobado o bloqueado con lista breve de pendientes.
