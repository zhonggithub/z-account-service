/*
 * @Author: Zz
 * @Date: 2017-01-16 21:59:23
 * @Last Modified by: Zz
 * @Last Modified time: 2017-04-08 19:54:21
 */
import querystring from 'querystring';
import { verify } from 'z-error';
import { common, config } from '../common';
import { applicationOperator } from '../operators';

function isValidData(info) {
  const error = verify(info, ['name']);
  if (error) {
    return { is: false, error };
  }
  return { is: true, error };
}

async function isExist(info) {
  try {
    const result = await applicationOperator.list({ name: info.name });
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
  const ret = common.filterData(body, ['deleteFlag']);
  ret.href = `${config.domainHost}${config.uriPrefix}/applications/${body.id}`;
  ret.tenant = {
    href: `${config.domainHost}${config.uriPrefix}/applications/${body.id}`,
  };
  return ret;
}

function retListData(query, items, size) {
  const href = `${config.domainHost}${config.uriPrefix}/applications?${querystring.stringify(query)}`;
  return common.retListData(query, items, size, retData, href);
}

function retAccountData(body) {
  const tmp = common.filterData(body, ['deleteFlag']);
  tmp.tenant = {
    href: `${config.domainHost}${config.uriPrefix}/tenants/${body.tenantId}`,
  };
  tmp.href = `${config.domainHost}${config.uriPrefix}/directories/${body.directoryId}/accounts/${body.id}`;
  return tmp;
}

function retListAccounts(applicationId, query, items, size) {
  const href = `${config.domainHost}${config.uriPrefix}/applications/${applicationId}/accounts?${querystring.stringify(query)}`;
  return common.retListData(query, items, size, retAccountData, href);
}

function isValidUpateData() {
  return { is: true, error: '', flag: 0 };
}

module.exports = {
  resourceProxy: applicationOperator,
  isValidData,
  isExist,
  retData,
  retListData,
  isValidUpateData,
  retListAccounts,
};
