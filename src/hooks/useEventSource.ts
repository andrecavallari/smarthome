import { useEffect, useRef } from "react";

interface UseEventSourceProps<T = unknown> {
  onMessage: (data: T) => void;
  onConnect?: () => void;
  onError?: (error: unknown) => void;
}

export default function useEventSource<T = unknown>(path: string, { onMessage, onConnect, onError }: UseEventSourceProps<T>) {
  const onMessageRef = useRef(onMessage);
  const onConnectRef = useRef(onConnect);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onMessageRef.current = onMessage;
    onConnectRef.current = onConnect;
    onErrorRef.current = onError;
  }, [onMessage, onConnect, onError]);

  useEffect(() => {
    const es = new window.EventSource(path);

    es.onopen = (msg) => console.log('SSE connection opened', msg);

    es.onerror = (error) => onErrorRef.current?.(error);

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'connected':
          onConnectRef.current?.();
          break;
        case 'message':
          onMessageRef.current(data);
          break;
        case 'error':
          onErrorRef.current?.(data.message);
          break;
      }
    }

    return () => {
      es.close();
    };
  }, []);
}
