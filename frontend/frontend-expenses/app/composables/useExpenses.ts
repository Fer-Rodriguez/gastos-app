export const useExpenses = () => {
  const config = useRuntimeConfig()

  const getExpenses = (params: { page: number; limit: number }) =>
    useFetch<[any[], number]>(`${config.public.apiBase}/expenses`, {
      query: params,
    })

  const createExpense = (payload: {
    description: string
    amount: number
    category: string
    date: string
  }) =>
    useFetch(`${config.public.apiBase}/expenses`, {
      method: 'POST',
      body: payload,
    })

  return {
    getExpenses,
    createExpense,
  }
}
