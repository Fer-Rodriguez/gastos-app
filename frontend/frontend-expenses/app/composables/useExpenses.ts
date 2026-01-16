export const useExpenses = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase || 'http://localhost:4000'

  const getExpenses = async (params: { page: number; limit: number }) => {
    return await $fetch<[any[], number]>(`${baseURL}/expenses`, {
      query: params,
    })
  }

  const getSearchExpenses = async (params: { query: string }) => {
    return await $fetch<any[]>(`${baseURL}/expenses/search`, {
      query: params,
    })
  }

  const createExpense = async (payload: {
    description: string
    amount: number
    category: string
    date: string
  }) => {
    return await $fetch(`${baseURL}/expenses`, {
      method: 'POST',
      body: payload,
    })
  }

  const updateExpense = async (id: number, payload: {
    description: string
    amount: number
    category: string
    date: string
  }) => {
    return await $fetch(`${baseURL}/expenses/${id}`, {
      method: 'PUT',
      body: payload,
    })
  }

  const deleteExpense = async (id: number) => {
    return await $fetch(`${baseURL}/expenses/${id}`, {
      method: 'DELETE',
    })
  }

  return {
    getExpenses,
    getSearchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
  }
}
