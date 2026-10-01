FROM node:24-bookworm-slim

WORKDIR /app

# python3/make/g++ are needed to compile native deps (better-sqlite3, @discordjs/opus, sodium-native)
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

ENV NODE_ENV=production
VOLUME ["/app/data"]

CMD ["node", "dist/main.js"]
