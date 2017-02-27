/*
 * @Author: Zz
 * @Date: 2017-01-16 22:10:38
 * @Last Modified by: Zz
 * @Last Modified time: 2017-02-27 18:38:51
 */
import lodash from 'lodash';
import { verify, ZError } from 'z-error';
import { common, util, config } from '../common';
import { applicationProxy } from '../proxys';
import { directoryOperator, accountOperator, accountStoreMappingOperator, groupOperator } from '../operators';

const prp = applicationProxy;
export default {
  async create(ctx) {
    const body = ctx.request.body;
    const judge = prp.isValidData(body);
    if (!judge.is) {
      ctx.throw(judge.error, 422);
      return;
    }
    const exist = await prp.isExist(body);
    if (exist.is) {
      const err = common.error409();
      err.description = exist.description;
      ctx.throw(err, 409);
      return;
    }
    body.tenantId = ctx.request.token.tId;
    const result = await prp.resourceProxy.create(body);
    const { createDirectory } = ctx.request.query;
    if (createDirectory) {
      await directoryOperator.create({
        name: createDirectory === 'true' ? `${result.name} Directory` : createDirectory,
        tenantId: body.tenantId,
      });
    }
    const resData = prp.retData(result);
    ctx.body = resData;
    ctx.status = 201;
  },

  async update(ctx) {
    const body = ctx.request.body;
    const judge = prp.isValidUpateData(body);
    if (!judge.is) {
      ctx.throw(judge.error, 422);
      return;
    }
    const id = ctx.params.id;
    const ret = await prp.resourceProxy.update(id, body);
    if (!ret) {
      const err = common.error404();
      err.description = `You can't to update resource because the resource of url(${ctx.url}) is not exist.`;
      ctx.throw(err, 404);
      return;
    }
    ctx.body = prp.retData(ret);
    ctx.status = 200;
  },

  async retrieve(ctx) {
    const judge = common.isValidQueryParams(ctx.request.query, prp.isValidQueryParams, null);
    if (!judge.is) {
      ctx.throw(judge.error, 422);
      return;
    }
    const id = ctx.params.id;
    const ret = await prp.resourceProxy.retrieve(id);
    if (!ret) {
      const err = common.error404();
      err.description = `You can't to retrieve resource because the resource of url(${ctx.url}) is not exist.`;
      ctx.throw(err, 404);
      return;
    }
    ctx.body = prp.retData(ret);
    ctx.status = 200;
  },

  async delete(ctx) {
    const id = ctx.params.id;
    const ret = await prp.resourceProxy.deleteById(id);
    if (!ret) {
      const err = common.error404();
      err.description = `You can't to delete resource because the resource of url(${ctx.url}) is not exist.`;
      ctx.throw(err, 404);
      return;
    }
    ctx.status = 204;
  },

  async logicDelete(ctx) {
    const id = ctx.params.id;
    const ret = await prp.resourceProxy.logicDeleteById(id);
    if (!ret) {
      const err = common.error404();
      err.description = `You can't to delete resource because the resource of url(${ctx.url}) is not exist.`;
      ctx.throw(err, 404);
      return;
    }
    ctx.status = 204;
  },

  async list(ctx) {
    const judge = common.isValidQueryParams(ctx.request.query, prp.isValidQueryParams, prp.isExpandValid);
    if (!judge.is) {
      ctx.throw(judge.error, 422);
      return;
    }
    ctx.request.query.offset = common.ifReturnNum(ctx.request.query.offset, 0);
    ctx.request.query.limit = common.ifReturnNum(ctx.request.query.limit, 25);
    const result = await prp.resourceProxy.list(ctx.request.query);
    const total = await prp.resourceProxy.count(ctx.request.query);
    ctx.body = prp.retListData(ctx.request.query, result, total);
    ctx.status = 200;
  },

  async count(ctx) {
    const total = await prp.resourceProxy.count(ctx.request.query);
    ctx.body = { total };
    ctx.status = 200;
  },

  async batchDeleteById(ctx) {
    const body = ctx.request.body;
    let error = verify(body, ['method', 'bizContent']);
    if (error) {
      ctx.throw(error, 422);
      return;
    }
    error = verify(body.bizContent, ['items']);
    if (error) {
      ctx.throw(error, 422);
      return;
    }
    await prp.resourceProxy.delete(body.method, { id: body.bizContent.items });
    ctx.status = 204;
  },

  async loginAttempts(ctx) {
    const body = ctx.request.body;
    let error = verify(body, ['type', 'value', 'tag']);
    if (error) {
      ctx.throw(error, 422);
      return;
    }
    const accountStore = body.accountStore;
    if (accountStore) {
      error = verify(accountStore, ['href']);
      if (error) {
        ctx.throw(error, 422);
        return;
      }
    }
    // 验证参数格式合法性
    let bo = common.verifyValue(body.type, ['basic']);
    const error1 = new ZError('Error', 422, '', 'en', '非法参数！');
    if (!bo) {
      error1.description = 'type 是无效的参数！';
      ctx.throw(error1, 422);
    }
    bo = common.verifyValue(body.tag, ['NP', 'MP', 'EP', 'MV']);
    if (!bo) {
      error1.description = 'tag 是无效的参数！有效参数为 NP, MP, EP, MV';
      ctx.throw(error1, 422);
    }
    let credentials = new Buffer(body.value, 'base64').toString();
    credentials = credentials.split(':');
    if (credentials.length !== 2) {
      error1.description = 'value 是无效的参数!';
      ctx.throw(error1, 422);
    }
    const certain = {
      tenantId: ctx.request.token.tId,
    };
    switch (body.tag) {
      case 'NP': // name:password
        certain.name = credentials[0];
        certain.password = util.md5Encode(util.aesEncode(credentials[1], config.aesKey));
        break;
      case 'MP':
        certain.tel = credentials[0];
        certain.password = util.md5Encode(util.aesEncode(credentials[1], config.aesKey));
        break;
      case 'EP':
        certain.email = credentials[0];
        certain.password = util.md5Encode(util.aesEncode(credentials[1], config.aesKey));
        break;
      default:
        break;
    }
    // 查找账号
    const accounts = await accountOperator.list(certain);
    if (accounts.length !== 1) {
      const error2 = common.error404();
      error2.message = '用户名或密码错误！';
      ctx.threow(error2, 404);
    }
    const account = accounts[0];

    let accountStoreId = null;
    if (accountStore && accountStore.href) {
      if (accountStore.href.indexOf('groups')) {
        accountStoreId = common.getIdInHref(accountStore.href, '/groups/');
      } else {
        accountStoreId = common.getIdInHref(accountStore.href, '/directories/');
      }
    }
    const tmpCertain = { applicationId: ctx.params.id };
    if (accountStoreId) {
      tmpCertain.accountStoreId = accountStoreId;
    }
    const stores = await accountStoreMappingOperator.list(tmpCertain);
    const searchResults = await Promise.all(stores.map(async (item) => {
      if (item.accountStoreType === 1) {
        const groups = await groupOperator.list({ id: item.accountStoreId });
        if (groups.length !== 1 && groups[0].status !== 'ENABLE') {
          return false;
        }
        return true;
      }
      const directories = await directoryOperator.list({ id: item.accountStoreId });
      if (directories.length !== 1 && directories[0].status !== 'ENABLE') {
        return false;
      }
      return true;
    }));
    const results = lodash.compact(searchResults);
    if (results.length === 0) {
      const error2 = common.error404();
      error2.message = '该app下没有关联该账号！';
      ctx.threow(error2, 404);
    }
    ctx.status = 200;
  },
};
