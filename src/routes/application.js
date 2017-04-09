/*
 * @Author: Zz
 * @Date: 2017-01-16 22:10:38
 * @Last Modified by: Zz
 * @Last Modified time: 2017-04-09 21:30:17
 */
import lodash from 'lodash';
import { verify, ZError } from 'z-error';
import { common, util, config } from '../common';
import { applicationProxy, accountProxy, groupProxy } from '../proxys';
import { directoryOperator, accountOperator, accountStoreMappingOperator, groupOperator, groupMembershipOperator } from '../operators';

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
      const directory = await directoryOperator.create({
        name: createDirectory === 'true' ? `${result.name} Directory` : createDirectory,
        tenantId: body.tenantId,
      });
      await accountStoreMappingOperator.create({
        accountStore: {
          href: `/groups/${directory.id}`,
        },
        application: {
          href: `/applications/${result.id}`,
        },
        tenantId: ctx.request.token.tId,
        isDefaultAccountStore: true,
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
    let error = verify(body, ['type', 'value']);
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
    const bo = common.verifyValue(body.type, ['basic']);
    const error1 = new ZError('Error', 422, '', 'en', '非法参数！');
    if (!bo) {
      error1.message = 'type 是无效的参数！';
      ctx.throw(error1, 422);
    }
    // bo = common.verifyValue(body.tag, ['NP', 'MP', 'EP', 'MV']);
    // if (!bo) {
    //   error1.message = 'tag 是无效的参数！有效参数为 NP, MP, EP, MV';
    //   ctx.throw(error1, 422);
    // }
    let credentials = new Buffer(body.value, 'base64').toString();
    credentials = credentials.split(':');
    if (credentials.length !== 2) {
      error1.message = `value${body.value} 是无效的参数!`;
      ctx.throw(error1, 422);
    }
    const certain = {
      tenantId: ctx.request.token.tId,
    };
    const password = util.md5Encode(util.aesEncode(credentials[1], config.aesKey));
    switch (body.tag) {
      case 'NP': // name:password
        certain.name = credentials[0];
        certain.password = password;
        break;
      case 'MP':
        certain.tel = credentials[0];
        certain.password = password;
        break;
      case 'EP':
        certain.email = credentials[0];
        certain.password = password;
        break;
      default:
        certain.or = [{
          name: credentials[0],
          password,
        }, {
          tel: credentials[0],
          password,
        }, {
          email: credentials[0],
          password,
        }];
        break;
    }
    // 查找账号
    const accounts = await accountOperator.list(certain);
    if (accounts.length === 0) {
      const error2 = common.error404();
      error2.message = '用户名或密码错误！';
      ctx.throw(error2, 404);
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
        if (groups.length !== 1 || groups[0].status !== 'ENABLE') {
          return false;
        }
        const groupMembership = await groupMembershipOperator.list({ accountId: account.id, groupId: groups[0].id });
        if (groupMembership.length !== 1) {
          return false;
        }
        return true;
      }
      const directories = await directoryOperator.list({ id: item.accountStoreId });
      if (directories.length !== 1 || directories[0].status !== 'ENABLE' || directories[0].id !== account.directoryId) {
        return false;
      }
      return true;
    }));
    const results = lodash.compact(searchResults);
    if (results.length === 0) {
      const error2 = common.error404();
      error2.message = '该app下没有关联该账号！';
      ctx.throw(error2, 404);
    }
    ctx.status = 200;
    ctx.body = account;
  },

  async createAccount(ctx) {
    const tmpCertain = { applicationId: ctx.params.id };

    const body = ctx.request.body;
    let error = verify(body, ['account']);
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
    let accountStoreId = null;
    if (accountStore && accountStore.href) {
      accountStoreId = common.getIdInHref(accountStore.href, '/directories/');
    }
    if (accountStoreId) {
      tmpCertain.accountStoreId = accountStoreId;
    } else {
      tmpCertain.isDefaultAccountStore = true;
    }
    const stores = await accountStoreMappingOperator.list(tmpCertain);
    if (stores.length === 0) {
      const error2 = common.error404();
      error2.message = '该app下没有关联目录！';
      ctx.threow(error2, 404);
    }

    if (stores.length !== 1) {
      const error3 = common.error409();
      error3.message = '找到多个与app关联的目录，资源冲突！';
      ctx.threow(error3, 409);
    }
    const accountRet = await accountOperator.create({
      ...ctx.body.account,
      directoryId: accountStoreId || stores[0].id,
      tenantId: ctx.request.token.tId,
    });
    const resData = accountProxy.retData(accountRet);
    ctx.body = resData;
    ctx.status = 201;
  },

  async createGroup(ctx) {
    const tmpCertain = { applicationId: ctx.params.id };

    const body = ctx.request.body;
    let error = verify(body, ['group']);
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
    let accountStoreId = null;
    if (accountStore && accountStore.href) {
      accountStoreId = common.getIdInHref(accountStore.href, '/directories/');
    }
    if (accountStoreId) {
      tmpCertain.accountStoreId = accountStoreId;
    } else {
      tmpCertain.isDefaultGroupStore = true;
    }
    const stores = await accountStoreMappingOperator.list(tmpCertain);
    if (stores.length === 0) {
      const error2 = common.error404();
      error2.message = '该app下没有关联目录！';
      ctx.threow(error2, 404);
    }

    if (stores.length !== 1) {
      const error3 = common.error409();
      error3.message = '找到多个与app关联的目录，资源冲突！';
      ctx.threow(error3, 409);
    }
    const infoRet = await groupOperator.create({
      ...ctx.body.group,
      directoryId: accountStoreId || stores[0].id,
      tenantId: ctx.request.token.tId,
    });
    const resData = groupProxy.retData(infoRet);
    ctx.body = resData;
    ctx.status = 201;
  },

  async listAccount(ctx) {
    const select = ['accountStoreId'];
    const applicationId = ctx.params.id;
    const tmpCertain = {
      applicationId,
      accountStoreType: 0,
    };
    const stores0 = await accountStoreMappingOperator.list(tmpCertain, select);
    const directoryArray = stores0.map(item => item.accountStoreId);

    tmpCertain.accountStoreType = 1;
    const stores1 = await accountStoreMappingOperator.list(tmpCertain, select);
    const groupArray = stores1.map(item => item.accountStoreId);
    const groups = await groupOperator.list({ id: groupArray }, ['directoryId']);
    const groupDirectoryArray = groups.map(item => item.directoryId);
    const directoryIds = lodash.union(directoryArray, groupDirectoryArray);

    ctx.request.query.offset = common.ifReturnNum(ctx.request.query.offset, 0);
    ctx.request.query.limit = common.ifReturnNum(ctx.request.query.limit, 25);
    const query = { ...ctx.request.query, directoryId: directoryIds };
    const result = await accountOperator.list(query);
    const total = await prp.resourceProxy.count(query);
    ctx.body = prp.retListAccounts(applicationId, query, result, total);
    ctx.status = 200;
  },
};
