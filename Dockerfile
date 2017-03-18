MAINTAINER sic.hcq@gmail.com

RUN mkdir /app
WORKDIR /app

COPY package.tgz /tmp
RUN mkdir /tmp/app
RUN tar -xvf /tmp/package.tgz -C /tmp/app

RUN cp /tmp/app/package.json /app/package.json
RUN npm i --production --registry=https://registry.npm.taobao.org

RUN cp -r /tmp/app/dist /app/dist

CMD ["node", "/app/dist/app.js"]
EXPOSE 3000