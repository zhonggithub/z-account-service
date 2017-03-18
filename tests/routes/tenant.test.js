import test from 'ava';
import fetchMock from 'fetch-mock';
import request from '../helpers/request';
import { dbOrm, config } from '../../src/common';

test.afterEach.always(() => {
  fetchMock.restore();
});

const mockTenant = {
  name: `${Math.random()}00000000`,
  secret: `${Math.random()}00909`,
  // customData: {},
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let tenant = null;
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
  const res = await request.post(`${config.uriPrefix}/tenants`).send(mockTenant).set('token', token);
  if (res.status >= 400) console.log(res.text);
  t.is(res.status, 201);
  tenant = res.body.data;
  gUrl = tenant.href.replace('http://localhost:3000', '');
  return Promise.resolve({});
});

test(`GET ${config.uriPrefix}/tenants/:id ok`, async (t) => {
  const res = await request.get(`${config.uriPrefix}/tenants/${tenant.id}`).set('token', token);
  if (res.status >= 400) console.log(res.text);
  t.is(res.status, 200);
  // console.log(res.body);
  const tmp = res.body.data;
  t.is(tmp.id, tenant.id);
  t.is(tmp.name, tenant.name);
});

test(`GET ${config.uriPrefix}/tenants/:id 404`, async (t) => {
  const res = await request.get(`${config.uriPrefix}/tenants/uuuaaa`).set('token', token);
  if (res.status >= 400) console.log(res.text);
  t.is(res.status, 404);
  // console.log(res.body);
});

test(`POST ${config.uriPrefix}/tenants/:id 200`, async (t) => {
  const tmpData = {
    name: `${Math.random()}test`,
  };
  const res = await request.post(gUrl).send(tmpData).set('token', token);
  if (res.status >= 400) console.log(res.text);
  t.is(res.status, 200);
  const tmp = res.body.data;
  // console.log(res.body);
  t.is(tmp.name, tmpData.name);
  t.is(tmp.href, tenant.href);
});

test(`GET ${config.uriPrefix}/tenants 200`, async (t) => {
  const res = await request.get(`${config.uriPrefix}/tenants`).set('token', token);
  if (res.status >= 400) console.log(res.text);
  t.is(res.status, 200);
  // const tmp = res.body.data;
  // console.log(tmp);
});

test(`DELETE ${config.uriPrefix}/tenants/:id 204`, async (t) => {
  const res = await request.delete(gUrl).set('token', token);
  if (res.status >= 400) console.log(res.text);
  t.is(res.status, 204);
});
