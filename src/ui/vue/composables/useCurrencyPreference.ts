import { computed, onMounted, ref, watch } from 'vue';

export const CUP_PER_USD = 675;
export type Currency = 'USD' | 'CUP';

const STORAGE_KEY = 'alkilo-currency';

export function useCurrencyPreference() {
  const currency = ref<Currency>('USD');

  onMounted(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'USD' || stored === 'CUP') currency.value = stored;
  });

  watch(currency, (value) => {
    window.localStorage.setItem(STORAGE_KEY, value);
  });

  const formatPrice = (usd: number) => {
    if (currency.value === 'CUP') {
      return `${new Intl.NumberFormat('es-CU', { maximumFractionDigits: 0 }).format(usd * CUP_PER_USD)} CUP`;
    }

    return `${usd} USD`;
  };

  return {
    currency,
    isCup: computed(() => currency.value === 'CUP'),
    formatPrice,
  };
}
