# Ideas Futuras Para El Catalogo (ALKILO)

## 1) Panel admin real
- Subir imagenes, editar productos por tiendita y publicar con un click.

## 2) Busqueda global
- Buscar por nombre, alias, categoria y tienda.

## 3) Filtros avanzados
- Filtrar por precio, talla, color y disponibilidad.

## 4) Estado de stock
- Manejar estados `disponible`, `agotado`, `reserva` por producto.

## 5) Variantes con precio propio
- Permitir que talla/color/modelo tenga precio distinto.

## 6) Landing por tienda
- Portada personalizada para cada tiendita.

## 7) Optimizacion de imagenes
- Conversion automatica a WebP/AVIF y placeholders livianos.

## 8) SEO avanzado
- Sitemap, datos estructurados de producto y metadatos por tienda/categoria.

## 9) Analytics
- Medir tiendas/productos con mas vistas y mas clics a WhatsApp.

## 10) Integracion con Nanobot
- Generar respuestas con links directos al producto y su imagen principal.

## 11) Alertas de stock minimo por producto
- Definir `minStock` por producto y marcar alerta cuando `availableQty <= minStock`.
- Mostrar prioridad visual en panel admin para evitar quiebres de inventario.

## 12) Reporte automatico diario/semanal
- Generar resumen en `JSON` o `MD` con ventas, ganancia, agotados y productos criticos.
- Facilitar revision rapida y seguimiento operativo.

## 13) Historial con filtros avanzados y exportacion CSV
- Filtrar movimientos por tipo, producto, tienda y rango de fechas.
- Exportar resultados para analisis externo o respaldo.

## 14) Costeo por lotes (FIFO o promedio)
- Registrar costo por entrada/lote para mejorar precision de ganancia.
- Comparar enfoque FIFO vs costo promedio y definir estandar.

## 15) Devoluciones y cancelaciones
- Agregar tipo de movimiento para revertir ventas sin romper metricas.
- Mantener trazabilidad de ajustes por devolucion.

## 16) Auditoria de cambios
- Guardar `who/when/what` por cada movimiento administrativo.
- Mejorar trazabilidad y control de modificaciones en inventario/finanzas.

## 17) Backup automatico del repo privado
- Programar respaldo periodico de `products-finance.json` e `inventory-ledger.json`.
- Incluir verificacion de integridad y restauracion basica.

## 18) Panel de tendencias
- Visualizar rotacion por producto, top vendidos, margen por tienda y por categoria.
- Facilitar decisiones de reposicion y priorizacion comercial.
