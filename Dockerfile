FROM node:lts-alpine as build-stage

WORKDIR /app
COPY . .

ENV NODE_ENV=production
ENV PORT=3000

VOLUME ["/app"]

RUN npm install
RUN npm build

EXPOSE $PORT
ENTRYPOINT [ "npm", "run", "production" ]