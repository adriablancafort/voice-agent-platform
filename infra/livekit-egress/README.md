# LiveKit Egress

Recording worker for call audio/video. Follows [LiveKit egress self-hosting](https://docs.livekit.io/transport/self-hosting/egress/).

Must use the **same Redis** and API key/secret as [`../livekit-server`](../livekit-server).

## Deploy

1. **VM sizing** - LiveKit recommends at least 4 CPUs and 4 GB RAM per egress instance.

2. **Configure and copy**

```bash
cp .env.example .env
scp -r infra/livekit-egress root@YOUR_VM_IP:/opt/livekit-egress
ssh root@YOUR_VM_IP
cd /opt/livekit-egress
./start.sh
```

`start.sh` loads `.env` and runs `docker-compose up -d`.
