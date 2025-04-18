FROM node:20-alpine

WORKDIR /usr/src/app

RUN npm install --global pm2
RUN npm install --global gltf-pipeline

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE ${PORT}

CMD ["pm2-runtime", "start", "ecosystem.config.js"]