import test from 'ava';
import fetchMock from 'fetch-mock';
import request from '../helpers/request';
import { dbOrm, common, config } from '../../src/common';

test.afterEach.always(() => {
  fetchMock.restore();
});

const mockTenant = {
  name: `${Math.random()}00000000`,
  secret: `${Math.random()}1210`,
  customData: {},
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let tenant = null;
let token = null;
let tenantId = null;
test.before(async (t) => {
  while (!dbOrm.models.collections) {
    await sleep(1000);
  }
  const tokenRes = await request.post(`${config.uriPrefix}/tokens`).send({
    key: 'zt001',
    secret: 'zz^&(^)',
  });
  if (tokenRes.status >= 400) console.log(tokenRes.text);
  t.is(tokenRes.status, 200);
  token = tokenRes.body.data.token;
  const res = await request.post(`${config.uriPrefix}/tenants`).send(mockTenant).set('token', token);
  t.is(res.status, 201);
  tenant = res.body.data;
  tenantId = common.getIdInHref(tenant.href, '/tenants/');
  const tmp = await request.post(`${config.uriPrefix}/tokens`).send({
    key: tenant.key,
    secret: mockTenant.secret,
  });
  if (tokenRes.status >= 400) console.log(tokenRes.text);
  t.is(tmp.status, 200);
  token = tmp.body.data.token;
  return Promise.resolve({});
});

test(`post ${config.uriPrefix}/tokens 200`, async (t) => {
  const res = await request.post(`${config.uriPrefix}/tokens`).send({
    key: tenant.key,
    secret: mockTenant.secret,
  });
  if (res.status >= 400) console.log(res.text);
  t.is(res.status, 200);
  // const tmp = res.body.data;
  // console.log(tmp);
});

test(`post ${config.uriPrefix}/tokens 404`, async (t) => {
  const res = await request.post(`${config.uriPrefix}/tokens`).send({
    key: tenant.key,
    secret: 'ww',
  });
  if (res.status >= 400) console.log(res.text);
  t.is(res.status, 404);
});

test(`get ${config.uriPrefix}/tenants/:id 200`, async (t) => {
  const res = await request.get(`${config.uriPrefix}/tenants/${tenantId}`).set('token', token);
  if (res.status >= 400) console.log(res.text);
  t.is(res.status, 200);
});
