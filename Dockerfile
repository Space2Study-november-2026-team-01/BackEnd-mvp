FROM node:24-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

ENV NODE_ENV=production
EXPOSE 3000

RUN chown -R node:node /app
USER node

CMD ["node", "src/app.js"]
