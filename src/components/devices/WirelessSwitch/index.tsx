'use client';

import { JSX } from "react";

interface Input {
  device: Device;
}

export default function WirelessSwitch({ device }: Input): JSX.Element {
  const batteryPercentageStatus = device.status.find((s) => s.code === 'battery_percentage');
  const batteryPercentage = batteryPercentageStatus ? batteryPercentageStatus.value : null;
  const buttons = device.status.filter((s) => s.code.startsWith('switch_'));

  return (
    <ul>
      <li>Battery: {batteryPercentage !== null ? `${batteryPercentage}%` : 'N/A'}</li>
      {buttons.map((button) => (
        <li key={button.code}>
          <p>{button.code}: {String(button.value)}</p>
        </li>
      ))}
    </ul>
  );
}
