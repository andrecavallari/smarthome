interface DeviceStatus {
  code: string;
  value: boolean | number | string;
}

interface Device {
  id: string;
  name: string;
  category: string;
  icon: string;
  ip?: string;
  lat?: number;
  lon?: number;
  local_key?: string;
  online: boolean;
  owner_id: string;
  product_id: string;
  product_name: string;
  status: DeviceStatus[];
}
