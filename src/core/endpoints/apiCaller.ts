import axios, { type InternalAxiosRequestConfig } from 'axios'
import { logger } from 'core/logger'
import { clearAuthStorage, getStoredToken } from 'core/stores/auth'

import { isJsonLike, keysToCamelCase, keysToSnakeCase } from './caseTransform'

const apiCaller = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiCaller.interceptors.request.use((config: InternalAxiosRequestConfig<unknown>) => {
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

apiCaller.interceptors.response.use(
  res => {
    const data: unknown = res.data
    if (isJsonLike(data)) {
      res.data = keysToCamelCase(data)
    }
    return res
  },
  (err: unknown) => {
    if (!axios.isAxiosError(err)) {
      logger.error('API error (non-axios)', err)
      return Promise.reject(new Error('Unknown API error'))
    }

    if (err.response && err.response.status === 401) {
      clearAuthStorage()
      window.location.href = '/login'
    }

    if (err.response) {
      const responseData: unknown = err.response.data
      if (isJsonLike(responseData)) {
        err.response.data = keysToCamelCase(responseData)
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
