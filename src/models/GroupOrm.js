/*
 * @Author: Zz
 * @Date: 2017-02-22 10:32:09
 * @Last Modified by: Zz
 * @Last Modified time: 2017-02-22 17:25:45
 */
import Waterline from 'waterline';

module.exports = Waterline.Collection.extend({
  identity: 'tb_group',
  tableName: 'tb_group',
  connection: 'mongodb',
  schema: true,
  attributes: {
    directoryId: {
      type: 'string',
      required: true,
    },
    name: {
      type: 'string',
      required: true,
    },
    description: {
      type: 'string',
      defaultsTo: false,
    },
    tenantId: {
      type: 'string',
      required: true,
    },
    status: {
      type: 'string',
      enum: ['ENABLE', 'DISABLED'],
      defaultsTo: 'ENABLE',
    },
    customData: {
      type: 'json',
    },
    deleteFlag: {
      type: 'integer',
      defaultsTo: 0,
    },
  },
});
