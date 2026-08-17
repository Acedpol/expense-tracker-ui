import { useQuery } from '@tanstack/react-query'
import { apiClient } from './api/client'

function App() {
  const { data, isPending, isError } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/health')
      if (error) throw error
      return data
    },
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <h1 className="text-2xl font-semibold text-slate-800">
        {isPending && 'Consultando /health del backend...'}
        {isError && 'Error al conectar con el backend'}
        {data && `Backend dice: ${data.status}`}
      </h1>
    </div>
  )
}

export default App
