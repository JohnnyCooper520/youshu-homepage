FROM node:22-alpine AS build

WORKDIR /app

ARG VITE_SUPABASE_URL=""
ARG VITE_SUPABASE_ANON_KEY=""

ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN npm prune --omit=dev && npm cache clean --force

FROM node:22-alpine AS runtime

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8788

WORKDIR /app

COPY --chown=node:node --from=build /app/package.json /app/package-lock.json ./
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node --from=build /app/server ./server
COPY --chown=node:node --from=build /app/src ./src

USER node

EXPOSE 8788

CMD ["node", "server/production-server.js"]
