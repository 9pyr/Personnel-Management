import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query'
import apiCaller from 'core/endpoints/apiCaller'

interface UseClientQueryOptions<TData = unknown, TError = Error>
  extends Omit<UseQueryOptions<TData, TError>, 'queryFn' | 'queryKey'> {
  url: string
  params?: Record<string, string | number | boolean | undefined>
}

function buildQueryKey(url: string, params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return url
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      search.append(key, String(value))
    }
  })
  const qs = search.toString()
  return qs ? `${url}?${qs}` : url
}

export function useClientQuery<TData = unknown, TError = Error>(
  options: UseClientQueryOptions<TData, TError>
): UseQueryResult<TData, TError> {
  const { url, params, ...queryOptions } = options
  const queryKey = buildQueryKey(url, params)

  return useQuery<TData, TError>({
    ...queryOptions,
    queryKey: [queryKey],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value))
          }
        })
      }
      const queryString = searchParams.toString()
      const fullUrl = queryString ? `${url}?${queryString}` : url
      const { data } = await apiCaller.get<TData>(fullUrl)
      return data
    },
  })
}
