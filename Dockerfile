FROM node:20.9-bookworm

WORKDIR /app

WORKDIR /usr/app

COPY package.json .

RUN npm install --only=production && \
  npm cache clean --force && \
  npm install -g typescript && \
  npm install -g npm@10.1.0

COPY . .

RUN npm install pm2 -g

RUN npm run build

CMD ["pm2-runtime", "lib/index.js"]