import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query'
import apiCaller from 'core/endpoints/apiCaller'

interface UseClientMutationOptions<TData = unknown, TVariables = unknown, TError = Error>
  extends Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'> {
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  url: string | ((variables: TVariables) => string)
  invalidateQueries?: string[]
}

export function useClientMutation<TData = unknown, TVariables = unknown, TError = Error>(
  options: UseClientMutationOptions<TData, TVariables, TError>
): UseMutationResult<TData, TError, TVariables> {
  const { method, url, invalidateQueries, ...mutationOptions } = options
  const queryClient = useQueryClient()

  return useMutation<TData, TError, TVariables>({
    ...mutationOptions,
    mutationFn: async (variables: TVariables) => {
      const finalUrl = typeof url === 'function' ? url(variables) : url
      let response

      let payload: unknown = variables
      if (mutationOptions.onMutate) {
        payload = await mutationOptions.onMutate(variables)
      }

      switch (method) {
        case 'POST':
          response = await apiCaller.post<TData>(finalUrl, payload)
          break
        case 'PUT':
          response = await apiCaller.put<TData>(finalUrl, payload)
          break
        case 'PATCH':
          response = await apiCaller.patch<TData>(finalUrl, payload)
          break
        case 'DELETE':
          response = await apiCaller.delete<TData>(finalUrl)
          break
        default:
          throw new Error(`Unsupported method: ${method}`)
      }

      return response.data
    },
    onSuccess: (data, variables, context) => {
      if (invalidateQueries) {
        invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey: [queryKey] })
        })
      }
      if (mutationOptions.onSuccess) {
        mutationOptions.onSuccess(data, variables, context)
      }
    },
  })
}
