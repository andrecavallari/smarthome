'use client';

import { JSX } from "react";
import { Pointer } from 'lucide-react';
import { setSwitchState } from '@/actions/tuya';

interface Input {
  device: Device;
}

export default function WirelessSwitch({ device }: Input): JSX.Element {
  const batteryPercentageStatus = device.status.find((s) => s.code === 'battery_percentage');
  const batteryPercentage = batteryPercentageStatus ? batteryPercentageStatus.value : null;
  // const buttons = device.status.filter((s) => s.code.startsWith('switch_'));

  // const handleClick = async (buttonCode: string) => {
  //   console.log(`Button ${buttonCode} clicked on device ${device.id}`);
  //   await setSwitchState(device.id, buttonCode, true);
  // }

  return (
    <div>
      <div>Battery: {batteryPercentage !== null ? `${batteryPercentage}%` : 'N/A'}</div>
      {/* <div className="flex flex-row justify-center gap-4 mt-4">
        {buttons.map((button) => (
          <button
            key={button.code}
            className="flex items-center space-x-2 cursor-pointer rounded-full p-2 bg-gray-400"
            onClick={() => handleClick(button.code)}
          >
            <Pointer className="text-white" />
          </button>
        ))}
      </div> */}
    </div>
  );
}
