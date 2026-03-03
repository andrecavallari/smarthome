import { useState, useEffect } from 'react';
import { getDevices, listDeviceCategories, listScenes } from '@/actions/tuya';

export default function useTuya() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceCategories, setDeviceCategories] = useState<Record<string, string>>({});
  const [scenes, setScenes] = useState<Scene[]>([]);

  const reload = async () => {
    const [devices, categories, scenes] = await Promise.all([
      getDevices(),
      listDeviceCategories(),
      listScenes()
    ]);

    setDevices(devices);
    setDeviceCategories(categories);
    setScenes(Array.isArray(scenes.result) ? scenes.result : []);
  }

  const updateDeviceStatus = (deviceId: string, deviceCode: string, value: boolean | number | string) => {
    setDevices((prevDevices) => {
      return prevDevices.map((device) => {
        if (device.id === deviceId) {
          const updatedStatus = device.status.map((status) => {
            if (status.code === deviceCode) {
              return { ...status, value };
            }
            return status;
          });
          return { ...device, status: updatedStatus };
        }
        return device;
      });
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      await reload();
    };
    fetchData();
  }, []);

  return { devices, deviceCategories, reload, updateDeviceStatus, scenes };
}
