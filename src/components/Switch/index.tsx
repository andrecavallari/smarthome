'use client';

import { Power, LoaderCircle } from 'lucide-react';
import { setSwitchState } from '@/actions/tuya';
import { useState } from 'react';

interface SwitchProps {
  device: Record<string, any>;
}

export default function Switch({ device }: SwitchProps) {
  const [loading, setLoading] = useState(null);
  const switches = device.status.filter((status) => status.code.match(/switch_\d+/));

  const handleToggle = async (switchCode) => {
    try {
      const currentStatus = switches.find((s) => s.code === switchCode)?.value;
      setLoading(switchCode);
      await setSwitchState(device.id, switchCode, !currentStatus);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-row justify-center gap-4 mt-4">
      {switches.map((switchStatus) => (
        <button
          key={switchStatus.code}
          className={'flex items-center space-x-2 cursor-pointer rounded-full p-2 ' + (switchStatus.value ? 'bg-green-400' : 'bg-gray-400')}
          onClick={() => handleToggle(switchStatus.code)}
        >
          {loading === switchStatus.code ?
            <LoaderCircle size={22} className="text-white animate-spin" /> :
            <Power size={22} className="text-white" />
          }
        </button>
      ))}
    </div>
  );
}
