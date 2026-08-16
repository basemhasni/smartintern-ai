FROM node:20.19.4-bookworm-slim AS base

RUN apt-get update \
  && apt-get install --yes --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

FROM base AS generator

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma

RUN npm ci \
  && npx prisma generate

FROM base AS production-dependencies

WORKDIR /app

COPY package.json package-lock.json ./

RUN PRISMA_SKIP_POSTINSTALL_GENERATE=true npm ci --omit=dev --omit=optional \
  && npm cache clean --force

FROM base AS runtime

ENV NODE_ENV=production \
    PORT=5000

WORKDIR /app

RUN groupadd --gid 10001 smartintern \
  && useradd --uid 10001 --gid smartintern --no-create-home --home-dir /app --shell /usr/sbin/nologin smartintern

COPY --from=production-dependencies --chown=smartintern:smartintern /app/node_modules ./node_modules
COPY --from=generator --chown=smartintern:smartintern /app/node_modules/.prisma ./node_modules/.prisma
COPY --chown=smartintern:smartintern package.json package-lock.json ./
COPY --chown=smartintern:smartintern prisma ./prisma
COPY --chown=smartintern:smartintern src ./src
COPY --chown=smartintern:smartintern scripts ./scripts

RUN mkdir -p uploads/cvs \
  && chown -R smartintern:smartintern uploads

USER smartintern

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 5000) + '/health').then((response) => { if (!response.ok) process.exit(1); }).catch(() => process.exit(1))"

CMD ["node", "src/server.js"]
