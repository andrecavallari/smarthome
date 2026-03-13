import awsIot from 'aws-iot-device-sdk';
import path from 'path';

const device = new awsIot.device({
  keyPath: path.join(__dirname, 'private.pem.key'),
  certPath: path.join(__dirname, 'certificate.pem.crt'),
  caPath: path.join(__dirname, 'AmazonRootCA1.pem'),
  clientId: 'esp32-test-01',
  host: 'iot.andre.srv.br',
  port: 8883,
  protocol: 'mqtts'
});


device.on('connect', () => {
  console.log('Connected to AWS IoT');
  device.subscribe('devices/esp32-test-01/status');
  device.publish('devices/esp32-test-01/status', JSON.stringify({ hello: 'from node' }));
});

device.on('message', (topic, payload) => {
  console.log('Message:', topic, payload.toString());
});

device.on('error', (err) => {
  console.error('Error:', err);
});
