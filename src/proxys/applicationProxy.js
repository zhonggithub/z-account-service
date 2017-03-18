/*
 * @Author: Zz
 * @Date: 2017-01-16 21:59:23
 * @Last Modified by: Zz
 * @Last Modified time: 2017-03-18 22:26:37
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
  const ret = common.filterData(body, ['deleteFlag']);
  ret.href = `${config.domainHost}${config.uriPrefix}/applications/${body.id}`;
  ret.tenant = {
    href: `${config.domainHost}${config.uriPrefix}/applications/${body.id}`,
  };
  return ret;
}

function retListData(query, items, size) {
  const href = `${config.domainHost}${config.uriPrefix}/applications`;
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
