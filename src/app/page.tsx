'use client';

import Image from 'next/image';
import useEventSource, { Payload } from '@/hooks/useEventSource';
import useTuya from '@/hooks/useTuya';
import Device from '@/components/devices';
import { rfSceneLink } from '@/config/rfSceneLink';

export default function Page() {
  const { devices, deviceCategories, scenes, updateDeviceStatus } = useTuya();
  const tuyabaseImageUrl = process.env.NEXT_PUBLIC_TUYA_IMAGES_BASE_URL!;

  const onConnect = () => {
    console.log('Connected to Tuya SSE');
  }

  const onMessage = (event: Payload): void => {
    console.log(event);
    const { devId } = event.data;
    const { code, value } = event.data.status[0];
    updateDeviceStatus(devId, code, value);
  }

  useEventSource({onConnect, onMessage});

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
