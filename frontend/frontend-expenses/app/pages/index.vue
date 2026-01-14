<script setup lang="ts">
type Expense = {
  id: number
  description: string
  amount: number
  category: string
  date: string
  deletedAt: string | null
}

const page = ref(1)
const limit = ref(5)

const { data, pending, error } = useExpenses().getExpenses({
  page: page.value,
  limit: limit.value,
})

const rows = computed<Expense[]>(() => data.value?.[0] ?? [])
const total = computed<number>(() => data.value?.[1] ?? 0)
</script>

<template>
  <div class="p-6">
    <h1 class="text-xl font-bold mb-4">Gastos</h1>

    <p v-if="pending">Cargando...</p>
    <p v-if="error">Error al cargar gastos</p>

    <table v-if="rows.length" border="1" cellpadding="8">
      <thead>
        <tr>
          <th>Descripción</th>
          <th>Categoría</th>
          <th>Monto</th>
          <th>Fecha</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="expense in rows" :key="expense.id">
          <td>{{ expense.description }}</td>
          <td>{{ expense.category }}</td>
          <td>{{ expense.amount }}</td>
          <td>{{ expense.date }}</td>
        </tr>
      </tbody>
    </table>

    <p v-else>No hay gastos</p>
  </div>
</template>
