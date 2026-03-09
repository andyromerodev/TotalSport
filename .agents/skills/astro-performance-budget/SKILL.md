---
name: astro-performance-budget
description: Aplica presupuesto de rendimiento para imagenes y render de catalogo en conexiones lentas.
user-invokable: true
---

Optimiza tiempo de carga con foco en Cuba/3G.

## Chequeos
1. Tamaño y formato de imagenes por tienda.
2. Numero de imagenes cargadas por vista.
3. Uso de lazy loading y blur-up.
4. Render por tienda/categoria (evitar sobrecarga inicial).

## Acciones
- Recomendar compresion, recorte y formatos.
- Señalar outliers de peso.
- Validar que Home solo cargue lo necesario.
