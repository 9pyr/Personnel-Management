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

/** ค่าใดๆ ที่อาจเป็นได้ (ใช้แทน unknown) */
export type AnyValue = string | number | boolean | null | undefined | object

function convertAnyToAnyValue(value: AnyValue): AnyValue {
  return value
}

function isJsonLikeValue(value: AnyValue): value is JsonLike {
  return isJsonLike(value)
}

export function isJsonLike(value: AnyValue): value is JsonLike {
  if (value == null) return true
  if (typeof value === 'string') return true
  if (typeof value === 'number') return Number.isFinite(value)
  if (typeof value === 'boolean') return true
  if (Array.isArray(value)) return value.every(isJsonLikeValue)
  if (value instanceof Date) return false
  function isRecordLike(obj: AnyValue): obj is Record<string, AnyValue> {
    return typeof obj === 'object' && obj !== null && !Array.isArray(obj)
  }

  function getObjectPropertyFromAny(obj: AnyValue, key: string): AnyValue {
    if (!isRecordLike(obj)) return undefined
    const value = obj[key]
    return convertAnyToAnyValue(value)
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value)
    for (const key of keys) {
      const propVal = getObjectPropertyFromAny(value, key)
      if (!isJsonLikeValue(propVal)) return false
    }
    return true
  }
  return false
}
