/*
 * @Author: Zz
 * @Date: 2017-01-17 21:05:36
 * @Last Modified by: Zz
 * @Last Modified time: 2017-03-18 23:04:12
 */
import test from 'ava';
import fetchMock from 'fetch-mock';
import request from '../helpers/request';
import { dbOrm, config } from '../../src/common';

test.afterEach.always(() => {
  fetchMock.restore();
});

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

let gData = null;
let gUrl = null;
let token = null;
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
  gData = res1.body.data;
  gUrl = gData.href.replace('http://localhost:3000', '');
  return Promise.resolve({});
});

test(`GET ${config.uriPrefix}/directories/:id`, async (t) => {
  const res = await request.get(gUrl).set('token', token);
  if (res.status >= 400) console.log(res.text);
  t.is(res.status, 200);
  // console.log(res.body);
  const tmp = res.body.data;
  t.is(tmp.id, gData.id);
  t.is(tmp.name, gData.name);
  t.is(tmp.description, gData.description);
  t.is(tmp.tenantId, gData.tenantId);
});

test(`POST ${config.uriPrefix}/directories/:id`, async (t) => {
  const description = 'zz test app';
  const res = await request.post(gUrl).send({
    description,
  }).set('token', token);
  if (res.status >= 400) console.log(res.text);
  t.is(res.status, 200);
  // console.log(res.body);
  const tmp = res.body.data;
  t.is(tmp.id, gData.id);
  t.is(tmp.name, gData.name);
  t.is(tmp.description, description);
  t.is(tmp.tenantId, gData.tenantId);
});

test(`GET ${config.uriPrefix}/directories`, async (t) => {
  const description = 'zz test app';
  const res = await request.post(gUrl).send({
    description,
  }).set('token', token);
  if (res.status >= 400) console.log(res.text);
  t.is(res.status, 200);
  // console.log(res.body);
});

test.serial(`DELETE ${config.uriPrefix}/directories/:id`, async (t) => {
  const res = await request.delete(gUrl).set('token', token);
  if (res.status >= 400) console.log(res.text);
  t.is(res.status, 204);
});
