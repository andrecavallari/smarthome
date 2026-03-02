import mqttManager from '@/clients/mqtt';

export async function GET() {
  let unsubscribe: () => void;

  const stream = new ReadableStream({
    start(controller) {
      unsubscribe = mqttManager.addSSEClient((data) => {
        try {
          controller.enqueue(data);
        } catch {
          unsubscribe?.();
        }
      });
    },
    cancel() {
      unsubscribe?.();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
