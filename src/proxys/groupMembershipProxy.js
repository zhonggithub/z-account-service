/*
 * @Author: Zz
 * @Date: 2017-01-23 18:08:18
 * @Last Modified by: Zz
 * @Last Modified time: 2017-03-18 22:26:54
 */
import { verify } from 'z-error';
import { common, config } from '../common';
import { groupMembershipOperator } from '../operators';

function isValidData(info) {
  let error = verify(info, ['account', 'group']);
  if (error) {
    return { is: false, error };
  }
  error = verify(info.account, ['href']);
  if (error) {
    return { is: false, error };
  }
  error = verify(info.group, ['href']);
  if (error) {
    return { is: false, error };
  }
  return { is: true, error };
}

async function isExist() {
  return {
    is: false,
    description: '',
  };
}

function retData(body) {
  const ret = common.filterData(body, ['deleteFlag']);
  ret.href = `${config.domainHost}${config.uriPrefix}/groupMemberships/${body.id}`;
  ret.group = {
    href: `${config.domainHost}${config.uriPrefix}/groups/${body.groupId}`,
  };
  ret.account = {
    href: `${config.domainHost}${config.uriPrefix}/accounts/${body.accountId}`,
  };
  return ret;
}

function retListData(query, items, size) {
  const href = `${config.domainHost}${config.uriPrefix}/groupMemberships`;
  return common.retListData(query, items, size, retData, href);
}

function isValidUpateData() {
  return { is: true, error: '', flag: 0 };
}

module.exports = {
  resourceProxy: groupMembershipOperator,
  isValidData,
  isExist,
  retData,
  retListData,
  isValidUpateData,
};
