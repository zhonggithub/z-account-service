import test from 'ava';
import fetchMock from 'fetch-mock';
import request from '../helpers/request';
import { dbOrm, common, config } from '../../src/common';

test.afterEach.always(() => {
  fetchMock.restore();
});

const mockAccount = {
  name: `${Math.random()}00000000`,
  account: `${Math.random()}1210`,
  password: '2536',
  email: `${Math.random()}1210@qq.com`,
  tel: `${Math.random()}00000000`,
};
const mockDirectory = {
  name: `zz directory ${Math.random()}`,
  description: 'test directoru',
  customData: {
    remark: 'test customData',
  },
};
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let account = null;
let token = null;
let directoryUrl = null;
let accountId = null;
test.before(async (t) => {
  while (!dbOrm.models.collections) {
    await sleep(1000);
  }
  const tokenRes = await request.post(`${config.uriPrefix}/tokens`).send({
    key: 'zt001',
    secret: 'zz^&(^)',
  });
  if (tokenRes.status >= 400) console.log(tokenRes.text);
  token = tokenRes.body.data.token;
  const res1 = await request.post(`${config.uriPrefix}/directories`).set('token', token)
  .send(mockDirectory);
  if (res1.status >= 400) console.log(res1.text);
  t.is(res1.status, 201);
  const tmp = res1.body.data;
  directoryUrl = tmp.href.replace('http://localhost:3000', '');
  const res = await request.post(`${directoryUrl}/accounts`).send(mockAccount).set('token', token);
  if (res.status >= 400) console.log(res.text);
  t.is(res.status, 201);
  account = res.body.data;
  accountId = common.getIdInHref(account.href, '/accounts/');
  return Promise.resolve({});
});

test(`get ${config.uriPrefix}/accounts/:id ok`, async (t) => {
  const url = `${config.uriPrefix}/accounts/${accountId}`;
  const res = await request.get(url).set('token', token);
  if (res.status >= 400) console.log(res.text);
  t.is(res.status, 200);
  // console.log(res.body.data);
  const tmp = res.body.data;
  t.is(tmp.id, account.id);
  t.is(tmp.name, account.name);
  t.is(tmp.account, account.account);
});

test(`post ${config.uriPrefix}/accounts/:id ok`, async (t) => {
  const url = `${config.uriPrefix}/accounts/${accountId}`;
  mockAccount.name = `${Math.random()}zz`;
  mockAccount.tel = `${Math.random()}98767`;
  const res = await request.post(url).send(mockAccount).set('token', token);
  if (res.status >= 400) console.log(res.text);
  t.is(res.status, 200);
  // console.log(res.body.data);
  const tmp = res.body.data;
  t.is(tmp.id, account.id);
  t.is(tmp.name, mockAccount.name);
  t.is(tmp.account, account.account);
  t.is(tmp.tel, mockAccount.tel);
});

test(`get ${config.uriPrefix}/accounts ok`, async (t) => {
  const url = `${directoryUrl}/accounts?name=${account.name}`;
  const res = await request.get(url).set('token', token);
  if (res.status >= 400) console.log(res.text);
  t.is(res.status, 200);
  // console.log(res.body.data);
});

test(`delete ${config.uriPrefix}/accounts/:id ok`, async (t) => {
  const url = `${config.uriPrefix}/accounts/${accountId}`;
  const res = await request.delete(url).set('token', token);
  if (res.status >= 400) console.log(res.text);
  t.is(res.status, 204);
});
