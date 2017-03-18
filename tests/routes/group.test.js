import test from 'ava';
import fetchMock from 'fetch-mock';
import request from '../helpers/request';
import { dbOrm, common, config } from '../../src/common';

test.afterEach.always(() => {
  fetchMock.restore();
});

const mock = {
  name: `grop ${Math.random()}00000000`,
  descriptiomn: `${Math.random()}1210`,
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

let gData = null;
let token = null;
let directoryUrl = null;
let id = null;
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
  const res = await request.post(`${directoryUrl}/groups`).send(mock).set('token', token);
  if (res.status >= 400) console.log(res.text);
  t.is(res.status, 201);
  gData = res.body.data;
  id = common.getIdInHref(gData.href, '/groups/');
  return Promise.resolve({});
});

test(`get ${config.uriPrefix}/groups/:id ok`, async (t) => {
  const url = `${config.uriPrefix}/groups/${id}`;
  const res = await request.get(url).set('token', token);
  if (res.status >= 400) console.log(res.text);
  t.is(res.status, 200);
  // console.log(res.body.data);
  const tmp = res.body.data;
  t.is(tmp.id, gData.id);
  t.is(tmp.name, gData.name);
  t.is(tmp.description, gData.description);
});

test(`post ${config.uriPrefix}/groups/:id ok`, async (t) => {
  const url = `${config.uriPrefix}/groups/${id}`;
  mock.name = `${Math.random()}zz`;
  mock.description = `${Math.random()}98767`;
  const res = await request.post(url).send(mock).set('token', token);
  if (res.status >= 400) console.log(res.text);
  t.is(res.status, 200);
  // console.log(res.body.data);
  const tmp = res.body.data;
  t.is(tmp.id, gData.id);
  t.is(tmp.name, mock.name);
  t.is(tmp.description, mock.description);
});

test(`get ${config.uriPrefix}/groups ok`, async (t) => {
  const url = `${directoryUrl}/groups`;
  const res = await request.get(url).set('token', token);
  if (res.status >= 400) console.log(res.text);
  t.is(res.status, 200);
  // console.log(res.body.data);
});

test(`delete ${config.uriPrefix}/groups/:id ok`, async (t) => {
  const url = `${config.uriPrefix}/groups/${id}`;
  const res = await request.delete(url).set('token', token);
  if (res.status >= 400) console.log(res.text);
  t.is(res.status, 204);
});
