import crypto from 'crypto';
import { MD5, AES, enc, mode, pad } from 'crypto-js';
import WebSocket from 'ws';

function buildPassword(accessId: string, accessKey: string) {
  const key = MD5(accessKey).toString();
  return MD5(`${accessId}${key}`).toString().substring(8, 24);
}

function decrypt(data: string, accessKey: string, encryptionModel: string) {
  if (encryptionModel === 'aes_gcm') {
    return decryptByGCM(data, accessKey);
  }
  return decryptByECB(data, accessKey);
}

function decryptByECB(data: string, accessKey: string) {
  try {
    const realKey = enc.Utf8.parse(accessKey.substring(8, 24));
    const json = AES.decrypt(data, realKey, { mode: mode.ECB, padding: pad.Pkcs7 });
    return JSON.parse(enc.Utf8.stringify(json));
  } catch (e) {
    return '';
  }
}

function decryptByGCM(data: string, accessKey: string) {
  try {
    const bData = Buffer.from(data, 'base64');
    const iv = bData.slice(0, 12);
    const tag = bData.slice(-16);
    const cdata = bData.slice(12, bData.length - 16);
    const decipher = crypto.createDecipheriv('aes-128-gcm', accessKey.substring(8, 24), iv);
    decipher.setAuthTag(tag);
    let dataStr = decipher.update(cdata).toString('utf8');
    dataStr += decipher.final('utf8');
    return JSON.parse(dataStr);
  } catch (e) {
    return '';
  }
}

type SSEClient = (data: string) => void;

interface TuyaMessage {
  type: 'connected' | 'message' | 'error';
  payload?: unknown;
  message?: string;
  [key: string]: unknown;
}

class TuyaWebSocketManager {
  private ws: WebSocket | null = null;
  private clients = new Set<SSEClient>();
  private seenMessages = new Set<string>();
  private connecting = false;

  private broadcast(message: TuyaMessage) {
    const data = `data: ${JSON.stringify(message)}\n\n`;
    for (const client of this.clients) {
      try {
        client(data);
      } catch {
        this.clients.delete(client);
      }
    }
  }

  private connect() {
    if (this.ws || this.connecting) return;
    this.connecting = true;

    const accessId = process.env.TUYA_ACCESS_KEY!;
    const accessKey = process.env.TUYA_SECRET_KEY!;
    const password = buildPassword(accessId, accessKey);

    const envValue = 'event';
    const query = 'subscriptionType=Failover&ackTimeoutMillis=30000';
    const topicPath = `ws/v2/consumer/persistent/${accessId}/out/${envValue}/${accessId}-sub?${query}`;
    const url = `wss://mqe.tuyaus.com:8285/${topicPath}`;

    const ws = new WebSocket(url, {
      rejectUnauthorized: false,
      headers: { username: accessId, password },
    });

    ws.on('open', () => {
      this.connecting = false;
      this.ws = ws;
      console.log('Tuya WebSocket connected');
      this.broadcast({ type: 'connected' });
    });

    ws.on('message', (raw) => {
      try {
        const { payload, properties, ...others } = JSON.parse(raw.toString());

        ws.send(JSON.stringify({ messageId: others.messageId }));

        if (this.seenMessages.has(others.messageId)) return;
        this.seenMessages.add(others.messageId);

        const encryptionModel = properties.em;
        const pStr = Buffer.from(payload, 'base64').toString('utf-8');
        const pJson = JSON.parse(pStr);
        pJson.data = decrypt(pJson.data, accessKey, encryptionModel);

        this.broadcast({ type: 'message', payload: pJson, ...others });
      } catch (e) {
        console.error('Error processing message:', e);
      }
    });

    ws.on('ping', () => {
      ws.pong(accessId);
    });

    ws.on('error', (error) => {
      console.error('Tuya WebSocket error:', error);
      this.broadcast({ type: 'error', message: String(error) });
    });

    ws.on('close', () => {
      console.log('Tuya WebSocket closed');
      this.ws = null;
      this.connecting = false;
      this.seenMessages.clear();

      // Reconnect if there are still active clients
      if (this.clients.size > 0) {
        setTimeout(() => this.connect(), 3000);
      }
    });
  }

  subscribe(client: SSEClient): () => void {
    this.clients.add(client);

    if (this.ws) {
      // New client joins an already-connected socket — notify it immediately
      client(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
    } else {
      this.connect();
    }

    return () => {
      this.clients.delete(client);
      if (this.clients.size === 0 && this.ws) {
        this.ws.close();
        this.ws = null;
      }
    };
  }
}

const manager = new TuyaWebSocketManager();
export default manager;
