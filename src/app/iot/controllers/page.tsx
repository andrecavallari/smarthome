'use client';

import useEventSource from '@/hooks/useEventSource';
import useControllers from '@/hooks/useControllers';
import Title from '@/components/iot/Title';

interface MqttEvent {
  type: string;
  topic: string;
  payload: number | string | boolean;
}

export default function Page() {
  const controllers = useControllers();

  useEventSource('/api/mqtt', {
    onConnect: () => console.log('Connected to MQTT SSE'),
    onMessage: (data: MqttEvent) => console.log(data)
  });

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Title>Controllers</Title>

      <p className="mt-4 text-gray-600">
        Controllers are hub&apos;s that connects one or more devices and multiple brands
      </p>

      <ul className="grid grid-cols-2 md:grid-cols-4 gap-3 mx-auto mt-8 mb-12">
        {controllers.map((controller) => (
          <li key={controller.id.toString()} className="border border-gray-300 rounded-lg p-4 bg-white text-gray-700 shadow-xl">
            <h3 className="text-sm font-bold">{controller.name}</h3>
            <p className="text-sm text-gray-500">{controller.type}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
