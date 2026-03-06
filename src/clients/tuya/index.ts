import { TuyaContext } from '@tuya/tuya-connector-nodejs';

const tuyaClient = new TuyaContext({
  baseUrl: process.env.TUYA_ENDPOINT!,
  accessKey: process.env.TUYA_ACCESS_KEY!,
  secretKey: process.env.TUYA_SECRET_KEY!
});

export default tuyaClient;
