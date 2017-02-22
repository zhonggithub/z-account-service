'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _koaRouter = require('koa-router');

var _koaRouter2 = _interopRequireDefault(_koaRouter);

var _rawBody = require('raw-body');

var _rawBody2 = _interopRequireDefault(_rawBody);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _common = require('../common');

var _account = require('./account');

var _account2 = _interopRequireDefault(_account);

var _tenant = require('./tenant');

var _tenant2 = _interopRequireDefault(_tenant);

var _application = require('./application');

var _application2 = _interopRequireDefault(_application);

var _directory = require('./directory');

var _directory2 = _interopRequireDefault(_directory);

var _token = require('./token');

var _token2 = _interopRequireDefault(_token);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const getBody = (() => {
  var _ref = _asyncToGenerator(function* (ctx, next) {
    try {
      const body = yield (0, _rawBody2.default)(ctx.req);
      ctx.request.body = JSON.parse(body);
    } catch (err) {
      ctx.throw(err, 400);
    }
    yield next();
  });

  return function getBody(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

const auth = (() => {
  var _ref2 = _asyncToGenerator(function* (ctx, next) {
    const token = ctx.header.token;

    try {
      const tokenData = _jsonwebtoken2.default.verify(token, _common.config.jwtKey);
      ctx.request.token = tokenData;
      ctx.req.token = tokenData;
    } catch (err) {
      ctx.throw(err, 401);
    }
    yield next();
  });

  return function auth(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})();

const auth1 = (() => {
  var _ref3 = _asyncToGenerator(function* (ctx, next) {
    const token = ctx.header.token;

    try {
      const tokenData = _jsonwebtoken2.default.verify(token, _common.config.jwtKey);
      if (tokenData.key !== _common.config.platormTeanantKey) {
        ctx.throw({ message: '无权访问！' }, 401);
      }
      ctx.request.token = tokenData;
      ctx.req.token = tokenData;
    } catch (err) {
      ctx.throw(err, 401);
    }
    yield next();
  });

  return function auth1(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
})();

const router = new _koaRouter2.default();

// api gateway
router.post('/api/account/:version/tokens', getBody, _token2.default.retrieveByIpList);

// tenant
const tenantBaseUrl = '/api/account/:version/tenants';
const tenantUrl = `${ tenantBaseUrl }/:id`;
router.post(tenantBaseUrl, auth1, getBody, _tenant2.default.create);
router.get(tenantUrl, auth, _tenant2.default.retrieve);
router.get(tenantBaseUrl, auth1, _tenant2.default.list);
router.post(tenantUrl, auth, getBody, _tenant2.default.update);
router.delete(tenantUrl, auth1, _tenant2.default.logicDelete);

// applaction
const applicationBaseUrl = `${ tenantBaseUrl }/:tenantId/applications`;
const applicationUrl = `${ tenantBaseUrl }/:tenantId/applications/:id`;
router.post(applicationBaseUrl, auth, getBody, _application2.default.create);
router.get(applicationUrl, auth, _application2.default.retrieve);
router.get(applicationBaseUrl, auth, _application2.default.list);
router.post(applicationUrl, auth, getBody, _application2.default.update);
router.delete(applicationUrl, auth, _application2.default.logicDelete);

// directory
const directoryBaseUrl = `${ tenantBaseUrl }/:tenantId/directories`;
const directoryUrl = `${ tenantBaseUrl }/:tenantId/directories/:id`;
router.post(directoryBaseUrl, auth, getBody, _directory2.default.create);
router.get(directoryUrl, auth, _directory2.default.retrieve);
router.get(directoryBaseUrl, auth, _directory2.default.list);
router.post(directoryUrl, auth, getBody, _directory2.default.update);
router.delete(directoryUrl, auth, _directory2.default.logicDelete);

// account
router.post('/api/account/:version/accounts', auth, getBody, _account2.default.create);
router.get('/api/account/:version/accounts/:id', auth, _account2.default.retrieve);

router.get('*', (() => {
  var _ref4 = _asyncToGenerator(function* (ctx) {
    ctx.type = 'html';
    ctx.body = _fs2.default.createReadStream(`${ __dirname }/../public/index.html`);
  });

  return function (_x7) {
    return _ref4.apply(this, arguments);
  };
})());

exports.default = app => {
  app.use(router.routes()).use(router.allowedMethods());
};