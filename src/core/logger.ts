/**
 * Logger ฟรี – log ลง console เท่านั้น ไม่ใช้บริการภายนอก
 * ใช้ .error() สำหรับ error จะได้ format เดียวกัน และค้นหาใน DevTools ง่าย
 */

const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const
type LogLevel = (typeof LOG_LEVELS)[number]

function shouldLog(level: LogLevel): boolean {
  const raw = typeof import.meta.env?.VITE_LOG_LEVEL === 'string' ? import.meta.env.VITE_LOG_LEVEL : 'info'
  const envLevel: LogLevel = LOG_LEVELS.includes(raw.toLowerCase() as LogLevel) ? (raw.toLowerCase() as LogLevel) : 'info'
  const idx = LOG_LEVELS.indexOf(level)
  const threshold = LOG_LEVELS.indexOf(envLevel)
  return idx >= 0 && threshold >= 0 && idx >= threshold
}

function formatPayload(level: LogLevel, message: string, meta?: object): string {
  const payload: Record<string, unknown> = {
    level,
    message,
    time: new Date().toISOString(),
    ...meta,
  }
  return JSON.stringify(payload)
}

function log(level: LogLevel, message: string, meta?: object): void {
  if (!shouldLog(level)) return
  const formatted = formatPayload(level, message, meta)
  switch (level) {
    case 'error':
      console.error(formatted)
      break
    case 'warn':
      console.warn(formatted)
      break
    default:
      console.log(formatted)
  }
}

export const logger = {
  debug(message: string, meta?: object): void {
    log('debug', message, meta)
  },
  info(message: string, meta?: object): void {
    log('info', message, meta)
  },
  warn(message: string, meta?: object): void {
    log('warn', message, meta)
  },
  error(message: string, error?: unknown, meta?: object): void {
    const errMeta =
      error instanceof Error
        ? { ...meta, errorName: error.name, errorMessage: error.message, stack: error.stack }
        : error != null
          ? { ...meta, error }
          : meta
    log('error', message, errMeta)
  },
}
