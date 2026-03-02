import mqtt, { type MqttClient } from 'mqtt';
import fs from 'fs';
import path from 'path';

type MessageHandler = (topic: string, payload: string) => void;
type SSEClient = (data: string) => void;

interface MqttMessage {
  type: 'connected' | 'message' | 'error' | 'disconnected';
  topic?: string;
  payload?: unknown;
  message?: string;
}

class MqttManager {
  private client: MqttClient | null = null;
  private sseClients = new Set<SSEClient>();
  private subscribers = new Map<string, Set<MessageHandler>>();
  private connected = false;

  private broadcast(message: MqttMessage) {
    const data = `data: ${JSON.stringify(message)}\n\n`;
    for (const client of this.sseClients) {
      try {
        client(data);
      } catch {
        this.sseClients.delete(client);
      }
    }
  }

  connect() {
    if (this.client) return;

    const host = process.env.MQTT_SERVER_URI!;
    const port = Number(process.env.MQTT_PORT) || 8883;
    const username = process.env.MQTT_USER!;
    const password = process.env.MQTT_PASSWORD!;

    const ca = fs.readFileSync(
      path.join(process.cwd(), 'src/misc/hivemq_certificate.ca')
    );

    this.client = mqtt.connect({
      host,
      port,
      protocol: 'mqtts',
      username,
      password,
      ca: [ca],
      rejectUnauthorized: true,
      reconnectPeriod: 5000,
      connectTimeout: 30000,
    });

    this.client.on('connect', () => {
      this.connected = true;
      console.log('MQTT connected to HiveMQ');
      this.broadcast({ type: 'connected' });
    });

    this.client.on('message', (topic, payload) => {
      const message = payload.toString();

      const handlers = this.subscribers.get(topic);
      if (handlers) {
        for (const handler of handlers) {
          handler(topic, message);
        }
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(message);
      } catch {
        parsed = message;
      }
      this.broadcast({ type: 'message', topic, payload: parsed });
    });

    this.client.on('error', (error) => {
      console.error('MQTT error:', error);
      this.broadcast({ type: 'error', message: String(error) });
    });

    this.client.on('disconnect', () => {
      this.connected = false;
      console.log('MQTT disconnected');
      this.broadcast({ type: 'disconnected' });
    });

    this.client.on('reconnect', () => {
      console.log('MQTT reconnecting...');
    });

    this.client.on('close', () => {
      this.connected = false;
    });
  }

  subscribe(topic: string, handler?: MessageHandler) {
    if (!this.client) return;

    this.client.subscribe(topic, (err) => {
      if (err) {
        console.error(`MQTT failed to subscribe to ${topic}:`, err);
      } else {
        console.log(`MQTT subscribed to ${topic}`);
      }
    });

    if (handler) {
      if (!this.subscribers.has(topic)) {
        this.subscribers.set(topic, new Set());
      }
      this.subscribers.get(topic)!.add(handler);
    }
  }

  publish(topic: string, message: string | Buffer) {
    if (!this.client || !this.connected) {
      console.warn('MQTT not connected, cannot publish');
      return;
    }
    this.client.publish(topic, message);
  }

  addSSEClient(client: SSEClient): () => void {
    this.sseClients.add(client);

    if (this.connected) {
      client(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
    }

    return () => {
      this.sseClients.delete(client);
    };
  }

  isConnected() {
    return this.connected;
  }
}

const mqttManager = new MqttManager();
export default mqttManager;