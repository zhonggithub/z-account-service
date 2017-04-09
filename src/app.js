/*
 * @Author: Zz
 * @Date: 2017-01-02 16:22:01
 * @Last Modified by: Zz
 * @Last Modified time: 2017-04-09 22:06:32
 */
import Koa from 'koa';
import koaConvert from 'koa-convert';
import koaBunyanLogger from 'koa-bunyan-logger';
import koaStaticCache from 'koa-static-cache';
import cors from 'koa2-cors';
import { setLocal } from 'z-error';
import './env';
import initDB from './initDB';
import routes from './routes';
import { dbOrm, config } from './common';
import dbConfig from './dbConfig';

setLocal('zh-cn');

const app = new Koa();

const errorHandler = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = { code: err.code, message: err.message, description: err.description };
  }
};

const successHandler = async (ctx, next) => {
  await next();
  ctx.response.set('X-Server-Request-Id', ctx.reqId);
  if (!ctx.status || (ctx.status >= 200 && ctx.status < 400)) {
    if (ctx.formatBody !== false) {
      ctx.body = {
        code: 0,
        message: 'success',
        data: ctx.body,
      };
    }
  }
};

app.use(cors())
  .use(koaConvert(koaStaticCache(`${__dirname}/public/`, {
    prefix: process.env.APP_PREFIX,
    maxAge: 100000000000,
  })))
  .use(successHandler)
  .use(errorHandler)
  .use(koaConvert(koaBunyanLogger({
    name: process.env.APP_NAME,
    level: (
      process.env.NODE_ENV === 'test'
        ? 'fatal'
        : process.env.LOG_LEVEL
    ),
  })))
  .use(koaConvert(koaBunyanLogger.requestIdContext()))
  .use(koaConvert(koaBunyanLogger.requestLogger()));

app.proxy = true;
routes(app);

export default app;

dbOrm.orm.initialize(dbConfig, (err, models) => {
  if (err) {
    throw err;
  }
  dbOrm.models = models;
  dbOrm.collections = models.collections;
  if (config.initDB === true || process.env.NODE_ENV === 'test') {
    initDB((error) => {
      if (error) {
        throw error;
      }
      if (!module.parent) {
        app.listen(process.env.PORT);
      }
    });
    return;
  }
  if (!module.parent) {
    app.listen(process.env.PORT);
  }
});
