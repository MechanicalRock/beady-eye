FROM node:8.10

WORKDIR /app
COPY package.json /app
RUN yarn install

RUN yarn global add serverless

ENTRYPOINT '/bin/bash'
