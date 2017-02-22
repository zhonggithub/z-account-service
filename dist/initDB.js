'use strict';

var _operators = require('./operators');

var _common = require('./common');

module.exports = callback => {
  const secret = _common.util.md5Encode(_common.util.aesEncode('zz^&(^)', _common.config.aesKey));
  _operators.tenantOperator.create({
    name: 'z-platorm',
    secret,
    description: 'z-platorm 平台tenant，权限最高的tenant;',
    key: _common.config.platormTeanantKey
  }).then(data => callback(null, data)).catch(error => callback(error, null));
};