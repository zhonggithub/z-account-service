FROM FROM node:6

RUN mkdir /app
WORKDIR /app

ENV PORT=3000
ENV LOG_LEVEL=info
ENV NODE_ENV=production
ENV MONGO_DB=mongodb://mongodb/z-account-service

COPY . /app
RUN npm i --registry=https://registry.npm.taobao.org
RUN npm run build
CMD ["node", "/app/dist/app.js"]
EXPOSE 3000