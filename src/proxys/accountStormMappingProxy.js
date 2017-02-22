/*
 * @Author: Zz
 * @Date: 2017-01-23 18:08:18
 * @Last Modified by: Zz
 * @Last Modified time: 2017-01-23 18:29:58
 */
import { verify } from 'z-error';
import { common, config } from '../common';
import { accountStormMappingOperator } from '../operators';

function isValidData(info) {
  const error = verify(info, ['name']);
  if (error) {
    return { is: false, error };
  }
  return { is: true, error };
}

async function isExist(info) {
  try {
    const result = await accountStormMappingOperator.list({ name: info.name });
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
  ret.href = `${config.domainHost}/api/account/v1/accountStormMappings/${body.id}`;
  ret.application = {
    href: `${config.domainHost}/api/account/v1/applications/${body.applicationId}`,
  };
  ret.accountStorm = {
    href: `${config.domainHost}/api/account/v1/${body.accountStormId}`,
  };
  return ret;
}

function retListData(query, items, size) {
  const href = `${config.domainHost}/api/account/v1/accountStormMappings`;
  return common.retListData(query, items, size, retData, href);
}

function isValidUpateData() {
  return { is: true, error: '', flag: 0 };
}

module.exports = {
  resourceProxy: accountStormMappingOperator,
  isValidData,
  isExist,
  retData,
  retListData,
  isValidUpateData,
};
