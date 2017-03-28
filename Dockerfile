FROM hub.c.163.com/nce2/nodejs:0.12.2

RUN mkdir /app
WORKDIR /app

COPY . /app
RUN npm i --production --registry=https://registry.npm.taobao.org
RUN npm run build
RUN cp -r /tmp/app/dist /app/dist
CMD ["node", "/app/dist/app.js"]
EXPOSE 3000