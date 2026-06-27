import { useEffect, useRef, useCallback } from 'react';

type MessageHandler = (data: any) => void;

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

export function useWebSocket(onMessage?: MessageHandler) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<number>();

  const connect = useCallback(() => {
    const ws = new WebSocket(`${WS_URL}/ws/timer`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe_timer' }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage?.(data);
    };

    ws.onclose = () => {
      reconnectTimeout.current = window.setTimeout(connect, 3000);
    };
  }, [onMessage]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
      window.clearTimeout(reconnectTimeout.current);
    };
  }, [connect]);

  const send = useCallback((data: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { send };
}
