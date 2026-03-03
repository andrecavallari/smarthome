import { rfSceneLink } from '@/config/rfSceneLink';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { default: mqttManager } = await import('@/clients/mqtt');
    const { activateScene } = await import('@/actions/tuya');
    mqttManager.connect();

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
