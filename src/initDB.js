import { tenantOperator } from './operators';
import { util, config } from './common';

module.exports = (callback) => {
  const secret = util.md5Encode(util.aesEncode('zz^&(^)', config.aesKey));
  tenantOperator.create({
    name: 'z-platorm',
    secret,
    description: 'z-platorm 平台tenant，权限最高的tenant;',
    key: config.platormTeanantKey,
  }).then(data => callback(null, data)).catch(error => callback(error, null));
};
