'use client';

import { JSX } from 'react';
import Switch from './Switch';
import WirelessSwitch from './WirelessSwitch';

const categories: Record<string, ({ device }: { device: DeviceWithCategory }) => JSX.Element> = {
  kg: Switch,
  tdq: Switch,
  wxkg: WirelessSwitch
};

interface DeviceWithCategory extends Device {
  category: string;
}

export default function Device({ device }: { device: DeviceWithCategory }) {
  const Component = categories[device.category];
  if (!Component) return null;
  return <Component device={device} />;
}
