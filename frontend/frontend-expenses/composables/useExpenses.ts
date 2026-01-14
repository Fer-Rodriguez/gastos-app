import { useFetch, useRuntimeConfig } from '#app'

export type Expense = {
  id: number
  description: string
  amount: number
  category: string
  date: string
  deletedAt: string | null
}

export const useExpenses = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase

  const getExpenses = (params: { page: number; limit: number }) => {
    return useFetch<[Expense[], number]>(`${baseURL}/expenses`, {
      params,
    })
  }

  const searchExpenses = (query: string) => {
    return useFetch<Expense[]>(`${baseURL}/expenses/search`, {
      params: { q: query },
    })
  }

  return {
    getExpenses,
    searchExpenses,
  }
}
