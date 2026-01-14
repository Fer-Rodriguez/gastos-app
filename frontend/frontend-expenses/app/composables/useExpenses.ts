export const useExpenses = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.NUXT_PUBLIC_API_BASE || 'http://localhost:4000'

  const getExpenses = (params: { page: number; limit: number }) =>
    useFetch<[any[], number]>(`${baseURL}/expenses`, {
      query: params,
    })

  const createExpense = (payload: {
    description: string
    amount: number
    category: string
    date: string
  }) =>
    useFetch(`${baseURL}/expenses`, {
      method: 'POST',
      body: payload,
    })

  const updateExpense = (id: number, payload: {
    description: string
    amount: number
    category: string
    date: string
  }) =>
    useFetch(`${baseURL}/expenses/${id}`, {
      method: 'PUT',
      body: payload,
    })

  const deleteExpense = (id: number) =>
    useFetch(`${baseURL}/expenses/${id}`, {
      method: 'DELETE',
    })

  return {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
  }
}
