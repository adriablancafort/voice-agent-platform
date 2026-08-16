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

/usr/local/bin/docker-compose up -d
