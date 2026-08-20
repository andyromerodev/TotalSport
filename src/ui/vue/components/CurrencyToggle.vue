<script setup lang="ts">
import type { Currency } from '../composables/useCurrencyPreference';

defineProps<{ modelValue: Currency }>();
const emit = defineEmits<{ 'update:modelValue': [value: Currency] }>();
</script>

<template>
  <div class="currency-toggle" role="group" aria-label="Cambiar moneda">
    <span class="currency-label">Moneda</span>
    <div class="currency-options">
      <button
        type="button"
        :class="{ active: modelValue === 'USD' }"
        :aria-pressed="modelValue === 'USD'"
        @click="emit('update:modelValue', 'USD')"
      >
        USD
      </button>
      <button
        type="button"
        :class="{ active: modelValue === 'CUP' }"
        :aria-pressed="modelValue === 'CUP'"
        @click="emit('update:modelValue', 'CUP')"
      >
        CUP
      </button>
    </div>
    <span class="currency-rate">1 USD = 675 CUP</span>
  </div>
</template>
