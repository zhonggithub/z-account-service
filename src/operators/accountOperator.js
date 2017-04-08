/*
 * @Author: Zz
 * @Date: 2017-01-14 21:54:41
 * @Last Modified by: Zz
 * @Last Modified time: 2017-04-08 12:09:58
 */
import { dbOrm, common, util, config } from '../common';

class ResourceLogicInfo {
  constructor(dbInfo) {
    this.id = dbInfo.id;
    this.name = dbInfo.name;
    this.account = dbInfo.account;
    this.tel = dbInfo.tel;
    this.directoryId = dbInfo.directoryId;
    this.customData = dbInfo.customData;
    this.createdAt = dbInfo.createdAt;
    this.updtedAt = dbInfo.updatedAt;
    this.tenantId = dbInfo.tenantId;
  }
}

class ResourceDBInfo {
  constructor(logicInfo) {
    this.account = logicInfo.account;
    this.password = util.md5Encode(util.aesEncode(logicInfo.password, config.aesKey));
    this.email = logicInfo.email;
    this.tel = logicInfo.tel;
    this.name = logicInfo.name;
    this.customData = logicInfo.customData;
    this.directoryId = logicInfo.directoryId;
    this.tenantId = logicInfo.tenantId;
  }
}

class ResourceUpdateDBInfo {
  constructor(logicInfo) {
    if (logicInfo.account) {
      this.account = logicInfo.account;
    }
    if (logicInfo.name) {
      this.name = logicInfo.name;
    }
    if (logicInfo.email) {
      this.email = logicInfo.email;
    }
    if (logicInfo.tel) {
      this.tel = logicInfo.tel;
    }
    if (logicInfo.customData) {
      this.customData = logicInfo.customData;
    }
  }
}

const imp = {
  convertQueryCriteria: (criteria) => {
    let tmpCriteria = JSON.parse(JSON.stringify(criteria));
    tmpCriteria = common.convertQueryCriteria(tmpCriteria);
    const dbCriteria = tmpCriteria.dstCriteria;
    tmpCriteria = tmpCriteria.sourceCriteria;
    for (const condition in tmpCriteria) {
      switch (condition) {
        case 'name': {
          if (tmpCriteria[condition].indexOf('*') === -1) {
            dbCriteria[`canton.${condition}`] = tmpCriteria[condition];
          } else {
            const reg = /\*/g;
            const str = criteria[condition].replace(reg, '%');
            dbCriteria[`canton.${condition}`] = { like: str };
          }
          break;
        }
        default:
          dbCriteria[condition] = tmpCriteria[condition];
          break;
      }
    }
    dbCriteria.deleteFlag = { '!': 1 };
    return dbCriteria;
  },
  convertCountCriteria: (criteria) => {
    const dbCriteria = common.convertCountCriteria(criteria);
    dbCriteria.deleteFlag = { '!': 1 };
    return dbCriteria;
  },
  resourceModule: () => dbOrm.collections.tb_account,
  ResourceLogicInfo,
  ResourceDBInfo,
  ResourceUpdateDBInfo,
};

function convert2DBInfo(logicInfo) {
  return (imp.ResourceDBInfo ? new imp.ResourceDBInfo(logicInfo) : logicInfo);
}

function convertUpdate2DBInfo(logicInfo) {
  return (imp.ResourceUpdateDBInfo ? new imp.ResourceUpdateDBInfo(logicInfo) : logicInfo);
}

function convert2LogicInfo(dbInfo) {
  return (imp.ResourceLogicInfo ? new imp.ResourceLogicInfo(dbInfo) : dbInfo);
}

export default {
  async create(logicInfo) {
    try {
      const dbInfo = convert2DBInfo(logicInfo);
      const ret = await imp.resourceModule().create(dbInfo);
      return Promise.resolve(convert2LogicInfo(ret));
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async update(id, logicInfo) {
    try {
      const findInfo = await imp.resourceModule().findOne({ id });
      if (!findInfo) {
        return Promise.resolve(null);
      }
      const dbInfo = convertUpdate2DBInfo(logicInfo);
      const ret = await imp.resourceModule().update({ id }, dbInfo);
      return Promise.resolve(convert2LogicInfo(ret[0]));
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async retrieve(id) {
    try {
      const ret = await imp.resourceModule().findOne({ id });
      if (!ret) {
        return Promise.resolve(null);
      }
      return Promise.resolve(convert2LogicInfo(ret));
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async deleteById(id) {
    try {
      const findInfo = await imp.resourceModule().findOne({ id });
      if (!findInfo) {
        return Promise.resolve(null);
      }
      const ret = await imp.resourceModule().destroy({ id });
      return Promise.resolve(ret);
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async logicDeleteById(id) {
    try {
      const ret = await imp.resourceModule().update({ id }, { deleteFlag: 1 });
      return Promise.resolve(ret);
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async list(query, select) {
    try {
      const criteria = imp.convertQueryCriteria(query);
      // const ret = await imp.resourceModule().find(criteria);
      const ret = select ? await imp.resourceModule().find({ ...criteria, select }) : await imp.resourceModule().find(criteria);
      const infoArray = ret.map(item => convert2LogicInfo(item));
      return Promise.resolve(infoArray);
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async count(query) {
    try {
      const criteria = imp.convertQueryCriteria(query);
      const total = await imp.resourceModule().count(criteria);
      return Promise.resolve(total);
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async delete(method, criteria) {
    try {
      if (method === 'delete') {
        const ret = await imp.resourceModule().destroy(criteria);
        return Promise.resolve(ret);
      }
      const ret = await imp.resourceModule().update(criteria, { deleteTag: 1 });
      return Promise.resolve(ret);
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async findOr(query, andQuery = {}) {
    try {
      const criteria = imp.convertQueryCriteria(query);
      const tmp = {
        or: [],
        ...andQuery,
      };
      for (const item in criteria) {
        if (item !== 'deleteFlag') {
          const tmpItem = {};
          tmpItem[item] = criteria[item];
          tmp.or.push(tmpItem);
        }
      }
      const ret = await imp.resourceModule().find(tmp);
      const infoArray = ret.map(item => convert2LogicInfo(item));
      return Promise.resolve(infoArray);
    } catch (error) {
      return Promise.reject(error);
    }
  },
};
