export const useExpenses = () => {
  const config = useRuntimeConfig()

  const getExpenses = (params: { page: number; limit: number }) =>
    useFetch<[any[], number]>(`${config.public.apiBase}/expenses`, {
      query: params,
      server: false, // 👈 CLAVE para que salga en Network
    })

  return {
    getExpenses,
  }
}
