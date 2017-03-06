/*
 * @Author: Zz
 * @Date: 2017-03-01 11:22:33
 * @Last Modified by: Zz
 * @Last Modified time: 2017-03-01 11:45:13
 */
import moment from 'moment';
import jwt from 'jsonwebtoken';
import { config, util } from '../common';
import { tenantOperator, accountOperator } from '../operators';

const tokenRole = {
  IP_TOKEN: 'IP_TOKEN',
};

export default {
  /** 通过IP 白名单获取token */
  async retrieveByIpList(ctx) {
    const { key, secret } = ctx.request.body;
    // let isOk = false;
    // if (process.env.NODE_ENV === 'test') {
    //   isOk = true;
    // } else {
    //   for (const ip of config.ipList) {
    //     if (ip === ctx.ip) {
    //       isOk = true;
    //       break;
    //     }
    //   }
    // }
    // if (!isOk) {
    //   ctx.throw({ code: '422', message: '无权限访问！' }, 500);
    //   return;
    // }
    const tmpSecret = util.md5Encode(util.aesEncode(secret, config.aesKey));
    const ret = await tenantOperator.findOne({
      key,
      secret: tmpSecret,
    });
    if (!ret) {
      ctx.throw({ code: '404', message: 'tenant的key或secret错误！' }, 404);
      return;
    }
    const payload = {
      iat: moment().unix(),
      exp: moment().add(2, 'h').unix(),
      tId: ret.id,
      key: ret.key,
      tR: tokenRole.IP_TOKEN,
    };
    const token = jwt.sign(payload, config.jwtKey);

    ctx.body = { token };
    ctx.status = 200;
  },
  async retrieveByAccount(ctx) {
    const { key, account, passwod } = ctx.request.body;
    const ret = await tenantOperator.findOne({
      key,
    });
    if (!ret) {
      ctx.throw({ code: '404', message: 'tenant的key或secret错误！' }, 404);
    }

    const accountRes = await accountOperator.findOne({
      account,
      passwod,
    });
    if (!accountRes) {
      ctx.throw({ code: '404', message: '账号或密码错误！' }, 404);
    }
    if (!accountRes.customData.z_platorm) {
      ctx.throw({ code: '401', message: '该账号没有权限!' }, 401);
    }
    if (ret.id !== accountRes.tenantId) {
      ctx.throw({ code: '404', message: '账号与租户（tenant）不匹配!' }, 404);
    }

    const payload = {
      iat: moment().unix(),
      exp: moment().add(2, 'h').unix(),
      tId: ret.id,
      key: ret.key,
      tR: tokenRole.IP_TOKEN,
    };
    const token = jwt.sign(payload, config.jwtKey);

    ctx.body = { token };
    ctx.status = 200;
  },
};
