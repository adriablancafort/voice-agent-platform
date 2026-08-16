#!/bin/sh
set -e
cd "$(dirname "$0")"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

: "${LIVEKIT_DOMAIN:?Set LIVEKIT_DOMAIN}"
: "${TURN_DOMAIN:?Set TURN_DOMAIN}"
: "${LIVEKIT_API_KEY:?Set LIVEKIT_API_KEY}"
: "${LIVEKIT_API_SECRET:?Set LIVEKIT_API_SECRET}"

mkdir -p caddy_data
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
  -e LIVEKIT_DOMAIN -e TURN_DOMAIN -e LIVEKIT_API_KEY -e LIVEKIT_API_SECRET \
  -v "$PWD":/work -w /work \
  alpine:3.20 \
  sh -c 'apk add -q gettext && envsubst < livekit.yaml > livekit.yaml.tmp && mv livekit.yaml.tmp livekit.yaml && envsubst < caddy.yaml > caddy.yaml.tmp && mv caddy.yaml.tmp caddy.yaml'

cat << EOF > /etc/systemd/system/livekit-docker.service
[Unit]
Description=LiveKit Server Container
After=docker.service
Requires=docker.service

[Service]
LimitNOFILE=500000
Restart=always
WorkingDirectory=$PWD
ExecStartPre=/usr/local/bin/docker-compose -f docker-compose.yaml down
ExecStart=/usr/local/bin/docker-compose -f docker-compose.yaml up
ExecStop=/usr/local/bin/docker-compose -f docker-compose.yaml down

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable livekit-docker
systemctl restart livekit-docker
