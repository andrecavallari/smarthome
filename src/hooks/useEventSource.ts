import { useEffect, useRef } from "react";

interface UseEventSourceProps {
  onMessage: (data: Payload) => void;
  onConnect?: () => void;
  onError?: (error: unknown) => void;
}

export interface Payload {
  data: {
    dataId: string;
    devId: string;
    status: { code: string; value: boolean | number | string }[];
  }
}

export default function useEventSource({ onMessage, onConnect, onError }: UseEventSourceProps) {
  const onMessageRef = useRef(onMessage);
  const onConnectRef = useRef(onConnect);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onMessageRef.current = onMessage;
    onConnectRef.current = onConnect;
    onErrorRef.current = onError;
  }, [onMessage, onConnect, onError]);

  useEffect(() => {
    const es = new window.EventSource('/api/tuya');

    es.onopen = (msg) => console.log('SSE connection opened', msg);

    es.onerror = (error) => onErrorRef.current?.(error);

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'connected':
          onConnectRef.current?.();
          break;
        case 'message':
          onMessageRef.current(data.payload);
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
