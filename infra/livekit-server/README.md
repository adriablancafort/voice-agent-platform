# LiveKit Server

LiveKit + Redis + Caddy. Follows [LiveKit VM self-hosting](https://docs.livekit.io/transport/self-hosting/vm/).

## Deploy

1. **DNS** - A records for `LIVEKIT_DOMAIN` and `TURN_DOMAIN` -> VM public IP (required before Caddy can issue certs).

2. **Configure and copy**

```bash
cp .env.example .env
scp -r infra/livekit-server root@YOUR_VM_IP:/opt/livekit
ssh root@YOUR_VM_IP
cd /opt/livekit
./start.sh
```

`start.sh` installs Docker/`docker-compose` if needed, loads `.env`, substitutes `${VARS}` into the config YAML, installs the `livekit-docker` systemd unit, and starts the stack. Run this before SIP, egress or the voice agent.

3. **Firewall**

```bash
sudo ufw allow 443/tcp          # HTTPS + TURN/TLS
sudo ufw allow 80/tcp           # TLS issuance
sudo ufw allow 7881/tcp         # WebRTC over TCP
sudo ufw allow 3478/udp         # TURN/UDP
sudo ufw allow 50000:60000/udp  # WebRTC over UDP
sudo ufw enable
```

4. **Verify**

```bash
curl https://livekit.yourdomain.com   # should return OK
```

App env:

```
LIVEKIT_URL=wss://livekit.yourdomain.com
LIVEKIT_API_KEY=<from .env>
LIVEKIT_API_SECRET=<from .env>
```
