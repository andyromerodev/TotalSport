---
name: clean-architecture
description: Enforce Clean Architecture and SOLID principles in the TotalSport/ALKILO project. Use when adding new features, use cases, repositories, Vue components, or UI states. Ensures every change respects the Domain → Application → Infrastructure → UI layering and Android-inspired naming conventions.
---

This skill guides implementation of new features following the Clean Architecture and SOLID principles established in this project. The stack is Astro (SSG shell) + Vue 3 + Pinia, with Android Jetpack Compose naming conventions.

## Architecture Layers

```
src/
  domain/          → Types + Repository interfaces (no imports from other layers)
  infrastructure/  → Repository implementations (JSON files, external data)
  application/     → Use cases (pure functions, depend only on domain interfaces)
  lib/             → Pure utility functions (slugify, whatsapp, productImages)
  ui/vue/
    types/         → UiState contracts (what Vue receives, no domain types here)
    adapters/      → Mappers: Domain → UiState
    stores/        → Pinia ViewModels (reactive state holders)
    composables/   → Composable hooks (load state into store)
    components/    → Vue SFCs (read from store or receive props)
    routes/        → Page data functions (getStaticPaths + getPageData)
  pages/           → Astro shells (~8 lines: import route module + render Vue)
```

## Android ↔ Vue Mental Model

| Android (Kotlin/Compose) | This project |
|--------------------------|-------------|
| `data class XxxUiState` | `type XxxUiState` in `ui/vue/types/` |
| `ViewModel` + `StateFlow` | `defineStore('xxx', () => { ref, computed })` in `stores/` |
| `UseCase` class | `export function getXxxUseCase(...)` in `application/` |
| `Repository` interface | `interface IXxxRepository` in `domain/` |
| `Repository` implementation | `class JsonXxxRepository` in `infrastructure/` |
| `Composable` / `rememberXxx` | `useXxx()` composable in `composables/` |
| `@Composable` function | `<script setup>` + `<template>` in `components/` |
| `NavController` / route entry | `getPageData()` in `routes/` |
| `Activity` / `Fragment` | `.astro` shell page in `pages/` |

## SOLID Principles Applied

### S — Single Responsibility
- Each use case file does ONE thing: `GetStoreProductsUseCase.ts`, `GetProductByIdUseCase.ts`
- Each Vue component renders ONE view: `StoreCatalogPage.vue`, `ProductDetailPage.vue`
- Each route module handles ONE page's data: `storeRoutes.ts`, `productRoutes.ts`

### O — Open/Closed
- Add new repositories implementing `ICatalogRepository` without changing use cases
- Add new mappers without changing existing ones
- New stores/categories don't require code changes — data-driven via JSON

### L — Liskov Substitution
- Any `ICatalogRepository` implementation can replace `jsonCatalogRepository` in use cases
- Use cases accept the interface, not the concrete class

### I — Interface Segregation
- `ICatalogRepository` and `IStockRepository` are separate — don't force both on every consumer
- UiState types are lean: each component gets only the fields it needs

### D — Dependency Inversion
- Use cases depend on `ICatalogRepository`, not `jsonCatalogRepository`
- Default parameters inject production implementations: `getStoresUseCase(repo = jsonCatalogRepository)`
- No runtime DI container needed — Astro SSG compatible

## Naming Conventions

| Concept | Pattern | Example |
|---------|---------|---------|
| Use case function | `getXxxUseCase` / `findXxxUseCase` | `getStoreProductsUseCase` |
| Use case file | `GetXxxUseCase.ts` | `GetStoreProductsUseCase.ts` |
| Repository interface | `IXxxRepository` | `ICatalogRepository` |
| Repository implementation | `jsonXxxRepository` | `jsonCatalogRepository` |
| UiState type | `XxxUiState` | `StoreCatalogUiState` |
| Pinia store | `useXxxViewModel` | `useCatalogViewModel` |
| Composable | `useXxx` | `useStoreCatalog` |
| Mapper function | `toXxxUiState` | `toStoreCatalogUiState` |
| Route module | `xxxRoutes.ts` | `storeRoutes.ts` |
| Route data fn | `getXxxPageData` | `getStorePageData` |

## Step-by-Step: Adding a New Feature

### 1. New domain type
Add to `src/domain/catalog.types.ts`. Keep types pure — no logic, no imports.

```typescript
// src/domain/catalog.types.ts
export type NewEntity = {
  id: string;
  name: string;
};
```

### 2. New use case
Create `src/application/GetXxxUseCase.ts`. Pure function, accept repo interface as optional param.

```typescript
// src/application/GetNewEntityUseCase.ts
import { jsonCatalogRepository } from '../infrastructure/jsonCatalogRepository';
import type { ICatalogRepository } from '../domain/catalog.repository';

export function getNewEntityUseCase(
  param: string,
  repo: ICatalogRepository = jsonCatalogRepository
) {
  return repo.getNewEntities(param);
}
```

### 3. New UiState type
Add to `src/ui/vue/types/catalogUiState.ts`. Only UI-relevant fields.

```typescript
export type NewEntityUiState = {
  id: string;
  displayName: string;
  actionHref: string;
};
```

### 4. New mapper
Add to `src/ui/vue/adapters/catalogViewModelMappers.ts`.

```typescript
export function toNewEntityUiState(entity: NewEntity, baseUrl: string): NewEntityUiState {
  return {
    id: entity.id,
    displayName: entity.name,
    actionHref: `${baseUrl}entidad/${entity.id}/`
  };
}
```

### 5. New Pinia state (if needed)
Add state to `src/ui/vue/stores/catalogViewModel.ts`. Keep it a `ref`, expose via return.

```typescript
// Inside useCatalogViewModel defineStore:
const newEntityUiState = ref<NewEntityUiState | null>(null);
function loadNewEntityUiState(payload: NewEntityUiState) {
  newEntityUiState.value = payload;
}
return { ..., newEntityUiState, loadNewEntityUiState };
```

### 6. New composable
Create `src/ui/vue/composables/useNewEntity.ts`.

```typescript
import { useCatalogViewModel } from '../stores/catalogViewModel';
import type { NewEntityUiState } from '../types/catalogUiState';

export function useNewEntity(initial: NewEntityUiState) {
  const store = useCatalogViewModel();
  store.loadNewEntityUiState(initial);
  return { newEntityUiState: computed(() => store.newEntityUiState) };
}
```

### 7. New Vue component
Create `src/ui/vue/components/NewEntityPage.vue`.

```vue
<script setup lang="ts">
import { useNewEntity } from '../composables/useNewEntity';
import type { NewEntityUiState } from '../types/catalogUiState';

const props = defineProps<{ entity: NewEntityUiState }>();
const { newEntityUiState } = useNewEntity(props.entity);
</script>

<template>
  <section>
    <h1>{{ newEntityUiState?.displayName }}</h1>
  </section>
</template>
```

### 8. New route module
Create `src/ui/vue/routes/newEntityRoutes.ts`.

```typescript
import { getAllNewEntitiesUseCase, getNewEntityByIdUseCase } from '../../../application/GetNewEntityUseCase';
import { normalizeBaseUrl, toNewEntityUiState } from '../adapters/catalogViewModelMappers';

export function getStaticPaths() {
  return getAllNewEntitiesUseCase().map((e) => ({ params: { id: e.id } }));
}

export function getNewEntityPageData(id: string, rawBaseUrl: string) {
  const entity = getNewEntityByIdUseCase(id);
  if (!entity) return null;
  return toNewEntityUiState(entity, normalizeBaseUrl(rawBaseUrl));
}
```

### 9. Thin Astro shell
Create `src/pages/entidad/[id].astro` (~8 lines).

```astro
---
import MainLayout from '../../layouts/MainLayout.astro';
import NewEntityPage from '../../ui/vue/components/NewEntityPage.vue';
import { getStaticPaths as _paths, getNewEntityPageData } from '../../ui/vue/routes/newEntityRoutes';

export const getStaticPaths = _paths;

const entity = getNewEntityPageData(Astro.params.id ?? '', import.meta.env.BASE_URL);
if (!entity) return Astro.redirect(import.meta.env.BASE_URL);
---
<MainLayout title={entity.displayName}>
  <NewEntityPage client:load entity={entity} />
</MainLayout>
```

### 10. Verify
```bash
pnpm build   # all pages generated, no TypeScript errors
```

## Anti-patterns to Avoid

- **NO** business logic in `.astro` files — belongs in `application/` or `routes/`
- **NO** domain types (`Product`, `StoreMeta`) as Vue props — map to `UiState` first
- **NO** direct imports of `jsonCatalogRepository` in Vue components — only in use cases
- **NO** Pinia store mutations inside Vue template — only via composable actions
- **NO** hardcoded base URLs — always use `normalizeBaseUrl(import.meta.env.BASE_URL)`
- **NO** `as any` or unsafe casts — use `RawProduct` → `Product` enrichment pattern

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/domain/catalog.types.ts` | All domain types |
| `src/domain/catalog.repository.ts` | Repository interfaces |
| `src/infrastructure/jsonCatalogRepository.ts` | Catalog + stock data |
| `src/ui/vue/types/catalogUiState.ts` | All UiState contracts |
| `src/ui/vue/adapters/catalogViewModelMappers.ts` | Domain → UiState mappers |
| `src/ui/vue/stores/catalogViewModel.ts` | Pinia ViewModel |
| `src/ui/vue/routes/` | Page data functions |
| `REFACTOR_CLEAN_ARCHITECTURE.md` | Full architecture rationale |
| `VUE_PINIA_PARA_ANDROID.md` | Android→Vue mental model guide |
