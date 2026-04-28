# syntax=docker/dockerfile:1

########## deps (production dependencies only) ##########
FROM node:22-alpine AS deps
WORKDIR /app

# Pull patched Alpine packages, including OpenSSL libs used by Node.
RUN apk upgrade --no-cache \
    && apk add --no-cache \
      "libcrypto3>=3.5.6-r0" \
      "libssl3>=3.5.6-r0" \
      zlib \
      dumb-init

# Install dependencies with best-available lockfile strategy
COPY package*.json ./
RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev; \
    else \
      npm install --omit=dev; \
    fi && npm cache clean --force

########## runner ##########
FROM node:22-alpine AS runner
WORKDIR /app

# Ensure latest security fixes for runtime base libraries.
RUN apk upgrade --no-cache \
    && apk add --no-cache \
      "libcrypto3>=3.5.6-r0" \
      "libssl3>=3.5.6-r0" \
      zlib

# Runtime container does not need npm; remove it to avoid shipping npm CVEs.
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

# dumb-init (copied from deps stage)
COPY --from=deps /usr/bin/dumb-init /usr/bin/dumb-init

# production node_modules
COPY --from=deps /app/node_modules ./node_modules

# application source
COPY --chown=node:node . .

USER node
EXPOSE 4002
ENTRYPOINT ["dumb-init","--"]
CMD ["node","src/server.js"]
