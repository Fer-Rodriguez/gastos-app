<script setup lang="ts">
import { useToast } from 'vue-toast-notification'

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

// Estado de los datos de gastos
const data = ref<[Expense[], number] | null>(null)
const searchQueryActionData = ref<Expense[]>([])
const pending = ref(false)
const searchPending = ref(false)

// Función de obtención de gastos
const fetchExpenses = async () => {
  pending.value = true
  try {
    const result = await getExpenses({ page: page.value, limit: limit.value })
    data.value = result
  } catch (error) {
    console.error('Error fetching expenses:', error)
    $toast.error('Error al cargar los gastos', {
      position: 'top-right',
      duration: 3000
    })
  } finally {
    pending.value = false
  }
}

// Obtener resultados de búsqueda
const fetchSearchExpenses = async () => {
  if (!searchValue.value) {
    searchQueryActionData.value = []
    return
  }
  
  searchPending.value = true
  try {
    const result = await getSearchExpenses({ query: searchValue.value })
    searchQueryActionData.value = result
  } catch (error) {
    console.error('Error searching expenses:', error)
    $toast.error('Error al buscar gastos', {
      position: 'top-right',
      duration: 3000
    })
  } finally {
    searchPending.value = false
  }
}

// Carga inicial
onMounted(() => {
  fetchExpenses()
})

// Esté atento a los cambios de página/límite
watch([page, limit], () => {
  fetchExpenses()
})

// Esté atento a los cambios de búsqueda
watch(searchValue, () => {
  fetchSearchExpenses()
})

// Utilice los resultados de la búsqueda si existe valor de búsqueda; de lo contrario, utilice datos regulares
const rows = computed<Expense[]>(() => {
  if (searchValue.value && (searchQueryActionData.value?.length || 0) > 0) {
    return searchQueryActionData.value ?? []
  }
  return data.value?.[0] ?? []
})

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

// Asistente para formatear fechas
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return dateString.split('T')[0]
}

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
  form.amount = Number(expense.amount)
  form.category = expense.category
  
  // Manejar diferentes formatos de fecha y convertir a AAAA-MM-DD
  if (expense.date) {
    const date = new Date(expense.date)
    const isoString = date.toISOString().split('T')[0]
    form.date = isoString || ''
  } else {
    form.date = ''
  }
  
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
    await fetchExpenses() // Actualizar datos después de guardar
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
    await fetchExpenses() // Actualizar datos después de eliminarlos
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
  await fetchExpenses()
}

const movePage = async (pageNumber: number) => {
  page.value = pageNumber
  await fetchExpenses()
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
        style="padding: 10px 20px; background-color: #2563eb; color: white; border-radius: 6px; border: none; cursor: pointer; font-size: 0.875rem; font-weight: 500;"
      >
        Agregar gasto
      </button>

    </div>

    <!-- Barra de búsqueda y filtros -->
    <div class="flex flex-wrap gap-4 items-center">
      <!-- Búsqueda general -->
      <div style="width: 300px;">
        <input
          v-model="searchValue"
          type="text"
          placeholder="Buscar descripción..."
          style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem; box-sizing: border-box; outline: none;"
        />
      </div>

      <!-- Filtro por categoría -->
      <div style="width: 200px;">
        <select
          v-model="selectedCategory"
          style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem; box-sizing: border-box; outline: none;"
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
        style="padding: 10px 20px; color: #374151; background-color: #f3f4f6; border-radius: 6px; border: none; cursor: pointer; font-size: 0.875rem; font-weight: 500;"
      >
        Limpiar filtros
      </button>

            <!-- Dropdown de límite -->
      <div style="position: relative;">
        <button 
          @click="showLimitDropdown = !showLimitDropdown"
          style="padding: 10px 20px; color: #374151; background-color: #f3f4f6; border-radius: 6px; border: none; cursor: pointer; font-size: 0.875rem; font-weight: 500; display: flex; align-items: center; gap: 8px;"
        >
          <span>{{ limit }}</span>
          <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <div 
          v-if="showLimitDropdown"
          style="position: absolute; top: 100%; margin-top: 4px; background-color: white; border: 1px solid #d1d5db; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); z-index: 10; min-width: 80px;"
        >
          <button 
            @click="changeLimit(10)"
            style="display: block; width: 100%; text-align: center; padding: 10px 20px; font-size: 0.875rem; background: none; border: none; cursor: pointer; color: #374151;"
            :style="{ backgroundColor: limit === 10 ? '#f3f4f6' : 'transparent' }"
          >
            10
          </button>
          <button 
            @click="changeLimit(50)"
            style="display: block; width: 100%; text-align: center; padding: 10px 20px; font-size: 0.875rem; background: none; border: none; cursor: pointer; color: #374151;"
            :style="{ backgroundColor: limit === 50 ? '#f3f4f6' : 'transparent' }"
          >
            50
          </button>
          <button 
            @click="changeLimit(100)"
            style="display: block; width: 100%; text-align: center; padding: 10px 20px; font-size: 0.875rem; background: none; border: none; cursor: pointer; color: #374151;"
            :style="{ backgroundColor: limit === 100 ? '#f3f4f6' : 'transparent' }"
          >
            100
          </button>
        </div>
      </div>
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
            <td class="p-2">{{ formatDate(expense.date) }}</td>
            <td class="p-2">
              <div class="flex gap-2">
                <button
                  @click="openEditModal(expense)"
                  style="padding: 10px 20px; background-color: #2563eb; color: white; border-radius: 6px; border: none; cursor: pointer; font-size: 0.875rem; font-weight: 500;"
                >
                  Editar
                </button>
                <button
                  @click="openDeleteModal(expense.id)"
                  style="padding: 10px 20px; background-color: #dc2626; color: white; border-radius: 6px; border: none; cursor: pointer; font-size: 0.875rem; font-weight: 500;"
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
    <!-- Contador de resultados -->
    <div class="text-sm text-gray-600">
      Mostrando {{ filteredRows.length }} de {{ rows.length }} gastos
    </div>
    <!-- Botones de paginación -->
    <div style="display: flex; gap: 8px;">
      <button
        @click="movePage(page === 1 ? 1 : page - 1)"
        style="padding: 10px 20px; color: #374151; background-color: #f3f4f6; border-radius: 6px; border: none; cursor: pointer; font-size: 0.875rem; font-weight: 500;"
        :disabled="page === 1"
      >
        &lt;
      </button>
      <button
        @click="movePage(page + 1)"
        style="padding: 10px 20px; color: #374151; background-color: #f3f4f6; border-radius: 6px; border: none; cursor: pointer; font-size: 0.875rem; font-weight: 500;"
      >
        &gt;
      </button>
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
              step="0.01"
              min="0.01"
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
