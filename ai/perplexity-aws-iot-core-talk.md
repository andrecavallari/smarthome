1. Workload and cost
Example workload: ~30 devices, ~300 MQTT messages/day total (≈270k msgs/month).

AWS IoT Core pricing: about 1 USD / 1M messages, so this is ≈0.27 USD/month for messaging plus ≈0.10 USD/month connectivity if always online. Both are fully covered by the free tier during the first 12 months.

2. Auth options and why we chose X.509
JWT / Custom Authorizer (we decided not to use now)
AWS IoT Core does not offer “native JWT MQTT auth” like some platforms; instead you can use Custom Authorizers (Lambda) that validate JWTs sent in MQTT username/password.

Flow: backend issues JWT → device connects via MQTT over TLS 443 with JWT → IoT invokes Lambda authorizer → Lambda returns IoT policy for that connection.

This adds complexity (Lambda, JWT issuance, custom auth logic), so we parked this approach for later.

X.509 per device (chosen for now)
AWS IoT’s “happy path” is X.509 client certificates per device, validated over TLS to the IoT data endpoint (*-ats.iot.<region>.amazonaws.com).

Pros: fully supported, many examples for ESP32 and Node.js, no JWT/custom Lambda or extra backend needed.

You create:

One Thing per device (registry entry).

One X.509 cert + private key per device.

One shared IoT policy template attached to all certs.

3. Things, policies, and per-device isolation
Why one Thing per device
Thing = digital representation of a device in the IoT registry, with name, attributes, links to certs/policies, and optional Shadow.

Best practice: single identity per physical device, so you can revoke, rotate, and audit independently.

Policy basics
IoT policies control what an authenticated client can connect, publish, subscribe, and receive.

Minimal “allow all” policy for testing (not production):

json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["iot:Connect"],
      "Resource": "arn:aws:iot:us-east-1:121630798735:client/*"
    },
    {
      "Effect": "Allow",
      "Action": ["iot:Publish","iot:Receive"],
      "Resource": "arn:aws:iot:us-east-1:121630798735:topic/*"
    },
    {
      "Effect": "Allow",
      "Action": ["iot:Subscribe"],
      "Resource": "arn:aws:iot:us-east-1:121630798735:topicfilter/*"
    }
  ]
}
This lets any device talk to any topic; good only for debugging.

Why “allow all” is bad in production
If any device or key is compromised, attacker can impersonate any clientId and publish/subscribe to all topics (entire fleet compromised).

You cannot isolate a rogue device; you’d need to rotate everything.

Production-style shared policy template
Keep one cert per device but reuse a single shared policy that scopes access using policy variables, e.g. ${iot:ClientId}.

Example template (per-device topics):

json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["iot:Connect"],
      "Resource": "arn:aws:iot:us-east-1:121630798735:client/${iot:ClientId}"
    },
    {
      "Effect": "Allow",
      "Action": ["iot:Publish","iot:Receive"],
      "Resource": "arn:aws:iot:us-east-1:121630798735:topic/devices/${iot:ClientId}/*"
    },
    {
      "Effect": "Allow",
      "Action": ["iot:Subscribe"],
      "Resource": "arn:aws:iot:us-east-1:121630798735:topicfilter/devices/${iot:ClientId}/*"
    }
  ]
}
${iot:ClientId} is replaced at runtime by the MQTT clientId the device used when connecting.

This assumes clientId = Thing name = per-device identifier.

4. IoT endpoint and custom domain
Finding the MQTT endpoint
IoT Core → Settings → Device data endpoint: looks like xxxxx-ats.iot.us-east-1.amazonaws.com. This is used for MQTT (port 8883) and WSS (/mqtt).

CLI: aws iot describe-endpoint --endpoint-type iot:Data-ATS.

Using your own domain (e.g. iot.yourdomain.com)
Request a public ACM certificate for iot.yourdomain.com (no export needed).

IoT Core → Domain configurations → Create domain configuration:

Domain name: iot.yourdomain.com.

Service type: DATA (implicit in some UIs).

Server certificate: select ACM cert.

DNS: create CNAME iot.yourdomain.com → your *-ats.iot.us-east-1.amazonaws.com endpoint.

Wait for ACM DNS validation (usually minutes, up to ~30 min) and for IoT domain config to become active (can take up to ~60 min).

Devices and apps use iot.yourdomain.com:8883 for MQTT or wss://iot.yourdomain.com/mqtt for WSS.

5. Generating and attaching X.509 certificates
One-click certificate via console
IoT Core → Security → Certificates → Create.

One-click certificate creation (recommended) → Create certificate.

Download:

Device certificate (*.cert.pem).

Private key (*.private.key).

Amazon Root CA 1 (AmazonRootCA1.pem).

Activate cert and attach policy (DevicePolicy-…).

Attach the cert to the Thing: Security → Certificates → cert → Attach thing.

CLI-based creation (for scripting)
bash
aws iot create-keys-and-certificate \
  --set-as-active \
  --certificate-pem-outfile device-cert.pem \
  --public-key-outfile device-public.key \
  --private-key-outfile device-private.key
Then attach policy and Thing via console or CLI.

6. Node.js backend client (MQTT over TLS with certs)
Using aws-iot-device-sdk:

bash
npm install aws-iot-device-sdk
js
const awsIot = require('aws-iot-device-sdk');

const device = awsIot.device({
  keyPath:  '/path/device-private.key',
  certPath: '/path/device-cert.pem',
  caPath:   '/path/AmazonRootCA1.pem',
  clientId: 'esp32-test-01',               // Thing name
  host:     'iot.yourdomain.com',          // or *-ats.iot.us-east-1.amazonaws.com
  port:     8883,
  protocol: 'mqtts',
  debug:    true
});

device.on('connect', () => {
  console.log('Connected');
  device.subscribe('devices/esp32-test-01/status');
  device.publish('devices/esp32-test-01/status', JSON.stringify({ hello: 'from node' }));
});

device.on('error', console.error);
Requirements:

Cert ACTIVE, attached to Thing and policy.

Correct CA file (AmazonRootCA1), matching host.

7. ESP32 device client (Arduino-style)
Simplified pattern (WiFiClientSecure + PubSubClient):

Store three PEMs as C strings in certs.h: AmazonRootCA1, device cert, device key.

In code:

cpp
WiFiClientSecure net;
PubSubClient client(net);

net.setCACert(AWS_CERT_CA);
net.setCertificate(AWS_CERT_CRT);
net.setPrivateKey(AWS_CERT_PRIVATE);

client.setServer("iot.yourdomain.com", 8883);
client.connect("esp32-test-01");
client.subscribe("devices/esp32-test-01/status");
client.publish("devices/esp32-test-01/status", "hello from ESP32");
Keep clientId aligned with the Thing name and policy.

8. MQTTX testing with certificates
Host: iot.yourdomain.com or raw IoT endpoint.

Port: 8883.

Client ID: same as Thing name.

TLS settings: enable SSL/TLS and select:

CA: AmazonRootCA1.pem.

Client certificate: device-cert.pem.

Client key: device-private.key.

Common error: OPENSSL_internal:NO_START_LINE means one of those files is not a valid PEM (no -----BEGIN ...-----).

9. Multi-tenant structure (many customers, many devices)
With ~10,000 customers × 10 devices each (~100k devices):

One Thing and one X.509 certificate per device.

Shared policy template using ${iot:ClientId} for per-device topic isolation.

Per-customer metadata:

Thing attributes: customerUuid, customerId (numeric).

Thing Groups: customers/<customerUuid> grouping all that customer’s Things.

Topics:

Telemetry: devices/<clientUuid>/<deviceId>/telemetry.

Commands: devices/<clientUuid>/<deviceId>/commands.

Backend maps DB clients (id + uuid) to Thing names and groups and uses topic filters per customer.

10. Production provisioning patterns
For small/medium volumes (now):

Scripted “pre-baked” provisioning:

Script calls CreateKeysAndCertificate, CreateThing, AttachThingPrincipal, AttachPolicy for each device.

Factory flashes cert + key + endpoint into each device.

For large volumes later:

Fleet Provisioning by claim:

All devices share a limited “claim” cert at factory time.

On first boot, device connects with claim cert, calls Fleet Provisioning, gets its own unique cert + Thing, and stores it.

Good for tens/hundreds of thousands of devices via automated manufacturing.

If you bookmark this chat, you can reuse these sections as your “AWS IoT design doc”. Next time you come back, we can dive deeper into either Fleet Provisioning or per-tenant access control when you’re ready.

Is there any specific section here that you’d like expanded into more step-by-step “run these commands / click these buttons” style instructions?
