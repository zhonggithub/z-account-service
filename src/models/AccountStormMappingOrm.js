/*
 * @Author: Zz
 * @Date: 2017-01-23 17:17:21
 * @Last Modified by: Zz
 * @Last Modified time: 2017-01-23 17:52:48
 */
import Waterline from 'waterline';

module.exports = Waterline.Collection.extend({
  identity: 'tb_accountStormMapping',
  tableName: 'tb_accountStormMapping',
  connection: 'mongodb',
  schema: true,
  attributes: {
    accountStoreId: {
      type: 'string',
      required: true,
    },
    applicationId: {
      type: 'string',
      required: true,
    },
    isDefaultAccountStore: {
      type: 'boolean',
      defaultsTo: false,
    },
    isDefaultGroupStore: {
      type: 'boolean',
      defaultsTo: false,
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
