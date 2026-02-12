import {
  type UseMutationOptions,
  type UseMutationResult,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import apiCaller from 'core/endpoints/apiCaller'

type ApiPrimitive = string | number | boolean | null
type ApiPayload =
  | ApiPrimitive
  | FormData
  | Record<string, ApiPrimitive | ApiPrimitive[] | Record<string, ApiPrimitive> | undefined>

interface UseClientMutationOptions<TData, TVariables, TError extends Error = Error> extends Omit<
  UseMutationOptions<TData, TError, TVariables>,
  'mutationFn' | 'onMutate'
> {
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  url: string | ((variables: TVariables) => string)
  invalidateQueries?: string[]
  buildPayload?: (variables: TVariables) => Promise<ApiPayload> | ApiPayload
}

export function useClientMutation<TData, TVariables, TError extends Error = Error>(
  options: UseClientMutationOptions<TData, TVariables, TError>,
): UseMutationResult<TData, TError, TVariables> {
  const { method, url, invalidateQueries, buildPayload, onSuccess, ...mutationOptions } = options
  const queryClient = useQueryClient()

  return useMutation<TData, TError, TVariables, void>({
    ...mutationOptions,
    mutationFn: async (variables: TVariables) => {
      const finalUrl = typeof url === 'function' ? url(variables) : url
      let response

      const payload = buildPayload ? await buildPayload(variables) : variables

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
          throw new Error('Unsupported method: ' + String(method))
      }

      return response.data
    },
    onSuccess: (data, variables, context, mutation) => {
      if (invalidateQueries) {
        invalidateQueries.forEach(queryKey => {
          void queryClient.invalidateQueries({ queryKey: [queryKey] })
        })
      }
      if (onSuccess && mutation) {
        onSuccess(data, variables, context, mutation)
      }
    },
  })
}
