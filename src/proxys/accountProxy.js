/*
 * @Author: Zz
 * @Date: 2017-01-11 18:16:10
 * @Last Modified by: Zz
 * @Last Modified time: 2017-02-04 16:25:47
 */
import querystring from 'querystring';
import { verify } from 'z-error';
import { common, resourceProxyFactory, config } from '../common';
import { accountOperator } from '../operators';

function isValidData(info) {
  const error = verify(info, ['account', 'name']);
  if (error) {
    return { is: false, error };
  }
  return { is: true, error };
}

async function isExist(info) {
  try {
    // const result = await accountOperator.list({ account: info.account });
    const result = await accountOperator.findOr({
      account: info.account,
      name: info.account,
      email: info.email,
      tel: info.tel,
    });
    return {
      is: result.length !== 0,
      description: '',
      infos: result,
    };
  } catch (err) {
    return Promise.reject(err);
  }
}

function retData(body) {
  const tmp = common.filterData(body, ['deleteFlag', 'id']);
  tmp.href = `${config.domainHost}/api/account/v1/directories/${body.directoryId}/accounts/${body.id}`;
  return tmp;
}

function retListData(query, items, size) {
  const directoryId = String(query.directoryId);
  delete query.directoryId;
  const href = `${config.domainHost}/api/account/v1/directories/${directoryId}/accounts?${querystring.stringify(query)}`;
  return common.retListData(query, items, size, retData, href);
}

function isValidUpateData() {
  return { is: true, error: '', flag: 0 };
}

module.exports = resourceProxyFactory({
  resourceProxy: accountOperator,
  isValidData,
  isExist,
  retData,
  retListData,
  isValidUpateData,
});
