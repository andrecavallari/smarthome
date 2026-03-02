export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { default: mqttManager } = await import('@/clients/mqtt');
    mqttManager.connect();

    mqttManager.subscribe('rf/received', (topic, payload) => {
      console.log(`[${topic}]`, payload);
    });

    mqttManager.subscribe('rf/learn', (topic, payload) => {
      console.log(`[${topic}]`, payload);
    });
  }
}
