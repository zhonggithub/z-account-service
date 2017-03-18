/*
 * @Author: Zz
 * @Date: 2017-02-22 10:40:09
 * @Last Modified by: Zz
 * @Last Modified time: 2017-03-18 22:27:01
 */
import querystring from 'querystring';
import { verify } from 'z-error';
import { common, config } from '../common';
import { groupOperator } from '../operators';

function isValidData(info) {
  const error = verify(info, ['name']);
  if (error) {
    return { is: false, error };
  }
  return { is: true, error };
}

async function isExist(info) {
  try {
    const result = await groupOperator.list({ name: info.name });
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
  ret.href = `${config.domainHost}${config.uriPrefix}/groups/${body.id}`;
  ret.tenant = {
    href: `${config.domainHost}${config.uriPrefix}/tenants/${body.tenantId}`,
  };
  return ret;
}

function retListData(query, items, size) {
  const directoryId = String(query.directoryId);
  delete query.directoryId;
  const href = `${config.domainHost}${config.uriPrefix}/directories/${directoryId}/groups?${querystring.stringify(query)}`;
  return common.retListData(query, items, size, retData, href);
}

function isValidUpateData() {
  return { is: true, error: '', flag: 0 };
}

module.exports = {
  resourceProxy: groupOperator,
  isValidData,
  isExist,
  retData,
  retListData,
  isValidUpateData,
};
