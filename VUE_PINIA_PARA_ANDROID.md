# Guia Vue + Pinia para dev Android (Kotlin + Compose)

## Resumen rapido
En esta migracion mantuvimos **Clean Architecture**:
- `domain/` y `application/` siguen siendo la fuente de reglas de negocio.
- `ui/vue/` solo renderiza y maneja estado de UI.
- `adapters/` convierte modelos de dominio a `UiState` de presentacion.

Equivalencias mentales:
- `Product`, `StoreMeta` (domain) -> como tus entidades de dominio Kotlin.
- `catalogUiState.ts` -> como tus `UiState` para Compose.
- `catalogViewModel.ts` (Pinia) -> como un `ViewModel` con `StateFlow` compartido.
- `composables/*` -> helpers de presentacion reutilizables (similar a funciones de capa presentation).

## Que hace cada archivo clave

### `src/ui/vue/types/catalogUiState.ts`
Define **tipos de datos para UI** (no para dominio):
- `StoreCardUiState`, `StoreCatalogUiState`, `ProductCardUiState`, `ProductDetailUiState`.

Por que existe:
- Evita que los componentes dependan de campos de dominio que no necesitan.
- Hace explicito el contrato de datos que la UI espera.

Equivalente Android:
- `data class ProductCardUiState(...)`
- `data class ProductDetailUiState(...)`

---

### `src/ui/vue/adapters/catalogViewModelMappers.ts`
Contiene funciones `toXxxVM(...)` que transforman dominio -> UI:
- `toStoreCardUiState`
- `toProductCardUiState`
- `toStoreCatalogUiState`
- `toProductDetailUiState`

Por que existe:
- Mantiene la logica de transformacion fuera del componente.
- Permite reutilizar la misma UI para rutas `tienda` y `coleccion`.

Equivalente Android:
- Mapper en `presentation/mapper` usado por ViewModel antes de emitir `UiState`.

---

### `src/ui/vue/stores/catalogViewModel.ts`
Es el store de Pinia (`defineStore('catalog-ui', ...)`).

Que guarda:
- `homeStoreCardsUiState` (home)
- `storeCatalogUiState` (lista por tienda/categoria)
- `productDetailUiState` (detalle)

Que expone:
- acciones de carga de estado (`loadHomeUiState`, etc.)
- derivados (`hasHomeStoreCards`, `hasSelectedProducts`)

Equivalente Android:
- Un `ViewModel` que contiene estado observable + propiedades derivadas.

---

### `src/ui/vue/composables/useStoreCatalog.ts`
Composable para encapsular uso del store en pantallas de listado.

Funciones:
- `useHomeCatalog(initialCards)`
- `useStoreCatalog(initialCatalog)`

Que hace:
- hidrata el store con datos iniciales
- devuelve estado derivado listo para template

Equivalente Android:
- helper de presentacion por feature que prepara estado para la pantalla.

---

### `src/ui/vue/composables/useProductDetail.ts`
Composable para pantalla detalle.

Que hace:
- hidrata `productDetailUiState` en el store
- devuelve `productDetailUiState` reactivo

Equivalente Android:
- inicializacion de estado de detalle en ViewModel + exposicion de `uiState`.

## Definiciones comunes Vue/Pinia (en lenguaje Android)

### `defineProps<T>()`
Declara las props de entrada del componente Vue.
- En Android Compose: parametros de un `@Composable`.

Ejemplo:
```ts
const props = defineProps<{ catalog: StoreCatalogUiState }>();
```

### `ref(...)`
Crea estado reactivo mutable.
- Compose: `remember { mutableStateOf(...) }`
- ViewModel: `MutableStateFlow` (si el estado vive fuera del composable)

Se lee/escribe con `.value` en script:
```ts
const scale = ref(1);
scale.value = 2;
```

### `computed(() => ... )`
Estado derivado reactivo.
- Compose: `derivedStateOf { ... }`

No se asigna manualmente; se recalcula cuando cambian dependencias.

### `defineStore(name, () => {})` (Pinia)
Declara un store global/reactivo.
- Similar a un ViewModel compartido o state holder de feature.

### `useCatalogViewModel()`
Obtiene instancia del store (como inyectar/obtener ViewModel).

### `composable` (`useXxx`)
Funcion reutilizable para agrupar logica de estado/UI.
- Similar a un modulo de logica de presentacion por pantalla.

## Flujo de datos actual (simplificado)
1. Astro (server) ejecuta UseCases (`application/*`).
2. Mapper (`adapters/*`) transforma dominio -> ViewModel.
3. Componente Vue recibe props tipadas (`defineProps`).
4. Composable hidrata Pinia store con esos datos.
5. Template renderiza estado reactivo (`ref/computed`).

## Regla de oro para mantener Clean Architecture
- Componentes Vue y stores **no** deben llamar repositorios directamente.
- Siempre pasar por `application` (UseCases).
- Usar mappers para llevar datos a ViewModel antes de renderizar.

## Estado de la migracion
Ya estan en Vue+Pinia:
- Home (`index`)
- Tienda y categoria (`tienda/*`)
- Producto detalle (`productos/[id]`)
- Rutas legacy (`coleccion/*`)

Arquitectura limpia preservada: sin cambios breaking en `domain/application/infrastructure`.
