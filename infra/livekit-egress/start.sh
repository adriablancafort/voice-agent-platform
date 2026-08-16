#!/bin/sh
set -e
cd "$(dirname "$0")"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

: "${LIVEKIT_API_KEY:?Set LIVEKIT_API_KEY}"
: "${LIVEKIT_API_SECRET:?Set LIVEKIT_API_SECRET}"
: "${LIVEKIT_URL:?Set LIVEKIT_URL}"
: "${REDIS_ADDRESS:?Set REDIS_ADDRESS}"

mkdir -p /usr/local/bin

if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
  sh /tmp/get-docker.sh
fi

if [ ! -x /usr/local/bin/docker-compose ]; then
  curl -L "https://github.com/docker/compose/releases/download/v5.0.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  chmod 755 /usr/local/bin/docker-compose
fi

systemctl enable docker
systemctl start docker || true

docker run --rm \
  -e LIVEKIT_API_KEY -e LIVEKIT_API_SECRET -e LIVEKIT_URL -e REDIS_ADDRESS \
  -v "$PWD":/work -w /work \
  alpine:3.20 \
  sh -c 'apk add -q gettext && envsubst < egress.yaml > egress.yaml.tmp && mv egress.yaml.tmp egress.yaml'

/usr/local/bin/docker-compose up -d
/usr/local/bin/docker-compose ps
