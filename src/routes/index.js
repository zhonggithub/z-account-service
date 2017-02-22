import Router from 'koa-router';
import rawBody from 'raw-body';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { config } from '../common';
import account from './account';
import tenant from './tenant';
import application from './application';
import directory from './directory';
import tokens from './token';

const getBody = async (ctx, next) => {
  try {
    const body = await rawBody(ctx.req);
    ctx.request.body = JSON.parse(body);
  } catch (err) {
    ctx.throw(err, 400);
  }
  await next();
};

const auth = async (ctx, next) => {
  const { token } = ctx.header;
  try {
    const tokenData = jwt.verify(token, config.jwtKey);
    ctx.request.token = tokenData;
    ctx.req.token = tokenData;
  } catch (err) {
    ctx.throw(err, 401);
  }
  await next();
};

const auth1 = async (ctx, next) => {
  const { token } = ctx.header;
  try {
    const tokenData = jwt.verify(token, config.jwtKey);
    if (tokenData.key !== config.platormTeanantKey) {
      ctx.throw({ message: '无权访问！' }, 401);
    }
    ctx.request.token = tokenData;
    ctx.req.token = tokenData;
  } catch (err) {
    ctx.throw(err, 401);
  }
  await next();
};

const router = new Router();

const baseUrl = '/api/account/:version';
// api gateway
router.post(`${baseUrl}/tokens`, getBody, tokens.retrieveByIpList);

// tenant
const tenantBaseUrl = `${baseUrl}/tenants`;
const tenantUrl = `${tenantBaseUrl}/:id`;
router.post(tenantBaseUrl, auth1, getBody, tenant.create);
router.get(tenantUrl, auth, tenant.retrieve);
router.get(tenantBaseUrl, auth1, tenant.list);
router.post(tenantUrl, auth, getBody, tenant.update);
router.delete(tenantUrl, auth1, tenant.logicDelete);

// applaction
const applicationBaseUrl = `${baseUrl}/applications`;
const applicationUrl = `${applicationBaseUrl}/:id`;
router.post(applicationBaseUrl, auth, getBody, application.create);
router.get(applicationUrl, auth, application.retrieve);
router.get(applicationBaseUrl, auth, application.list);
router.post(applicationUrl, auth, getBody, application.update);
router.delete(applicationUrl, auth, application.logicDelete);
// router.post(`${applicationUrl}/loginAttempts`, auth, application.login);

// directory
const directoryBaseUrl = `${baseUrl}/directories`;
const directoryUrl = `${directoryBaseUrl}/:id`;
router.post(directoryBaseUrl, auth, getBody, directory.create);
router.get(directoryUrl, auth, directory.retrieve);
router.get(directoryBaseUrl, auth, directory.list);
router.post(directoryUrl, auth, getBody, directory.update);
router.delete(directoryUrl, auth, directory.logicDelete);

// account
const accountBaseUrl = `${baseUrl}/directories/:directoryId/accounts`;
const accountUrl = `${baseUrl}/accounts/:id`;
router.post(accountBaseUrl, auth, getBody, account.create);
router.post(accountUrl, auth, getBody, account.update);
router.get(accountUrl, auth, account.retrieve);
router.get(`${baseUrl}/directories/:directoryId/accounts`, auth, account.list);
router.delete(accountUrl, auth, account.logicDelete);

router.get('*', async (ctx) => {
  ctx.type = 'html';
  ctx.body = fs.createReadStream(`${__dirname}/../public/index.html`);
});

export default (app) => {
  app
    .use(router.routes())
    .use(router.allowedMethods());
};
