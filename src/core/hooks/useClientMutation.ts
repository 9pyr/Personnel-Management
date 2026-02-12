import {
  type MutationFunctionContext,
  type UseMutationOptions,
  type UseMutationResult,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import apiCaller from 'core/endpoints/apiCaller'

interface UseClientMutationOptions<
  TData = unknown,
  TVariables = unknown,
  TError = Error,
> extends Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn' | 'onMutate'> {
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  url: string | ((variables: TVariables) => string)
  invalidateQueries?: string[]
  onMutate?: (variables: TVariables) => Promise<unknown> | unknown
}

export function useClientMutation<TData = unknown, TVariables = unknown, TError = Error>(
  options: UseClientMutationOptions<TData, TVariables, TError>,
): UseMutationResult<TData, TError, TVariables> {
  const { method, url, invalidateQueries, onMutate, onSuccess, ...mutationOptions } = options
  const queryClient = useQueryClient()

  return useMutation<TData, TError, TVariables, unknown>({
    ...mutationOptions,
    onMutate: onMutate
      ? async (variables: TVariables) => {
          const result = await onMutate(variables)
          return result
        }
      : undefined,
    mutationFn: async (variables: TVariables, context?: unknown) => {
      const finalUrl = typeof url === 'function' ? url(variables) : url
      let response

      const payload: unknown = context !== undefined ? context : variables

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
    onSuccess: (
      data: TData,
      variables: TVariables,
      context?: unknown,
      mutation?: MutationFunctionContext,
    ) => {
      if (invalidateQueries) {
        invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey: [queryKey] })
        })
      }
      if (onSuccess && mutation) {
        onSuccess(data, variables, context, mutation)
      }
    },
  })
}
