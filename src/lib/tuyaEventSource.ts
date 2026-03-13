export default function tuyaEventSource({
  onMessage,
  onConnect,
  onerror
}: {
  onMessage: (data: unknown) => void;
  onConnect?: () => void;
  onerror?: (error: unknown) => void;
}) {
  const es = new EventSource('/api/tuya');

  es.onopen = () => {
    if (onConnect) {
      onConnect();
    }
  };

  es.onerror = (error) => {
    if (onerror) {
      onerror(error);
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
        if (onerror) onerror(data.message);
        break;
    }
  }

  return es;
}
