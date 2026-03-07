import { useState, useEffect } from 'react';
import { getControllers } from '@/actions/controllers';

interface Controller {
  id: number;
  deviceId: string;
  type: string;
  name: string;
}

export default function useControllers() {
  const [controllers, setControllers] = useState<Controller[]>([]);

  useEffect(() => {
    async function fetchControllers() {
      try {
        const data = await getControllers();
        setControllers(data);
      } catch (error) {
        console.error('Error fetching controllers:', error);
      }
    }

    fetchControllers();
  }, []);

  return controllers;
}
