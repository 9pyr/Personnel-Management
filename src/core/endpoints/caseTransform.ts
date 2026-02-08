/**
 * snake_case <-> camelCase key conversion for API request/response
 */

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`)
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)
}

function convertKeys<T>(obj: T, keyConverter: (key: string) => string): T {
  if (Array.isArray(obj)) {
    return obj.map(item => convertKeys(item, keyConverter)) as T
  }
  if (isPlainObject(obj)) {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      const newKey = keyConverter(key)
      result[newKey] = convertKeys(value, keyConverter)
    }
    return result as T
  }
  return obj
}

export function keysToCamelCase<T>(obj: T): T {
  return convertKeys(obj, toCamelCase)
}

export function keysToSnakeCase<T>(obj: T): T {
  return convertKeys(obj, toSnakeCase)
}
