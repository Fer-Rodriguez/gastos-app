<script setup lang="ts">
import { useExpenses, type Expense } from '../../composables/useExpenses'

const page = ref(1)
const limit = ref(5)
const search = ref('')

const { getExpenses, searchExpenses } = useExpenses()

const { data, refresh } = await getExpenses({
  page: page.value,
  limit: limit.value,
})

const rows = computed<Expense[]>(() => data.value?.[0] ?? [])
const total = computed<number>(() => data.value?.[1] ?? 0)

watch(search, async (value) => {
  if (value.trim()) {
    const result = await searchExpenses(value)
    data.value = [result.data.value ?? [], total.value]
  } else {
    await refresh()
  }
})

watch(page, async () => {
  await refresh()
})
</script>

<template>
  <UContainer class="py-6 space-y-4">
    <UInput
      v-model="search"
      placeholder="Buscar gasto por descripción o categoría..."
      icon="i-heroicons-magnifying-glass"
    />

    <UTable
      :rows="rows"
      :columns="[
        { accessorKey: 'description', header: 'Descripción' },
        { accessorKey: 'category', header: 'Categoría' },
        { accessorKey: 'amount', header: 'Monto' },
        { accessorKey: 'date', header: 'Fecha' },
      ]"
    />

    <UPagination
      v-model="page"
      :page-count="limit"
      :total="total"
    />
  </UContainer>
</template>
