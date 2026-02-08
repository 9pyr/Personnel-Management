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

const getWsUrl = (): string => {
  const base = apiCaller.defaults.baseURL ?? ''
  return base.replace(/^http/, 'ws') + '/ws'
}

export function useWebSocket(onMessage: (msg: WSMessage) => void) {
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
    ws.onerror = () => {}
    ws.onmessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data as string) as WSMessage
        onMessageRef.current(msg)
      } catch {
        // ignore invalid JSON
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
