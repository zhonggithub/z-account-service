'use strict';

var _waterline = require('waterline');

var _waterline2 = _interopRequireDefault(_waterline);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = _waterline2.default.Collection.extend({
  identity: 'tb_directory',
  tableName: 'tb_directory',
  connection: 'mongodb',
  schema: true,
  attributes: {
    name: {
      type: 'string',
      unique: true
    },
    description: {
      type: 'string',
      unique: true
    },
    status: {
      type: 'string',
      enum: ['ENABLE', 'DISABLED'],
      defaultsTo: 'ENABLE'
    },
    tenantId: {
      type: 'string',
      required: true
    },
    customData: {
      type: 'json'
    },
    deleteFlag: {
      type: 'integer',
      defaultsTo: 0
    }
  }
}); /*
     * @Author: Zz
     * @Date: 2017-01-16 22:26:38
     * @Last Modified by: Zz
     * @Last Modified time: 2017-01-16 22:28:08
     */