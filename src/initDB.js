import { tenantOperator, applicationOperator, accountStoreMappingOperator, groupMembershipOperator, accountOperator, directoryOperator, groupOperator } from './operators';
import { util, config } from './common';

module.exports = (callback) => {
  const secret = util.md5Encode(util.aesEncode('zz^&(^)', config.aesKey));
  let tenantId = '';
  let applicationId = '';
  let directoryId = '';
  let accountId = '';
  tenantOperator.create({
    name: 'z-platorm',
    secret,
    description: 'z-platorm 平台tenant，权限最高的tenant;',
    key: config.platormTeanantKey,
  }).then((data) => {
    tenantId = data.id;
    return applicationOperator.create({
      name: 'z-platorm-app',
      description: 'z-platorm-app',
      tenantId,
    });
  }).then((data) => {
    applicationId = data.id;
    return directoryOperator.create({
      name: 'a-platorm',
      tenantId,
    });
  }).then((data) => {
    directoryId = data.id;
    return accountOperator.create({
      name: 'admin',
      account: 'admin',
      password: 'admin',
      tenantId,
      directoryId,
      email: '1006817093@qq.com',
      tel: '13760471842',
    });
  })
  .then((data) => {
    accountId = data.id;
    return groupOperator.create({
      directoryId,
      name: 'admin',
      tenantId,
    });
  })
  .then(data => groupMembershipOperator.create({
    group: { href: `/groups/${data.id}` },
    account: {
      href: `/accounts/${accountId}`,
    },
  }).then(() => accountStoreMappingOperator.create({
    application: {
      href: `/applications/${applicationId}`,
    },
    accountStore: {
      href: `/directories/${directoryId}`,
    },
    tenantId,
    isDefaultAccountStore: true,
  })))
  .then(data => callback(null, data))
  .catch(error => callback(error, null));
};
