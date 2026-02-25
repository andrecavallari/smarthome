'use client';

import Image from 'next/image';
import useEventSource from '@/lib/useEventSource';
import useDevices from '@/lib/useDevices';
import Switch from '@/components/Switch';

export default function Page() {
  const { devices, deviceCategories, updateDeviceStatus } = useDevices();
  const tuyabaseImageUrl = process.env.NEXT_PUBLIC_TUYA_IMAGES_BASE_URL!;

  const onConnect = () => {
    console.log('Connected to Tuya SSE');
  }

  const onMessage = (event: MessageEvent) => {
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

      <ul className="grid grid-cols-1 md:grid-cols-4 gap-4 mx-auto mt-12 mb-12">
        {devices.map((device) => (
          <li key={device.id} className="border border-gray-300 rounded-lg p-4 text-gray-700 shadow-xl">
            <div className="flex justify-center">
              <Image src={`${tuyabaseImageUrl}/${device.icon}`} alt={device.name} width={64} height={64} />
            </div>
            <div className="min-h-16 mt-4">
              <h3 className="text-sm font-bold">{device.name}</h3>
              <p className='text-sm'>Category: {deviceCategories[device.category] || device.category}</p>
            </div>

            {['kg', 'tdq'].includes(device.category) && (
              <Switch device={device} />
            )}
          </li>
        ))}
      </ul>

      <pre>{JSON.stringify(devices, null, 2)}</pre>
      {/* <pre>{JSON.stringify(deviceCategories, null, 2)}</pre> */}
    </div>
  );
}
