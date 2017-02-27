/*
 * @Author: Zz
 * @Date: 2017-02-22 17:28:16
 * @Last Modified by: Zz
 * @Last Modified time: 2017-02-23 10:37:17
 */
import Waterline from 'waterline';

module.exports = Waterline.Collection.extend({
  identity: 'tb_group_membership',
  tableName: 'tb_group_membership',
  connection: 'mongodb',
  schema: true,
  attributes: {
    groupId: {
      type: 'string',
      required: true,
    },
    accountId: {
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
