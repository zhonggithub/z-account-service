/*
 * @Author: Zz
 * @Date: 2017-01-23 17:17:21
 * @Last Modified by: Zz
 * @Last Modified time: 2017-02-23 10:38:28
 */
import Waterline from 'waterline';

module.exports = Waterline.Collection.extend({
  identity: 'tb_account_store_mapping',
  tableName: 'tb_account_store_mapping',
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
    accountStoreType: {
      type: 'integer',
      defaultsTo: 0, // 0: directory,  1: group
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
