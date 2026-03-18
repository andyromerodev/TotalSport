## Design Context

### — Catalogo Publico —

### Users
Clientes compradores que buscan productos para adquirir y contactar por WhatsApp.
Contexto: navegacion desde mobile, busqueda rapida por tiendita o categoria, decision de compra en pocos pasos.
Trabajo a resolver: encontrar el producto correcto con precio y disponibilidad visible, y llegar al WhatsApp sin friccion.
Emocion objetivo: confianza, cercania y facilidad.

### Brand Personality
Tono: fresco, cercano y confiable.
Personalidad en 3 palabras: fresco, cercano, confiable.
Cada tiendita tiene personalidad propia a traves de su tema de color (--store-accent, --store-soft, --store-kicker).

### Aesthetic Direction
Direccion visual: light, aireado y orientado a imagenes de producto, con jerarquia clara precio > nombre > acciones.
Tokens establecidos: --brand #0a7f52, --bg #f6f8f7, --surface #fff, --radius 16px, fuente Sora/Manrope.
Sistema de temas: cada tiendita sobrescribe --store-accent y --store-soft para identidad propia.
Anti-referencias: oscuro/neon, glassmorphism, layouts densos que oculten la imagen del producto.
Modo oscuro: tokens deben prepararse para dark mode futuro (usar variables CSS en todo, nunca colores hardcoded).

### Design Principles
1. La imagen del producto es protagonista — el layout sirve a la fotografia, no al reves.
2. Precio y disponibilidad visibles de un vistazo — sin necesidad de abrir el detalle.
3. Camino al WhatsApp sin friccion — CTA primario siempre visible en card y detalle.
4. Temas por tiendita para identidad propia — usar variables CSS, no clases por tienda.
5. Mobile-first — la mayoria de clientes llega desde WhatsApp en celular.
6. Cumplir WCAG 2.1 AA (contraste, foco visible, alt text en imagenes de producto).

---

### — Panel Admin (uso interno) —

### Users
El panel admin es de uso personal (solo 1 usuario: propietario/operador).
Contexto principal: gestion diaria de inventario, ventas y consulta de ganancia sin friccion.
Trabajo a resolver: registrar movimientos rapido, evitar errores de stock y tener lectura clara del estado financiero.

### Brand Personality
Tono: sereno, confiable y directo.
Emocion objetivo: calma operativa y sensacion de control.
Personalidad en 3 palabras: claro, estable, preciso.

### Aesthetic Direction
Direccion visual: interfaz light, limpia y profesional, con jerarquia tipografica clara y contraste suficiente.
Referencias: dashboards administrativos sobrios con densidad media de informacion y tablas legibles.
Anti-referencias: dark neon, glassmorphism excesivo, cards ruidosas o estilos decorativos que distraigan de la operacion.

### Design Principles
1. Priorizar legibilidad y velocidad de operacion sobre decoracion.
2. Mantener una jerarquia visual estable (metricas -> formulario -> tabla -> historial).
3. Usar feedback inmediato y mensajes claros en acciones criticas (guardar/exportar/errores).
4. Conservar consistencia de espaciado, tipografia y estados para reducir carga cognitiva.
5. Cumplir accesibilidad WCAG 2.1 AA como baseline (contraste, foco visible, controles claros).
