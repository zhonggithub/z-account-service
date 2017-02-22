'use strict';

var _waterline = require('waterline');

var _waterline2 = _interopRequireDefault(_waterline);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// ---- Account
module.exports = _waterline2.default.Collection.extend({
  identity: 'tb_account',
  tableName: 'tb_account',
  connection: 'mongodb',
  schema: true,
  attributes: {
    name: {
      type: 'string',
      unique: true
    },
    account: {
      type: 'string',
      unique: true
    },
    password: {
      type: 'string'
    },
    deleteFlag: {
      type: 'integer',
      defaultsTo: 0
    }
  }
});