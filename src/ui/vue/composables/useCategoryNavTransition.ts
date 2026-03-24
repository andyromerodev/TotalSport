import { computed, nextTick, onMounted, ref, watch, type ComputedRef } from 'vue';
import { navigate } from 'astro:transitions/client';
import type { CategoryNavItemUiState, StoreCatalogUiState } from '../types/catalogUiState';

const CATEGORY_SHIMMER_DELAY_MS = 3000;

function isPlainLeftClick(event: MouseEvent): boolean {
  return (
    event.button === 0 &&
    !event.defaultPrevented &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

export function useCategoryNavTransition(view: ComputedRef<StoreCatalogUiState | undefined>) {
  const categoryNavRef = ref<HTMLElement | null>(null);
  const isCategoryTransitioning = ref(false);
  const pendingActiveCategorySlug = ref('');
  let navigationTimeoutId: number | undefined;
  const activeCategorySlug = computed(
    () => view.value?.categories.find((category) => category.isActive)?.slug ?? ''
  );

  function scrollChipToStart(chip: HTMLElement, behavior: ScrollBehavior) {
    const nav = categoryNavRef.value;
    if (!nav) return;

    const nextLeft = Math.max(chip.offsetLeft - nav.offsetLeft, 0);
    nav.scrollTo({ left: nextLeft, behavior });
  }

  function scrollActiveCategoryToStart(behavior: ScrollBehavior) {
    const nav = categoryNavRef.value;
    if (!nav) return false;

    const activeChip = nav.querySelector<HTMLElement>('a.is-active');
    if (!activeChip) return false;

    scrollChipToStart(activeChip, behavior);
    return true;
  }

  function onCategoryClick(event: MouseEvent, category: CategoryNavItemUiState) {
    if (!isPlainLeftClick(event)) return;
    if (category.isActive && !isCategoryTransitioning.value) return;

    event.preventDefault();
    isCategoryTransitioning.value = true;
    pendingActiveCategorySlug.value = category.slug;

    const chip = event.currentTarget;
    if (chip instanceof HTMLElement) {
      scrollChipToStart(chip, 'smooth');
    }

    if (navigationTimeoutId) {
      window.clearTimeout(navigationTimeoutId);
    }

    navigationTimeoutId = window.setTimeout(() => {
      navigate(category.href).catch(() => {
        window.location.assign(category.href);
      });
    }, CATEGORY_SHIMMER_DELAY_MS);
  }

  function isCategoryActive(category: CategoryNavItemUiState): boolean {
    if (pendingActiveCategorySlug.value) {
      return pendingActiveCategorySlug.value === category.slug;
    }

    return category.isActive;
  }

  onMounted(async () => {
    await nextTick();
    scrollActiveCategoryToStart('auto');
  });

  watch(activeCategorySlug, async () => {
    await nextTick();
    scrollActiveCategoryToStart('auto');
  });

  return {
    categoryNavRef,
    isCategoryTransitioning,
    isCategoryActive,
    onCategoryClick,
  };
}
