import { camelCase, snakeCase } from 'lodash'

export type JsonLike =
  | string
  | number
  | boolean
  | null
  | JsonLike[]
  | {
      [key: string]: JsonLike
    }

function isPlainObject(value: JsonLike): value is { [key: string]: JsonLike } {
  return (
    typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)
  )
}

function convertKeys(obj: JsonLike, keyConverter: (key: string) => string): JsonLike {
  if (Array.isArray(obj)) {
    return obj.map(item => convertKeys(item, keyConverter))
  }
  if (isPlainObject(obj)) {
    const result: { [key: string]: JsonLike } = {}
    for (const [key, value] of Object.entries(obj)) {
      const newKey = keyConverter(key)
      result[newKey] = convertKeys(value, keyConverter)
    }
    return result
  }
  return obj
}

export function keysToCamelCase(obj: JsonLike): JsonLike {
  return convertKeys(obj, camelCase)
}

export function keysToSnakeCase(obj: JsonLike): JsonLike {
  return convertKeys(obj, snakeCase)
}

export function isJsonLike(value: unknown): value is JsonLike {
  if (value == null) return true
  if (typeof value === 'string') return true
  if (typeof value === 'number') return Number.isFinite(value)
  if (typeof value === 'boolean') return true
  if (Array.isArray(value)) return value.every(isJsonLike)
  if (value instanceof Date) return false
  if (typeof value === 'object') {
    for (const v of Object.values(value)) {
      if (!isJsonLike(v)) return false
    }
    return true
  }
  return false
}
