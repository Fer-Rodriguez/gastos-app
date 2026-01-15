<script setup lang="ts">
import { useToast } from 'vue-toast-notification'
const config = useRuntimeConfig()
const baseURL = config.public.NUXT_PUBLIC_API_BASE || 'http://localhost:4000'

type Expense = {
  id: number
  description: string
  amount: number
  category: string
  date: string
  deletedAt: string | null
}

const $toast = useToast()

const page = ref(1)
const limit = ref(10)
const searchValue = ref('')
const selectedCategory = ref('')

const { createExpense, updateExpense, deleteExpense, getExpenses, getSearchExpenses } = useExpenses()

// Obtener datos reactivos
const { data, pending, error, refresh } = await useAsyncData(
  'expenses',
  () => {
    return $fetch<[Expense[], number]>(`${baseURL}/expenses`, {
      query: {
        page: page.value,
        limit: limit.value,
      }
    })
  },
  {
    watch: [page, limit],
    server: true, 
    lazy: false    
  }
)

const { data: searchQueryActionData, pending: searchPending, error: searchError, refresh: searchRefresh } = await useAsyncData(
  'expenses/search',
  () => {
     // Only fetch if there's a search value
    if (!searchValue.value) {
      return Promise.resolve([])
    }
    return $fetch<Expense[]>(`${baseURL}/expenses/search`, {
      query: {
        query: searchValue.value
      }
    })
  },
  {
    watch: [searchValue]
  }
)

// Use search results if search value exists, otherwise use regular data
const rows = computed<Expense[]>(() => {
  if (searchValue.value && (searchQueryActionData.value?.length || 0) > 0) {
    console.log('searchQueryActionData', searchQueryActionData.value)
    return searchQueryActionData.value ?? []
  }
  return data.value?.[0] ?? []
})
// let rows = computed<Expense[]>(() => data.value?.[0] ?? [])
// rows = computed<Expense[]>(() => searchQueryActionData.value?.[0] ?? data.value?.[0] ?? [])
const total = computed<number>(() => data.value?.[1] ?? 0)

// Obtener categorías únicas
const categories = computed(() => {
  const cats = rows.value.map(expense => expense.category)
  return [...new Set(cats)].filter(Boolean)
})

// Filtrar gastos por búsqueda y categoría
const filteredRows = computed(() => {
  let filtered = rows.value

  // Filtrar por categoría
  if (selectedCategory.value) {
    filtered = filtered.filter(expense => expense.category === selectedCategory.value)
  }

  return filtered
})

const isOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)

const isDeleteModalOpen = ref(false)
const deleteId = ref<number | null>(null)

const showLimitDropdown = ref(false)

const form = reactive({
  description: '',
  amount: null as number | null,
  category: '',
  date: '',
})

const openCreateModal = () => {
  isEditing.value = false
  editingId.value = null
  form.description = ''
  form.amount = null
  form.category = ''
  form.date = ''
  isOpen.value = true
}

const openEditModal = (expense: Expense) => {
  isEditing.value = true
  editingId.value = expense.id
  form.description = expense.description
  form.amount = expense.amount
  form.category = expense.category
  form.date = expense.date
  isOpen.value = true
}

const saveExpense = async () => {
  if (!form.description || !form.amount || !form.category || !form.date) {
    $toast.error('Por favor completa todos los campos', {
      position: 'top-right',
      duration: 3000
    })
    return
  }

  try {
    if (isEditing.value && editingId.value) {
      await updateExpense(editingId.value, {
        description: form.description,
        amount: form.amount,
        category: form.category,
        date: form.date,
      })
      $toast.success('¡Gasto actualizado exitosamente!', {
        position: 'top-right',
        duration: 3000
      })
    } else {
      await createExpense({
        description: form.description,
        amount: form.amount,
        category: form.category,
        date: form.date,
      })
      $toast.success('¡Gasto agregado exitosamente!', {
        position: 'top-right',
        duration: 3000
      })
    }

    form.description = ''
    form.amount = null
    form.category = ''
    form.date = ''
    isOpen.value = false
    await refresh()
  } catch (err) {
    $toast.error('Error al guardar el gasto. Intenta nuevamente.', {
      position: 'top-right',
      duration: 4000
    })
    console.error('Error al guardar gasto:', err)
  }
}

const openDeleteModal = (id: number) => {
  deleteId.value = id
  isDeleteModalOpen.value = true
}

const confirmDelete = async () => {
  if (!deleteId.value) return

  try {
    await deleteExpense(deleteId.value)
    $toast.success('¡Gasto eliminado exitosamente!', {
      position: 'top-right',
      duration: 3000
    })
    isDeleteModalOpen.value = false
    deleteId.value = null
    await refresh()
  } catch (err) {
    $toast.error('Error al eliminar el gasto. Intenta nuevamente.', {
      position: 'top-right',
      duration: 4000
    })
    console.error('Error al eliminar gasto:', err)
  }
}

const changeLimit = async (newLimit: number) => {
  limit.value = newLimit
  page.value = 1
  showLimitDropdown.value = false
  await refresh()
}

const movePage = async (pageNumber: number) => {
  page.value = pageNumber
  await refresh()
}

const clearFilters = () => {
  selectedCategory.value = ''
}
</script>

<template>
  <div class="p-6 space-y-4">
    <h1 class="text-xl font-bold">Gastos</h1>

    <div class="flex flex-wrap gap-4 items-center">
      <button 
        @click="openCreateModal"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Agregar gasto
      </button>

      <!-- Dropdown de límite MUCHO MÁS PEQUEÑO -->
      <div class="relative">
        <button 
          @click="showLimitDropdown = !showLimitDropdown"
          class="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center gap-1"
        >
          <span>{{ limit }}</span>
          <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <div 
          v-if="showLimitDropdown"
          class="absolute top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 min-w-[60px]"
        >
          <button 
            @click="changeLimit(10)"
            class="block w-full text-center px-2 py-1 text-xs hover:bg-gray-100"
          >
            10
          </button>
          <button 
            @click="changeLimit(50)"
            class="block w-full text-center px-2 py-1 text-xs hover:bg-gray-100"
          >
            50
          </button>
          <button 
            @click="changeLimit(100)"
            class="block w-full text-center px-2 py-1 text-xs hover:bg-gray-100"
          >
            100
          </button>
        </div>
      </div>
      <div>
        <button
        class="block w-full text-center px-2 py-1 text-xs hover:bg-gray-100"
        @click="movePage(page = 1 ? 1 : page - 1)">
        <
        </button>
        <button
        class="block w-full text-center px-2 py-1 text-xs hover:bg-gray-100"
        @click="movePage(page+1)">
        >
        </button>
      </div>
    </div>

    <!-- Barra de búsqueda y filtros -->
    <div class="flex flex-wrap gap-4 items-center">
      <!-- Búsqueda general -->
      <div class="flex-1 min-w-[200px]">
        <input
          v-model="searchValue"
          type="text"
          placeholder="Buscar descripción..."
          class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Filtro por categoría -->
      <div class="min-w-[200px]">
        <select
          v-model="selectedCategory"
          class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas las categorías</option>
          <option v-for="cat in categories" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>
      </div>

      <!-- Botón limpiar filtros -->
      <button
        v-if="selectedCategory"
        @click="clearFilters"
        class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        Limpiar filtros
      </button>
    </div>

    <!-- Contador de resultados -->
    <div class="text-sm text-gray-600">
      Mostrando {{ filteredRows.length }} de {{ rows.length }} gastos
    </div>

    <!-- TABLA -->
    <div class="overflow-x-auto">
      <table v-if="filteredRows.length" border="1" cellpadding="8" class="w-full border-collapse min-w-[600px]">
        <thead>
          <tr class="bg-gray-100">
            <th class="p-2 text-left">Descripción</th>
            <th class="p-2 text-left">Categoría</th>
            <th class="p-2 text-left">Monto</th>
            <th class="p-2 text-left">Fecha</th>
            <th class="p-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="expense in filteredRows" :key="expense.id" class="border-b hover:bg-gray-50">
            <td class="p-2">{{ expense.description }}</td>
            <td class="p-2">{{ expense.category }}</td>
            <td class="p-2">{{ expense.amount }}</td>
            <td class="p-2">{{ expense.date }}</td>
            <td class="p-2">
              <div class="flex gap-2">
                <button
                  @click="openEditModal(expense)"
                  class="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                >
                  Editar
                </button>
                <button
                  @click="openDeleteModal(expense.id)"
                  class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-else class="text-center py-8 text-gray-500">
        No se encontraron gastos con los filtros aplicados
      </div>
    </div>
  </div>

  <!-- MODAL CREAR/EDITAR -->
  <div 
    v-if="isOpen"
    style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 16px;"
    @click="isOpen = false"
  >
    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5);"></div>
    
    <div 
      style="position: relative; background-color: white; border-radius: 8px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); max-width: 28rem; width: 100%; max-height: 90vh; overflow-y: auto; z-index: 10000;"
      @click.stop
    >
      <div style="padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
          <div style="flex: 1; padding-right: 16px;">
            <h2 style="font-size: 1.125rem; font-weight: 700; color: #111827; margin: 0;">
              {{ isEditing ? 'Editar gasto' : 'Nuevo gasto' }}
            </h2>
            <p style="font-size: 0.875rem; color: #6b7280; margin-top: 4px; margin-bottom: 0;">
              {{ isEditing ? 'Actualiza la información del gasto' : 'Completa la información del gasto' }}
            </p>
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
            @click="saveExpense"
            style="padding: 10px 20px; background-color: #2563eb; color: white; border-radius: 6px; border: none; cursor: pointer; font-size: 0.875rem; font-weight: 500;"
          >
            {{ isEditing ? 'Actualizar' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL ELIMINAR -->
  <div 
    v-if="isDeleteModalOpen"
    style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 16px;"
    @click="isDeleteModalOpen = false"
  >
    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5);"></div>
    
    <div 
      style="position: relative; background-color: white; border-radius: 8px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); max-width: 24rem; width: 100%; z-index: 10000;"
      @click.stop
    >
      <div style="padding: 24px;">
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
          <div style="flex-shrink: 0; width: 48px; height: 48px; border-radius: 50%; background-color: #fee2e2; display: flex; align-items: center; justify-content: center;">
            <svg style="width: 24px; height: 24px; color: #dc2626;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div style="flex: 1;">
            <h3 style="font-size: 1.125rem; font-weight: 600; color: #111827; margin: 0;">¿Estás seguro?</h3>
            <p style="font-size: 0.875rem; color: #6b7280; margin-top: 4px; margin-bottom: 0;">Esta acción no se puede deshacer. El gasto será eliminado permanentemente.</p>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px;">
          <button
            @click="isDeleteModalOpen = false"
            type="button"
            style="padding: 10px 20px; color: #374151; background-color: #f3f4f6; border-radius: 6px; border: none; cursor: pointer; font-size: 0.875rem; font-weight: 500;"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="confirmDelete"
            style="padding: 10px 20px; background-color: #dc2626; color: white; border-radius: 6px; border: none; cursor: pointer; font-size: 0.875rem; font-weight: 500;"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
