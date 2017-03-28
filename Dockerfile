FROM hub.c.163.com/public/nodejs:5.7.0

RUN mkdir /app
WORKDIR /app

COPY . /app
RUN npm i --registry=https://registry.npm.taobao.org
RUN npm run build
CMD ["node", "/app/dist/app.js"]
EXPOSE 3000