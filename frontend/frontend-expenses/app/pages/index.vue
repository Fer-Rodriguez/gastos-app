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

const isOpen = ref(false)

const form = reactive({
  description: '',
  amount: null as number | null,
  category: '',
  date: '',
})
</script>

<template>
  <div class="p-6 space-y-4">
    <h1 class="text-xl font-bold">Gastos</h1>

    <button 
      @click="isOpen = true"
      class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Agregar gasto
    </button>

    <!-- TABLA -->
    <div class="overflow-x-auto">
      <table v-if="rows.length" border="1" cellpadding="8" class="w-full border-collapse min-w-[600px]">
        <thead>
          <tr class="bg-gray-100">
            <th class="p-2 text-left">Descripción</th>
            <th class="p-2 text-left">Categoría</th>
            <th class="p-2 text-left">Monto</th>
            <th class="p-2 text-left">Fecha</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="expense in rows" :key="expense.id" class="border-b hover:bg-gray-50">
            <td class="p-2">{{ expense.description }}</td>
            <td class="p-2">{{ expense.category }}</td>
            <td class="p-2">{{ expense.amount }}</td>
            <td class="p-2">{{ expense.date }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- MODAL RESPONSIVO -->
  <div 
    v-if="isOpen"
    style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 16px;"
    @click="isOpen = false"
  >
    <!-- Fondo oscuro -->
    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5);"></div>
    
    <!-- Contenido del modal -->
    <div 
      style="position: relative; background-color: white; border-radius: 8px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); max-width: 28rem; width: 100%; max-height: 90vh; overflow-y: auto; z-index: 10000;"
      @click.stop
    >
      <!-- Contenedor interno con padding -->
      <div style="padding: 24px;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
          <div style="flex: 1; padding-right: 16px;">
            <h2 style="font-size: 1.125rem; font-weight: 700; color: #111827; margin: 0;">Nuevo gasto</h2>
            <p style="font-size: 0.875rem; color: #6b7280; margin-top: 4px; margin-bottom: 0;">Completa la información del gasto</p>
          </div>
          <button 
            @click="isOpen = false"
            style="color: #9ca3af; cursor: pointer; background: none; border: none; padding: 0; flex-shrink: 0;"
            type="button"
          >
            <svg style="width: 24px; height: 24px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 6px;">Descripción</label>
            <input
              v-model="form.description"
              type="text"
              placeholder="Ej. Renta enero"
              style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem; box-sizing: border-box; outline: none;"
            />
          </div>

          <div>
            <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 6px;">Monto</label>
            <input
              v-model.number="form.amount"
              type="number"
              placeholder="Ej. 5000"
              style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem; box-sizing: border-box; outline: none;"
            />
          </div>

          <div>
            <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 6px;">Categoría</label>
            <input
              v-model="form.category"
              type="text"
              placeholder="Ej. Hogar"
              style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem; box-sizing: border-box; outline: none;"
            />
          </div>

          <div>
            <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 6px;">Fecha</label>
            <input
              v-model="form.date"
              type="date"
              style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem; box-sizing: border-box; outline: none;"
            />
          </div>
        </form>

        <!-- Footer -->
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; flex-wrap: wrap;">
          <button
            @click="isOpen = false"
            type="button"
            style="padding: 10px 20px; color: #374151; background-color: #f3f4f6; border-radius: 6px; border: none; cursor: pointer; font-size: 0.875rem; font-weight: 500;"
          >
            Cancelar
          </button>
          <button
            type="button"
            style="padding: 10px 20px; background-color: #2563eb; color: white; border-radius: 6px; border: none; cursor: pointer; font-size: 0.875rem; font-weight: 500;"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
