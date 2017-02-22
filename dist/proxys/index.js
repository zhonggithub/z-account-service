'use strict';

var _accountProxy = require('./accountProxy');

var _accountProxy2 = _interopRequireDefault(_accountProxy);

var _tenantProxy = require('./tenantProxy');

var _tenantProxy2 = _interopRequireDefault(_tenantProxy);

var _applicationProxy = require('./applicationProxy');

var _applicationProxy2 = _interopRequireDefault(_applicationProxy);

var _directoryProxy = require('./directoryProxy');

var _directoryProxy2 = _interopRequireDefault(_directoryProxy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  accountProxy: _accountProxy2.default,
  tenantProxy: _tenantProxy2.default,
  applicationProxy: _applicationProxy2.default,
  directoryProxy: _directoryProxy2.default
};