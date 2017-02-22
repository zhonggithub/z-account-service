'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _zError = require('z-error');

var _common = require('../common');

var _proxys = require('../proxys');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const prp = _proxys.accountProxy;

exports.default = {
  create(ctx) {
    return _asyncToGenerator(function* () {
      const body = ctx.request.body;
      const judge = prp.isValidData(body, true);
      if (!judge.is) {
        ctx.throw(judge.error, 422);
        return;
      }
      const exist = yield prp.isExist(body);
      if (exist.is) {
        const err = _common.common.error409();
        err.description = exist.description;
        ctx.throw(err, 409);
        return;
      }
      const result = yield prp.resourceProxy.create(body);
      const resData = prp.retData(result);
      ctx.body = resData;
      ctx.status = 201;
    })();
  },

  update(ctx) {
    return _asyncToGenerator(function* () {
      const body = ctx.query.body;
      const judge = prp.isValidUpateData(body);
      if (!judge.is) {
        ctx.throw(judge.error, 422);
        return;
      }
      const id = ctx.params.id;
      const ret = yield prp.resourceProxy.update(id, body);
      if (!ret) {
        const err = _common.common.error404();
        err.description = `You can't to update resource because the resource of url(${ ctx.url }) is not exist.`;
        ctx.throw(err, 404);
        return;
      }
      ctx.body = prp.retData(ret);
      ctx.status = 200;
    })();
  },

  retrieve(ctx) {
    return _asyncToGenerator(function* () {
      const judge = _common.common.isValidQueryParams(ctx.request.query, prp.isValidQueryParams, null);
      if (!judge.is) {
        ctx.throw(judge.error, 422);
        return;
      }
      const id = ctx.params.id;
      const ret = yield prp.resourceProxy.retrieve(id);
      if (!ret) {
        const err = _common.common.error404();
        err.description = `You can't to retrieve resource because the resource of url(${ ctx.url }) is not exist.`;
        ctx.throw(err, 404);
        return;
      }
      ctx.body = prp.retData(ret);
      ctx.status = 200;
    })();
  },

  delete(ctx) {
    return _asyncToGenerator(function* () {
      const id = ctx.params.id;
      const ret = yield prp.resourceProxy.deleteById(id);
      if (!ret) {
        const err = _common.common.error404();
        err.description = `You can't to delete resource because the resource of url(${ ctx.url }) is not exist.`;
        ctx.throw(err, 404);
        return;
      }
      ctx.status = 204;
    })();
  },

  logicDelete(ctx) {
    return _asyncToGenerator(function* () {
      const id = ctx.params.id;
      const ret = yield prp.rp.logicDeleteById(id);
      if (!ret) {
        const err = _common.common.error404();
        err.description = `You can't to delete resource because the resource of url(${ ctx.url }) is not exist.`;
        ctx.throw(err, 404);
        return;
      }
      ctx.status = 204;
    })();
  },

  list(ctx) {
    return _asyncToGenerator(function* () {
      const judge = _common.common.isValidQueryParams(ctx.request.query, prp.isValidQueryParams, prp.isExpandValid);
      if (!judge.is) {
        ctx.throw(judge.error, 422);
        return;
      }
      ctx.request.query.offset = _common.common.ifReturnNum(ctx.request.query.offset, 0);
      ctx.request.query.limit = _common.common.ifReturnNum(ctx.request.query.limit, 25);
      const result = yield prp.resourceProxy.list(ctx.request.query);
      const total = yield prp.resourceProxy.count(ctx.request.query);
      ctx.body = prp.retListData(ctx.request.query, result, total);
      ctx.status = 200;
    })();
  },

  count(ctx) {
    return _asyncToGenerator(function* () {
      const total = yield prp.resourceProxy.count(ctx.request.query);
      ctx.body = { total };
      ctx.status = 200;
    })();
  },

  batchDeleteById(ctx) {
    return _asyncToGenerator(function* () {
      const body = ctx.request.body;
      let error = (0, _zError.verify)(body, ['method', 'bizContent']);
      if (error) {
        ctx.throw(error, 422);
        return;
      }
      error = (0, _zError.verify)(body.bizContent, ['items']);
      if (error) {
        ctx.throw(error, 422);
        return;
      }
      yield prp.resourceProxy.delete(body.method, { id: body.bizContent.items });
      ctx.status = 204;
    })();
  }
};