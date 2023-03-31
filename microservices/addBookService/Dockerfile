FROM node:14

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install kafkajs
RUN npm install pg
RUN npm install randomcolor
RUN npm install fs
RUN npm install axios
RUN npm install redis

COPY . .


CMD ["node", "consumer.js"]
