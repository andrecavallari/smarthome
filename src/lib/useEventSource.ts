import { useEffect } from "react";

interface UseEventSourceProps {
  onMessage: (data: Payload) => void;
  onConnect?: () => void;
  onError?: (error: unknown) => void;
}

interface Payload {
  data: {
    dataId: string;
    devId: string;
    status: { code: string; value: boolean | number | string }[];
  }
}

export default function useEventSource({ onMessage, onConnect, onError }: UseEventSourceProps) {
  useEffect(() => {
    const es = new window.EventSource('/api/tuya');

    es.onopen = (msg) => {
      console.log('SSE connection opened', msg);
      if (onConnect) {
        onConnect();
      }
    };

    es.onerror = (error) => {
      if (onError) {
        onError(error);
      }
    };

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'connected':
          if (onConnect) onConnect();
          break;
        case 'message':
          onMessage(data.payload);
          break;
        case 'error':
          if (onError) onError(data.message);
          break;
      }
    }

    return () => {
      es.close();
    };
  }, [onMessage, onConnect, onError]);
}
