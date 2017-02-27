'use strict';

let isExist = (() => {
  var _ref = _asyncToGenerator(function* (info) {
    try {
      const result = yield _operators.applicationOperator.list({ name: info.name });
      return {
        is: result.length !== 0,
        description: '',
        infos: result
      };
    } catch (err) {
      return Promise.reject(err);
    }
  });

  return function isExist(_x) {
    return _ref.apply(this, arguments);
  };
})();

var _zError = require('z-error');

var _common = require('../common');

var _operators = require('../operators');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @Author: Zz
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @Date: 2017-01-16 21:59:23
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @Last Modified by: Zz
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @Last Modified time: 2017-01-16 23:10:01
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */


function isValidData(info) {
  const error = (0, _zError.verify)(info, ['name']);
  if (error) {
    return { is: false, error };
  }
  return { is: true, error };
}

function retData(body) {
  body = _common.common.filterData(body, ['deleteFlag']);
  body.href = `http://localhost:3000/api/account/v1/tenants/${ body.tenantId }/applications/${ body.id }`;
  return body;
}

function retListData(query, items, size) {
  const href = 'http://localhost:3000/api/account/v1/tenants';
  return _common.common.retListData(query, items, size, retData, href);
}

function isValidUpateData() {
  return { is: true, error: '', flag: 0 };
}

module.exports = {
  resourceProxy: _operators.applicationOperator,
  isValidData,
  isExist,
  retData,
  retListData,
  isValidUpateData
};