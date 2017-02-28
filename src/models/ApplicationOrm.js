/*
 * @Author: Zz
 * @Date: 2017-01-16 21:47:09
 * @Last Modified by: Zz
 * @Last Modified time: 2017-02-28 14:27:26
 */
import Waterline from 'waterline';

module.exports = Waterline.Collection.extend({
  identity: 'tb_application',
  tableName: 'tb_application',
  connection: 'mongodb',
  schema: true,
  attributes: {
    name: {
      type: 'string',
      unique: true,
      required: true,
    },
    description: {
      type: 'string',
    },
    status: {
      type: 'string',
      enum: ['ENABLE', 'DISABLED'],
      defaultsTo: 'ENABLE',
    },
    tenantId: {
      type: 'string',
      required: true,
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
