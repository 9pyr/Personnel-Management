import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { logger } from 'core/logger'
import { clearAuthStorage, getStoredToken } from 'core/stores/auth'

import { AnyValue, JsonLike, isJsonLike, keysToCamelCase, keysToSnakeCase } from './caseTransform'

const apiCaller = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiCaller.interceptors.request.use((config: InternalAxiosRequestConfig<JsonLike>) => {
  const token = getStoredToken()
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  if (
    config.data != null &&
    typeof config.data === 'object' &&
    !(config.data instanceof FormData)
  ) {
    if (isJsonLike(config.data)) {
      config.data = keysToSnakeCase(config.data)
    }
  }
  return config
})

function parseAxiosData(data: AnyValue): JsonLike | undefined {
  if (data == null) return undefined
  if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
    return isJsonLike(data) ? data : undefined
  }
  if (typeof data === 'object' && !Array.isArray(data) && !(data instanceof Date)) {
    return isJsonLike(data) ? data : undefined
  }
  return undefined
}

apiCaller.interceptors.response.use(
  (res: AxiosResponse<AnyValue>) => {
    const parsed = parseAxiosData(res.data)
    if (parsed != null) {
      res.data = keysToCamelCase(parsed)
    }
    return res
  },
  (err: Error | object) => {
    if (!axios.isAxiosError(err)) {
      logger.error('API error (non-axios)', err)
      return Promise.reject(new Error('Unknown API error'))
    }

    if (err.response && err.response.status === 401) {
      clearAuthStorage()
      window.location.href = '/login'
    }

    function hasResponseWithAnyValue(
      error: AxiosError,
    ): error is AxiosError & { response: AxiosResponse<AnyValue> } {
      return error.response != null
    }
    if (hasResponseWithAnyValue(err)) {
      const parsed = parseAxiosData(err.response.data)
      if (parsed != null) {
        err.response.data = keysToCamelCase(parsed)
      }
    }

    logger.error('API error', err, {
      method: err.config?.method,
      url: err.config?.url,
      status: err.response?.status,
    })

    return Promise.reject(err)
  },
)

export default apiCaller
