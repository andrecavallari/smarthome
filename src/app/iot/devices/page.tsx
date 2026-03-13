'use client';

import Image from 'next/image';
import useEventSource from '@/hooks/useEventSource';
import useTuya from '@/hooks/useTuya';
import Device from '@/components/devices';
import Title from '@/components/iot/Title';

interface TuyaEvent {
  payload: {
    data: {
      devId: string;
      status: { code: string; value: boolean | number | string }[];
    };
  };
}

export default function Page() {
  const { devices, deviceCategories, updateDeviceStatus } = useTuya();
  const tuyabaseImageUrl = process.env.NEXT_PUBLIC_TUYA_IMAGES_BASE_URL!;

  useEventSource<TuyaEvent>('/api/tuya', {
    onConnect: () => console.log('Connected to Tuya SSE'),
    onMessage: (event) => {
      console.log('Received Tuya event:', event);
      const { devId } = event.payload.data;
      const { code, value } = event.payload.data.status[0];
      updateDeviceStatus(devId, code, value);
    }
   });

  return (
    <div className="max-w-4xl mx-auto p-4 mt-4">
      <Title>Devices</Title>
      <ul className="grid grid-cols-2 md:grid-cols-4 gap-3 mx-auto mt-8 mb-12">
        {devices.map((device) => (
          <li key={device.id} className="border border-gray-300 rounded-lg p-4 text-gray-700 shadow-xl bg-white">
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
    </div>
  );
}
