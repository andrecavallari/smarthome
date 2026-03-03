import { useState, useEffect } from 'react';
import { listAutomations } from '@/actions/tuya';

export default function useAutomations() {
  const [automations, setAutomations] = useState([]);

  useEffect(() => {
    async function fetchAutomations() {
      try {
        const data = await listAutomations();
        console.log(data);
        setAutomations(data.result);
      } catch (error) {
        console.error('Error fetching automations:', error);
      }
    }

    fetchAutomations();
  }, []);

  return automations;
}
