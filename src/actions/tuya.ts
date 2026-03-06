'use server';

import tuya from '@/clients/tuya';
import { TuyaResponse } from '@tuya/tuya-connector-nodejs';

export async function getDevices(): Promise<Device[]> {
  const devices = await tuya.request<Promise<Device[]>>({
    method: 'GET',
    path:  `/v1.0/users/${process.env.TUYA_USER_ID}/devices`
  });

  return devices.result;
}

export async function listDeviceCategories(): Promise<Record<string, string>> {
  const categories = await tuya.request<Promise<{ code: string; name: string }[]>>({
    method: 'GET',
    path: `/v1.0/iot-03/device-categories`
  });

  const objects = (categories.result as unknown as { code: string; name: string }[])
    .map(({ code, name }) => ([code, name]));
  return Object.fromEntries(objects);
}

export async function getDeviceStatus(deviceId: string): Promise<{ code: string; value: boolean | number | string }[]> {
  const response = await tuya.request<Promise<{ code: string; value: boolean | number | string }[]>>  ({
    method: 'GET',
    path: `/v1.0/iot-03/devices/${deviceId}/status`
  });

  return response.result;
}

export interface SetSwitchStateResult {
  result: boolean;
  success: boolean;
  t: number;
  tid: string;
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
  }) as unknown as SetSwitchStateResult;

  return {
    result: response.result,
    success: response.success,
    t: response.t,
    tid: response.tid
  };
}

export async function getHomes() {
  return tuya.request({
    method: 'GET',
    path: `/v1.0/users/${process.env.TUYA_USER_ID}/homes`
  });
}

export async function listRooms() {
  return tuya.request({
    method: 'GET',
    path: `/v1.0/homes/${process.env.TUYA_HOME_ID}/rooms`
  })
}

export async function listRoomDevices(roomId: string) {
  return tuya.request({
    method: 'GET',
    path: `/v1.0/homes/${process.env.TUYA_HOME_ID}/rooms/${roomId}/devices`
  });
}

export async function listScenes(): Promise<TuyaResponse<{ success: boolean; result: Scene[] }>> {
  return tuya.request({
    method: 'GET',
    path: `/v1.1/homes/${process.env.TUYA_HOME_ID}/scenes`
  });
}

export async function activateScene(sceneId: string) {
  return tuya.request({
    method: 'POST',
    path: `/v1.0/homes/${process.env.TUYA_HOME_ID}/scenes/${sceneId}/trigger`
  });
}

export async function listAutomations() {
  return tuya.request({
    method: 'GET',
    path: `/v1.0/homes/${process.env.TUYA_HOME_ID}/automations`
  });
}
