# LiveKit Egress (self-hosted)

Recording worker for call audio/video -> S3 or R2. Follows [LiveKit egress self-hosting](https://docs.livekit.io/transport/self-hosting/egress/).

Must use the **same Redis** and API key/secret as [`../livekit-server`](../livekit-server).

## Deploy

1. **VM sizing** - LiveKit recommends at least 4 CPUs and 4 GB RAM per egress instance. Prefer a dedicated VM so recordings do not steal CPU from the LiveKit server.

2. **Configure and copy**

```bash
cp .env.example .env
scp -r infra/livekit-egress root@YOUR_VM_IP:/opt/livekit-egress
ssh root@YOUR_VM_IP
cd /opt/livekit-egress
./start.sh
```

`start.sh` installs Docker/`docker-compose` if needed, loads `.env`, substitutes `${VARS}` into the config YAML, and starts the stack.

Compose keeps `cap_add: SYS_ADMIN` and `shm_size: 1gb` so Chrome can start. Point `REDIS_ADDRESS` at the LiveKit server Redis.
