import axios from 'axios'
import { logger } from 'core/logger'
import { clearAuthStorage, getStoredToken } from 'core/stores/auth'

import { keysToCamelCase, keysToSnakeCase } from './caseTransform'

const apiCaller = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiCaller.interceptors.request.use(config => {
  const token = getStoredToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (
    config.data != null &&
    typeof config.data === 'object' &&
    !(config.data instanceof FormData)
  ) {
    config.data = keysToSnakeCase(config.data)
  }
  return config
})

apiCaller.interceptors.response.use(
  res => {
    if (res.data != null && typeof res.data === 'object') {
      res.data = keysToCamelCase(res.data)
    }
    return res
  },
  err => {
    if (err.response?.status === 401) {
      clearAuthStorage()
      window.location.href = '/login'
    }
    if (err.response?.data != null && typeof err.response.data === 'object') {
      err.response.data = keysToCamelCase(err.response.data)
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
