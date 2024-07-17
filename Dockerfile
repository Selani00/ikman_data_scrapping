FROM node:latest

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 9090

ENV PORT 9090

CMD ["node", "test.js"]
