import { logger } from '@/core/logger'

import { useCallback, useEffect, useRef, useState } from 'react'

import apiCaller from 'core/endpoints/apiCaller'
import { getStoredToken } from 'core/stores/auth'

export interface WSMessage {
  type: string
  leaveId?: string
  status?: string
  postId?: string
  id?: string
  parentId?: string | null
  createdByUserId?: string
  replyToUserId?: string | null
  content?: string
  createdAt?: string
  authorName?: string
  replyToUserName?: string
}

function isWSMessage(payload: object): payload is WSMessage {
  return payload != null && typeof payload === 'object' && 'type' in payload
}

const getWsUrl = (): string => {
  const base = apiCaller.defaults.baseURL ?? ''
  return base.replace(/^http/, 'ws') + '/ws'
}

import type { AnyValue } from 'core/endpoints/caseTransform'

function convertAnyToAnyValue(value: AnyValue): AnyValue {
  return value
}

function parseJSONToAnyValue(text: string): AnyValue {
  const parsed = JSON.parse(text)
  return convertAnyToAnyValue(parsed)
}

function parseJSONSafe(text: string): object | null {
  try {
    const parsed = parseJSONToAnyValue(text)
    if (parsed == null || typeof parsed !== 'object' || Array.isArray(parsed)) return null
    return parsed
  } catch {
    return null
  }
}

export function useWebSocket(onMessage: (message: WSMessage) => void) {
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage

  const connect = useCallback(() => {
    const token = getStoredToken()
    if (!token) return
    const url = `${getWsUrl()}?token=${encodeURIComponent(token)}`
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => setConnected(true)
    ws.onclose = () => {
      setConnected(false)
      wsRef.current = null
      reconnectTimeoutRef.current = setTimeout(connect, 3000)
    }
    ws.onerror = (event: Event) => {
      logger.error('Error: useWebSocket', event)
    }
    ws.onmessage = (event: MessageEvent) => {
      try {
        if (typeof event.data !== 'string') return
        const parsed = parseJSONSafe(event.data)
        if (parsed == null) return
        if (isWSMessage(parsed)) onMessageRef.current(parsed)
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : error != null && typeof error === 'object'
              ? error
              : undefined
        logger.error('Error: useWebSocket', err)
      }
    }
  }, [])

  useEffect(() => {
    connect()
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      setConnected(false)
    }
  }, [connect])

  return { connected }
}
