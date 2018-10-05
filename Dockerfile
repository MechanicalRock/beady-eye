FROM node:8.10

WORKDIR /app
COPY package.json /app
RUN yarn install && yarn global add serverless && yarn cache clean

USER node

ENTRYPOINT '/bin/bash'
