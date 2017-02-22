/*
 * @Author: Zz
 * @Date: 2017-01-17 20:55:32
 * @Last Modified by: Zz
 * @Last Modified time: 2017-01-23 14:29:04
 */
import { verify } from 'z-error';
import { common, config } from '../common';
import { directoryOperator } from '../operators';

function isValidData(info) {
  const error = verify(info, ['name']);
  if (error) {
    return { is: false, error };
  }
  return { is: true, error };
}

async function isExist(info) {
  try {
    const result = await directoryOperator.list({ name: info.name });
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
  const ret = common.filterData(body, ['deleteFlag', 'id']);
  ret.href = `${config.domainHost}/api/account/v1/directories/${body.id}`;
  ret.tenant = {
    href: `${config.domainHost}/api/account/v1/tenants/${body.tenantId}`,
  };
  return ret;
}

function retListData(query, items, size) {
  const href = `${config.domainHost}/api/account/v1/directories`;
  return common.retListData(query, items, size, retData, href);
}

function isValidUpateData() {
  return { is: true, error: '', flag: 0 };
}

module.exports = {
  resourceProxy: directoryOperator,
  isValidData,
  isExist,
  retData,
  retListData,
  isValidUpateData,
};
