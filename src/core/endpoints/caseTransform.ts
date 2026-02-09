/**
 * snake_case <-> camelCase key conversion for API request/response
 */

type JsonLike = object | string | number | boolean | null

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_match, character) => character.toUpperCase())
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, character => `_${character.toLowerCase()}`)
}

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
  return convertKeys(obj, toCamelCase)
}

export function keysToSnakeCase(obj: JsonLike): JsonLike {
  return convertKeys(obj, toSnakeCase)
}
