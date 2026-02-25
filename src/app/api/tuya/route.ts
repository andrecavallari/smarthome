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

export async function GET() {
  const accessId = process.env.TUYA_ACCESS_KEY!;
  const accessKey = process.env.TUYA_SECRET_KEY!;
  const password = buildPassword(accessId, accessKey);

  const envValue = 'event';
  const query = 'subscriptionType=Failover&ackTimeoutMillis=30000';
  const topicPath = `ws/v2/consumer/persistent/${accessId}/out/${envValue}/${accessId}-sub?${query}`;
  const url = `wss://mqe.tuyaus.com:8285/${topicPath}`;

  let ws: WebSocket;

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      const seenMessages = new Set<string>();

      const enqueue = (data: string) => {
        if (!closed) controller.enqueue(data);
      };

      const close = () => {
        if (closed) return;
        closed = true;
        if (ws.readyState === WebSocket.OPEN) ws.close();
        try { controller.close(); } catch {}
      };

      ws = new WebSocket(url, {
        rejectUnauthorized: false,
        headers: { username: accessId, password },
      });

      ws.on('open', () => {
        enqueue(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
      });

      ws.on('message', (raw) => {
        try {
          const { payload, properties, ...others } = JSON.parse(raw.toString());

          // Always ack immediately to prevent redelivery
          ws.send(JSON.stringify({ messageId: others.messageId }));

          // Skip duplicate messages
          if (seenMessages.has(others.messageId)) return;
          seenMessages.add(others.messageId);

          const encryptionModel = properties.em;
          const pStr = Buffer.from(payload, 'base64').toString('utf-8');
          const pJson = JSON.parse(pStr);
          pJson.data = decrypt(pJson.data, accessKey, encryptionModel);

          enqueue(`data: ${JSON.stringify({ type: 'message', payload: pJson, ...others })}\n\n`);
        } catch (e) {
          console.error('Error processing message:', e);
        }
      });

      ws.on('ping', () => {
        ws.pong(accessId);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        enqueue(`data: ${JSON.stringify({ type: 'error', message: String(error) })}\n\n`);
      });

      ws.on('close', () => close());
    },
    cancel() {
      if (ws) ws.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
