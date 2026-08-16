ARG NODE_VERSION=24
FROM node:${NODE_VERSION}-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apt-get update -qq && apt-get install --no-install-recommends -y ca-certificates && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@10

FROM base AS build

WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY apps/voice-agent/package.json ./apps/voice-agent/package.json

RUN pnpm install --frozen-lockfile --filter voice-agent...

COPY packages/shared ./packages/shared
COPY apps/voice-agent ./apps/voice-agent

RUN pnpm --filter voice-agent build

RUN cd apps/voice-agent && CI=true pnpm prune --prod

FROM base

ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/app" \
    --shell "/sbin/nologin" \
    --uid "${UID}" \
    appuser

WORKDIR /app

COPY --from=build --chown=appuser:appuser /app /app

USER appuser

WORKDIR /app/apps/voice-agent

ENV NODE_ENV=production

CMD [ "pnpm", "start" ]
