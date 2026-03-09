# TotalSport - Flujo Operativo Admin Privado

Guia rapida para manejar inventario/ventas de forma privada y publicar solo stock sanitizado al catalogo publico.

## 1) Requisitos

- Repo publico: `/Users/andy/Documents/TotalSport`
- Repo privado: `/Users/andy/Documents/totalsport-admin-data`
- `pnpm` instalado

## 2) Configuracion por sesion de terminal

Ejecuta esto una vez por terminal abierta:

```bash
cd /Users/andy/Documents/TotalSport
export ADMIN_DATA_PATH="/Users/andy/Documents/totalsport-admin-data"
```

Verificacion opcional:

```bash
echo $ADMIN_DATA_PATH
```

## 3) Primera vez (bootstrap)

Si el repo privado esta vacio o quieres inicializar estructura:

```bash
cd /Users/andy/Documents/TotalSport
export ADMIN_DATA_PATH="/Users/andy/Documents/totalsport-admin-data"
pnpm admin:init-data
pnpm validate-admin-data
```

Esto crea/valida en el repo privado:

- `products-finance.json`
- `inventory-ledger.json`

## 4) Flujo diario (operacion)

### 4.1 Abrir panel local

```bash
cd /Users/andy/Documents/TotalSport
export ADMIN_DATA_PATH="/Users/andy/Documents/totalsport-admin-data"
pnpm admin:start
```

Abrir en navegador:

- `http://127.0.0.1:4310`

Desde el panel puedes:

- Registrar movimientos (`ENTRY`, `EXIT`, `ADJUSTMENT`, `SALE`)
- Ver stock actual y agotados
- Ver ingresos y ganancia por rango
- Exportar stock publico (boton)

### 4.2 Guardar datos privados en GitHub privado

```bash
cd /Users/andy/Documents/totalsport-admin-data
git add products-finance.json inventory-ledger.json
git commit -m "Update inventory and sales"
git push
```

## 5) Publicar stock al repo publico

Si no usaste el boton del panel, exporta por terminal:

```bash
cd /Users/andy/Documents/TotalSport
export ADMIN_DATA_PATH="/Users/andy/Documents/totalsport-admin-data"
pnpm export-public-stock
```

Luego valida build:

```bash
pnpm build
```

Publica el cambio sanitizado:

```bash
git add src/data/public-stock.json
git commit -m "Update public stock availability"
git push
```

## 6) Comandos utiles

```bash
# Validar catalogo publico
pnpm validate-products

# Validar datos privados (schema + referencias de producto)
pnpm validate-admin-data

# Exportar stock publico desde privados
pnpm export-public-stock
```

## 7) Que se publica y que NO se publica

Se publica en repo publico (`TotalSport`):

- `src/data/public-stock.json` con:
  - `productId`
  - `inStock`
  - `availableQty`
  - `updatedAt`

NO se publica en repo publico:

- `costUsd`
- `profitUsd`
- `revenueUsd`
- historial de movimientos detallado
- notas internas de ventas

## 8) Solucion de problemas rapida

### Error: `Unknown productId`

El repo privado tiene IDs que no existen en catalogo actual.

Pasos:

```bash
cd /Users/andy/Documents/TotalSport
export ADMIN_DATA_PATH="/Users/andy/Documents/totalsport-admin-data"
pnpm validate-admin-data
```

Corrige IDs en el repo privado o agrega producto al catalogo publico.

### Error de push: `origin does not appear to be a git repository`

Configura remoto del repo privado:

```bash
cd /Users/andy/Documents/totalsport-admin-data
git remote add origin https://github.com/TU_USUARIO/totalsport-admin-data.git
git push -u origin main
```

### Panel no levanta en puerto 4310

Prueba otro puerto:

```bash
cd /Users/andy/Documents/TotalSport
export ADMIN_DATA_PATH="/Users/andy/Documents/totalsport-admin-data"
ADMIN_PORT=4311 pnpm admin:start
```

## 9) Checklist corto antes de terminar el dia

1. Registrar movimientos en panel.
2. `git push` del repo privado (`totalsport-admin-data`).
3. Exportar stock publico (`pnpm export-public-stock` o boton).
4. `pnpm build` en repo publico.
5. `git push` del repo publico con `src/data/public-stock.json`.
