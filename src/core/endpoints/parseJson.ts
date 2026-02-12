import { AnyValue, JsonLike } from './caseTransform'

function toAnyValue(raw: JsonLike): AnyValue {
  if (typeof raw === 'string') return raw
  if (typeof raw === 'number') return raw
  if (typeof raw === 'boolean') return raw
  if (raw === null) return raw
  if (Array.isArray(raw)) return raw.map(toAnyValue)
  const out: Record<string, AnyValue> = {}
  for (const key of Object.keys(raw)) {
    const val = raw[key]
    if (val !== undefined) out[key] = toAnyValue(val)
  }
  return out
}

/**
 * แปลง JSON string เป็น AnyValue
 * ไฟล์นี้ได้รับอนุญาตให้ใช้ผลจาก JSON.parse (ผ่าน eslint override)
 */
export function parseJSONToAnyValue(text: string): AnyValue {
  try {
    const raw: JsonLike = JSON.parse(text)
    return toAnyValue(raw)
  } catch {
    return null
  }
}
