FROM node:14-alpine

WORKDIR /app

COPY package*.json ./

RUN apk update

RUN apk add openssh

RUN npm i -g @nestjs/cli && npm install

EXPOSE 8081

CMD ["npm", "run", "start:dev"]
