import Waterline from 'waterline';
// ---- Account
module.exports = Waterline.Collection.extend({
  identity: 'tb_account',
  tableName: 'tb_account',
  connection: 'mongodb',
  schema: true,
  attributes: {
    name: {
      type: 'string',
      // unique: true,
      required: true,
    },
    account: {
      type: 'string',
      // unique: true,
      required: true,
    },
    password: {
      type: 'string',
      required: true,
    },
    tenantId: {
      type: 'string',
      required: true,
    },
    directoryId: {
      type: 'string',
      required: true,
    },
    email: {
      type: 'string',
      required: true,
      // unique: true,
    },
    tel: {
      type: 'string',
      required: true,
      // unique: true,
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
