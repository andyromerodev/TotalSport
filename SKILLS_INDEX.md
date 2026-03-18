# Skills Index (ALKILO)

Guia rapida para saber que skill usar en cada tarea del proyecto.

## 0) Arquitectura y codigo

- `clean-architecture`
  - Usar cuando: agregas una nueva feature, use case, repositorio, componente Vue o UiState.
  - Resultado: implementacion que respeta Domain → Application → Infrastructure → UI, con nombres Android-style y SOLID aplicado.

- `commit-message`
  - Usar cuando: quieres hacer un commit de los cambios actuales.
  - Resultado: commit con mensaje conciso en formato convencional, sin atribuciones de autor ni lineas de co-autor.

## 1) Estructura y escalabilidad

- `astro-store-scaffold`
  - Usar cuando: necesitas crear una nueva tiendita completa.
  - Resultado: estructura de datos, carpeta de imagenes y registro en index.

- `astro-routing-redirects`
  - Usar cuando: cambias rutas, slugs o necesitas mantener compatibilidad legacy.
  - Resultado: rutas estables sin romper links viejos.

## 2) Inventario y datos

- `astro-product-crud-json`
  - Usar cuando: quieres agregar/editar/eliminar productos en una tiendita.
  - Resultado: cambios seguros en JSON con validacion.

- `astro-catalog-validator`
  - Usar cuando: necesitas auditar consistencia global del catalogo.
  - Resultado: reporte de errores/bloqueantes y advertencias.

## 3) Imagenes y rendimiento

- `astro-image-pipeline`
  - Usar cuando: subes imagenes nuevas o cambias galerias.
  - Resultado: URLs correctas, extensiones consistentes, portada + galeria.

- `astro-performance-budget`
  - Usar cuando: quieres optimizar para conexiones lentas.
  - Resultado: recomendaciones de peso/formato/carga por vista.

## 4) SEO y compartir enlaces

- `astro-seo-social-cards`
  - Usar cuando: una pagina no muestra preview correcto en WhatsApp/Facebook/X.
  - Resultado: metadatos OG/Twitter correctos por tienda/producto.

## 5) Operacion con Nanobot

- `nanobot-soul-sync`
  - Usar cuando: actualizas inventario y necesitas sincronizar SOUL.md.
  - Resultado: bloque de catalogo regenerado sin tocar otras reglas.

## 6) Antes de publicar

- `astro-release-checklist`
  - Usar cuando: vas a hacer push/deploy.
  - Resultado: validacion de build/rutas/sync antes de release.

- `astro-lighthouse-guardrail`
  - Usar cuando: quieres evitar regresiones de Lighthouse en Home (LCP/imagenes/cache path).
  - Resultado: validacion anti-regresion con guardrails obligatorios en build.

## 7) UI consistente

- `astro-ui-consistency`
  - Usar cuando: hay cambios visuales en cards, layouts o componentes.
  - Resultado: interfaz coherente con el sistema visual de ALKILO.

## Flujo recomendado por tipo de tarea

- Nueva feature completa (use case + Vue + página):
  1. `clean-architecture`
  2. `astro-release-checklist`

- Nueva tiendita:
  1. `astro-store-scaffold`
  2. `astro-product-crud-json`
  3. `astro-image-pipeline`
  4. `astro-release-checklist`

- Nuevo producto:
  1. `astro-product-crud-json`
  2. `astro-image-pipeline`
  3. `astro-catalog-validator`

- Bug en enlaces/rutas:
  1. `astro-routing-redirects`
  2. `astro-release-checklist`

- Bug en preview de WhatsApp:
  1. `astro-seo-social-cards`
  2. `astro-release-checklist`

- Cambios visuales:
  1. `astro-ui-consistency`
  2. `astro-performance-budget`
  3. `astro-release-checklist`
