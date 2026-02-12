import axios, { type InternalAxiosRequestConfig } from 'axios'
import { logger } from 'core/logger'
import { clearAuthStorage, getStoredToken } from 'core/stores/auth'

import { type AnyValue, type JsonLike, isJsonLike, keysToCamelCase, keysToSnakeCase } from './caseTransform'

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

function convertJsonLikeToT<T>(value: JsonLike): T {
  const jsonValue = value
  const converted: T = jsonValue as T
  return converted
}

function assignResponseData<T>(target: { data: T }, value: JsonLike): void {
  const obj: { data: T } = target
  const converted = convertJsonLikeToT<T>(value)
  obj.data = converted
}

apiCaller.interceptors.response.use(
  res => {
    const parsed = parseAxiosData(res.data)
    if (parsed != null) {
      const converted = keysToCamelCase(parsed)
      assignResponseData(res, converted)
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

    if (err.response) {
      const parsed = parseAxiosData(err.response.data)
      if (parsed != null) {
        const converted = keysToCamelCase(parsed)
        assignResponseData(err.response, converted)
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
