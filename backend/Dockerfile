FROM node:20-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

FROM base AS dependencies
RUN apk add --no-cache python3 make g++
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN pnpm run build && pnpm prune --prod

FROM base AS production
ENV NODE_ENV=production
COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist

USER node
EXPOSE 3000
CMD ["sh", "-c", "if [ \"$DB_SYNCHRONIZE\" = \"false\" ]; then pnpm run migration:run; fi && node dist/main"]
