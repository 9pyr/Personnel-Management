import { camelCase, snakeCase } from 'lodash'

type JsonLike = object | string | number | boolean | null

function isPlainObject(value: JsonLike): value is Record<string, JsonLike> {
  return (
    typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)
  )
}

function convertKeys(obj: JsonLike, keyConverter: (key: string) => string): JsonLike {
  if (Array.isArray(obj)) {
    return obj.map(item => convertKeys(item, keyConverter))
  }
  if (isPlainObject(obj)) {
    const result: Record<string, JsonLike> = {}
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
