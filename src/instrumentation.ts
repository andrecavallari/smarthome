import { rfSceneLink } from '@/config/rfSceneLink';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { default: mqttManager } = await import('@/clients/mqtt');
    const { activateScene } = await import('@/actions/tuya');
    mqttManager.connect();

    mqttManager.subscribe('devices/connected', async (topic, payload) => {
      console.log(`[${topic}]`, payload);

      try {
        const { default: db } = await import('@/clients/db');
        const { deviceId, type } = JSON.parse(payload);

        const exists = await db('controllers').where({ deviceId }).first();
        if (!exists) {
          await db('controllers').insert({ deviceId, type, name: deviceId });
          console.log(`Controller saved: ${deviceId} (${type})`);
        }
      } catch (err) {
        console.error('Failed to save controller:', err);
      }
    });

    mqttManager.subscribe('rf/received', async (topic, payload) => {
      console.log(`[${topic}]`, payload);
      const scene = rfSceneLink.find(item => item.code === payload);
      if (scene) {
        console.log(`Received RF code ${payload}, activate scene ${scene.sceneId}`);
        activateScene(scene.sceneId);
      }
    });

    mqttManager.subscribe('rf/learn', (topic, payload) => {
      console.log(`[${topic}]`, payload);
    });
  }
}
