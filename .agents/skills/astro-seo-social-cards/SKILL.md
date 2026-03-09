---
name: astro-seo-social-cards
description: Mejora SEO y previsualizacion social (WhatsApp/Facebook/Twitter) por tienda y producto.
user-invokable: true
---

Asegura metadatos correctos para compartir enlaces.

## Flujo
1. Verificar `title`, `description`, `og:*`, `twitter:*` en `MainLayout`.
2. En detalles de producto, usar imagen principal como `og:image`.
3. Validar canonical y `PUBLIC_SITE_URL`.
4. Reportar URLs que no tendrian preview.

## Reglas
- No usar imagenes privadas ni rutas relativas en meta social.
- Priorizar imagenes de alta calidad y carga estable.
