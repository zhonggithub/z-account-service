'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _common = require('../common');

var _operators = require('../operators');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const tokenRole = {
  IP_TOKEN: 'IP_TOKEN'

};

exports.default = {
  /** 通过IP 白名单获取token */
  retrieveByIpList(ctx) {
    return _asyncToGenerator(function* () {
      var _ctx$request$body = ctx.request.body;
      const key = _ctx$request$body.key,
            secret = _ctx$request$body.secret;

      let isOk = false;
      if (process.env.NODE_ENV === 'test') {
        isOk = true;
      } else {
        for (const ip of _common.config.ipList) {
          if (ip === ctx.ip) {
            isOk = true;
            break;
          }
        }
      }
      if (!isOk) {
        ctx.throw({ code: '422', message: '无权限访问！' }, 500);
        return;
      }
      const tmpSecret = _common.util.md5Encode(_common.util.aesEncode(secret, _common.config.aesKey));
      const ret = yield _operators.tenantOperator.findOne({
        key,
        secret: tmpSecret
      });
      if (!ret) {
        ctx.throw({ code: '404', message: 'tenant的key或secret错误！' }, 404);
        return;
      }
      const payload = {
        iat: (0, _moment2.default)().unix(),
        exp: (0, _moment2.default)().add(2, 'h').unix(),
        tId: ret.id,
        key: ret.key,
        tR: tokenRole.IP_TOKEN
      };
      const token = _jsonwebtoken2.default.sign(payload, _common.config.jwtKey);

      ctx.body = { token };
      ctx.status = 200;
    })();
  }
};