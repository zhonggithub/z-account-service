/*
 * @Author: Zz
 * @Date: 2017-01-16 21:59:23
 * @Last Modified by: Zz
 * @Last Modified time: 2017-01-23 11:30:47
 */
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
  const ret = common.filterData(body, ['deleteFlag', 'id', 'tenantId']);
  ret.href = `${config.domainHost}/api/account/v1/applications/${body.id}`;
  ret.tenant = {
    href: `${config.domainHost}/api/account/v1/applications/${body.id}`,
  };
  return ret;
}

function retListData(query, items, size) {
  const href = `${config.domainHost}/api/account/v1/applications`;
  return common.retListData(query, items, size, retData, href);
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
};
