'use client';

import Image from 'next/image';
import useEventSource from '@/hooks/useEventSource';
import useTuya from '@/hooks/useTuya';
import useControllers from '@/hooks/useControllers';
import Device from '@/components/devices';
import { rfSceneLink } from '@/config/rfSceneLink';

interface TuyaEvent {
  payload: {
    data: {
      devId: string;
      status: { code: string; value: boolean | number | string }[];
    };
  };
}

interface MqttEvent {
  type: string;
  topic: string;
  payload: number | string | boolean;
}

export default function Page() {
  const { devices, deviceCategories, scenes, updateDeviceStatus } = useTuya();
  const controllers = useControllers();
  const tuyabaseImageUrl = process.env.NEXT_PUBLIC_TUYA_IMAGES_BASE_URL!;

  useEventSource<TuyaEvent>('/api/tuya', {
    onConnect: () => console.log('Connected to Tuya SSE'),
    onMessage: (event) => {
      console.log(event.payload.data);
      const { devId } = event.payload.data;
      const { code, value } = event.payload.data.status[0];
      updateDeviceStatus(devId, code, value);
    }
   });

  useEventSource('/api/mqtt', {
    onConnect: () => console.log('Connected to MQTT SSE'),
    onMessage: (data: MqttEvent) => console.log(data)
  });

  return (
    <div className="max-w-4xl mx-auto p-4 mt-4">
      <h1 className="text-2xl">Smart Home Management</h1>
      <p>This is the main dashboard for managing your smart home devices.</p>

      <h3 className="mt-12 text-2xl border-b border-b-gray-300 pb-4">Devices</h3>

      <ul className="grid grid-cols-2 md:grid-cols-4 gap-3 mx-auto mt-8 mb-12">
        {devices.map((device) => (
          <li key={device.id} className="border border-gray-300 rounded-lg p-4 text-gray-700 shadow-xl">
            <div className="flex justify-center">
              <Image src={`${tuyabaseImageUrl}/${device.icon}`} alt={device.name} width={64} height={64} />
            </div>
            <div className="min-h-16 mt-4">
              <h3 className="text-sm font-bold">{device.name}</h3>
              <p className='text-sm'>Category: {deviceCategories[device.category] || device.category}</p>
            </div>

            <Device device={device} />
          </li>
        ))}
      </ul>

      <h3 className="mt-12 text-2xl border-b border-b-gray-300 pb-4">Controllers</h3>
      <p className="mt-4 text-gray-600">Controllers are hub&apos;s that connects one or more devices and multiple brands</p>

      <ul className="grid grid-cols-2 md:grid-cols-4 gap-3 mx-auto mt-8 mb-12">
        {controllers.map((controller) => (
          <li key={controller.id} className="border border-gray-300 rounded-lg p-4 text-gray-700 shadow-xl">
            <h3 className="text-sm font-bold">{controller.name}</h3>
            <p className="text-sm text-gray-500">{controller.type}</p>
          </li>
        ))}
      </ul>

      <h3 className="mt-12 text-2xl border-b border-b-gray-300 pb-4">RF Scenes</h3>

      <ul className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 mx-auto mb-12">
        {rfSceneLink.map(item => (
          <li key={item.code} className="border border-gray-300 rounded-lg p-4 text-gray-700 shadow-xl">
            <h3 className="text-sm font-bold">{item.rfName}</h3>
            <p className='text-sm'>RF Code: {item.code}</p>
            <p className='text-sm'>Linked Scene ID: {scenes.find(scene => scene.scene_id === item.sceneId)?.name ||  item.sceneId}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
