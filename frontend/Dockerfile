FROM node:20-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

FROM base AS dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=${VITE_API_URL}
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN pnpm run build

FROM nginx:1.27-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
RUN printf 'server {\n\
    listen 80;\n\
    server_name _;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    add_header X-Frame-Options "SAMEORIGIN" always;\n\
    add_header X-Content-Type-Options "nosniff" always;\n\
\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
\n\
    location ~* \\.(?:js|css|woff2?|ttf|otf|eot|svg|png|jpg|jpeg|gif|ico)$ {\n\
        expires 30d;\n\
        add_header Cache-Control "public, immutable";\n\
        try_files $uri =404;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
