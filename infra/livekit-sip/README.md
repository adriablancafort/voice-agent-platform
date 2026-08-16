# LiveKit SIP (self-hosted)

Phone-call bridge for inbound/outbound telephony. Follows [LiveKit SIP self-hosting](https://docs.livekit.io/transport/self-hosting/sip-server/).

Must use the **same Redis** and API key/secret as [`../livekit-server`](../livekit-server).

## Deploy

1. **VM** - Needs a public IP. Host networking is required so SIP/RTP ports bind on the host.

2. **Configure and copy**

```bash
cp .env.example .env
scp -r infra/livekit-sip root@YOUR_VM_IP:/opt/livekit-sip
ssh root@YOUR_VM_IP
cd /opt/livekit-sip
./start.sh
```

`start.sh` installs Docker/`docker-compose` if needed, loads `.env`, substitutes `${VARS}` into the config YAML, and starts the stack.

3. **Firewall**

```bash
sudo ufw allow 5060/tcp
sudo ufw allow 5060/udp
sudo ufw allow 10000:20000/udp
sudo ufw enable
```

SIP URI is `<public-ip>:5060`. Create trunks and dispatch rules via the LiveKit APIs/CLI against your server.
