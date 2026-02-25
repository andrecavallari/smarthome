'use server';

import tuya from '@/clients/tuya';

export async function getDevices(): Promise<Device[]> {
  const devices = await tuya.request({
    method: 'GET',
    path:  `/v1.0/users/${process.env.TUYA_USER_ID}/devices`
  });

  return devices.result;
}

export async function listDeviceCategories(): Promise<Record<string, string>> {
  const categories = await tuya.request({
    method: 'GET',
    path: `/v1.0/iot-03/device-categories`
  });

  const objects = (categories.result as unknown as { code: string; name: string }[])
    .map(({ code, name }) => ([code, name]));
  return Object.fromEntries(objects);
}

export async function getDeviceStatus(deviceId: string): Promise<{ code: string; value: boolean | number | string }[]> {
  const response = await tuya.request({
    method: 'GET',
    path: `/v1.0/iot-03/devices/${deviceId}/status`
  });

  return response.result;
}

export interface SetSwitchStateResult {
  result: boolean;
  success: boolean;
}

export async function setSwitchState(deviceId: string, switchId: string, value: boolean): Promise<SetSwitchStateResult> {
  const response = await tuya.request({
    method: 'POST',
    path: `/v1.0/iot-03/devices/${deviceId}/commands`,
    body: {
      commands: [
        {
          code: switchId,
          value: value
        }
      ]
    }
  });

  return {
    result: response.result,
    success: response.success
  } as SetSwitchStateResult;
}
