/*
 * @Author: Zz
 * @Date: 2017-01-16 22:33:18
 * @Last Modified by: Zz
 * @Last Modified time: 2017-04-09 21:31:16
 */
import test from 'ava';
import fetchMock from 'fetch-mock';
import request from '../helpers/request';
import { dbOrm, config } from '../../src/common';

test.afterEach.always(() => {
  fetchMock.restore();
});

const mockApplication = {
  name: `zz application${Math.random()}`,
  description: 'test app',
  customData: {
    remark: 'test customData',
  },
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let application = null;
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

  const res1 = await request.post(`${config.uriPrefix}/applications?createDirectory=true`).set('token', token)
  .send(mockApplication);
  if (res1.status >= 400) console.log(res1.text);
  t.is(res1.status, 201);
  application = res1.body.data;
  gUrl = application.href.replace('http://localhost:3000', '');
  return Promise.resolve({});
});

test(`GET ${config.uriPrefix}/applications/:id`, async (t) => {
  const res = await request.get(gUrl).set('token', token);
  if (res.status >= 400) console.log(res.text);
  t.is(res.status, 200);
  // console.log(res.body);
  const tmp = res.body.data;
  t.is(tmp.id, application.id);
  t.is(tmp.name, application.name);
  t.is(tmp.description, application.description);
  t.is(tmp.tenantId, application.tenantId);
});

test(`POST ${config.uriPrefix}/applications/:id`, async (t) => {
  const description = 'zz test app';
  const res = await request.post(gUrl).send({
    description,
  }).set('token', token);
  if (res.status >= 400) console.log(res.text);
  t.is(res.status, 200);
  // console.log(res.body);
  const tmp = res.body.data;
  t.is(tmp.id, application.id);
  t.is(tmp.name, application.name);
  t.is(tmp.description, description);
  t.is(tmp.tenantId, application.tenantId);
});

test(`post ${config.uriPrefix}/applications`, async (t) => {
  const description = 'zz test app';
  const res = await request.post(gUrl).send({
    description,
  }).set('token', token);
  if (res.status >= 400) console.log(res.text);
  t.is(res.status, 200);
  // console.log(res.body);
});

test(`GET ${config.uriPrefix}/applications/:id/accounts`, async (t) => {
  const res = await request.get(`${gUrl}/accounts`).set('token', token);
  if (res.status >= 400) console.log(res.text);
  t.is(res.status, 200);
  // console.log(res.body);
});

// test(`POST ${config.uriPrefix}/applications/:id/loginAttempts`, async (t) => {
//   const value = new Buffer('admin:admin').toString('base64');
//   const res = await request.post(`${gUrl}/loginAttempts`).send({ value, type: 'basic' }).set('token', token);
//   if (res.status >= 400) console.log(res.text);
//   t.is(res.status, 200);
//   // console.log(res.body);
// });

test.serial(`DELETE ${config.uriPrefix}/applications/:id`, async (t) => {
  const res = await request.delete(gUrl).set('token', token);
  if (res.status >= 400) console.log(res.text);
  t.is(res.status, 204);
});
