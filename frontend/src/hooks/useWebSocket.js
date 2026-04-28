import { useEffect, useRef, useState, useCallback } from 'react'

const WS_URL = 'ws://localhost:8000/ws'

export function useWebSocket() {
  const [lastMessage, setLastMessage] = useState(null)
  const [connected, setConnected]     = useState(false)
  const wsRef = useRef(null)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      console.log('[WS] Connected to backend')
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setLastMessage(data)
      } catch (e) {
        console.warn('[WS] Could not parse message:', e)
      }
    }

    ws.onclose = () => {
      setConnected(false)
      console.log('[WS] Disconnected. Reconnecting in 3s...')
      setTimeout(connect, 3000)   // auto-reconnect
    }

    ws.onerror = (err) => {
      console.error('[WS] Error:', err)
    }
  }, [])

  useEffect(() => {
    connect()
    return () => wsRef.current?.close()
  }, [connect])

  return { lastMessage, connected }
}
