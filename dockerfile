FROM node:20-alpine

WORKDIR /app

ADD package.json ./

COPY prisma ./prisma/

RUN npm install

COPY . .

CMD [ "npm", "run", "build" ]