/*
 * @Author: Zz
 * @Date: 2017-01-16 22:26:38
 * @Last Modified by: Zz
 * @Last Modified time: 2017-01-23 17:02:36
 */
import Waterline from 'waterline';

module.exports = Waterline.Collection.extend({
  identity: 'tb_directory',
  tableName: 'tb_directory',
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
