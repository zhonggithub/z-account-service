import Router from 'koa-router';
import moment from 'moment';
import rawBody from 'raw-body';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { config } from '../common';
import account from './account';
import tenant from './tenant';
import application from './application';
import directory from './directory';
import tokens from './token';
import group from './group';
import accountStoreMapping from './accountStoreMapping';
import groupMembership from './groupMembership';

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
    if (moment().unix() > tokenData.exp) {
      ctx.throw({ message: 'token已过期' }, 401);
    }
    ctx.request.token = tokenData;
    ctx.req.token = tokenData;
  } catch (err) {
    ctx.throw(err, 401);
  }
  await next();
};

// 平台管理人员认证
const auth1 = async (ctx, next) => {
  const { token } = ctx.header;
  try {
    const tokenData = jwt.verify(token, config.jwtKey);
    if (moment().unix() > tokenData.exp) {
      ctx.throw({ message: 'token已过期' }, 401);
    }
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

const baseUrl = '/api/accountService/:version';
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
router.post(`${applicationUrl}/loginAttempts`, auth, getBody, application.loginAttempts);
router.post(`${applicationUrl}/accounts`, auth, getBody, application.createAccount);
router.get(`${applicationUrl}/accounts`, auth, application.listAccount);
router.post(`${applicationUrl}/groups`, auth, getBody, application.createGroup);

// directory
const directoryBaseUrl = `${baseUrl}/directories`;
const directoryUrl = `${directoryBaseUrl}/:id`;
router.post(directoryBaseUrl, auth, getBody, directory.create);
router.get(directoryUrl, auth, directory.retrieve);
router.get(directoryBaseUrl, auth, directory.list);
router.post(directoryUrl, auth, getBody, directory.update);
router.delete(directoryUrl, auth, directory.logicDelete);

// group
const groupBaseUrl = `${baseUrl}/directories/:directoryId/groups`;
const groupUrl = `${baseUrl}/groups/:id`;
router.post(groupBaseUrl, auth, getBody, group.create);
router.get(groupUrl, auth, group.retrieve);
router.get(groupBaseUrl, auth, group.list);
router.post(groupUrl, auth, getBody, group.update);
router.delete(groupUrl, auth, group.logicDelete);

// account
const accountBaseUrl = `${baseUrl}/directories/:directoryId/accounts`;
const accountUrl = `${baseUrl}/accounts/:id`;
router.post(accountBaseUrl, auth, getBody, account.create);
router.post(accountUrl, auth, getBody, account.update);
router.get(accountUrl, auth, account.retrieve);
router.get(accountBaseUrl, auth, account.list);
router.delete(accountUrl, auth, account.logicDelete);

// accountStoreMapping
const accountStoreMappingBaseUrl = `${baseUrl}/accountStoreMappings`;
const accountStoreMappingUrl = `${accountStoreMappingBaseUrl}/:id`;
router.post(accountStoreMappingBaseUrl, auth, getBody, accountStoreMapping.create);
router.post(accountStoreMappingUrl, auth, getBody, accountStoreMapping.update);
router.get(accountStoreMappingUrl, auth, accountStoreMapping.retrieve);
router.get(accountStoreMappingBaseUrl, auth, accountStoreMapping.list);
router.delete(accountStoreMappingUrl, auth, accountStoreMapping.logicDelete);

// groupMembership
const groupMembershipBaseUrl = `${baseUrl}/groupMemberships`;
const groupMembershipUrl = `${groupMembershipBaseUrl}/:id`;
router.post(groupMembershipBaseUrl, auth, getBody, groupMembership.create);
router.post(groupMembershipUrl, auth, getBody, groupMembership.update);
router.get(groupMembershipUrl, auth, groupMembership.retrieve);
router.get(groupMembershipBaseUrl, auth, groupMembership.list);
router.delete(groupMembershipUrl, auth, groupMembership.logicDelete);

router.get('*', async (ctx) => {
  ctx.type = 'html';
  ctx.body = fs.createReadStream(`${__dirname}/../public/index.html`);
});

export default (app) => {
  app
    .use(router.routes())
    .use(router.allowedMethods());
};
