import test from 'ava';
import sinon from 'sinon';
import helper from './lib/helper';
import m from '.';
import uuidv4 from 'uuid/v4';

test.beforeEach(t => {
  t.context.done = sinon.spy();
});

test.serial('list', async t => {
  let actual = false;
  const helperMock = sinon.stub(helper, 'getStorage').callsFake(() => {
    return {
      list: () => {
        actual = true;
      }
    };
  });

  await m.proxyRouter({
    requestContext: {
      resourcePath: '/list',
      httpMethod: 'POST',
      authorizer: {claims: {'custom:rank': 'adm'}}
    }
  }, t.context);

  helperMock.restore();
  t.true(actual);
  t.pass();
});

test.serial('create', async t => {
  let actual = false;
  const helperMock = sinon.stub(helper, 'getStorage').callsFake(() => {
    return {
      save: () => {
        actual = true;
      }
    };
  });

  await m.proxyRouter({
    requestContext: {
      resourcePath: '/create',
      httpMethod: 'POST',
      authorizer: {claims: {'custom:rank': 'adm'}}
    },
    body: {name: 'test'}
  }, t.context);
  helperMock.restore();
  t.true(actual);
  t.pass();
});

test.serial('retrieve', async t => {
  let actual = false;
  const helperMock = sinon.stub(helper, 'getStorage').callsFake(() => {
    return {
      retrieve: () => {
        actual = true;
      }
    };
  });

  await m.proxyRouter({
    requestContext: {
      resourcePath: '/retrieve/{id}',
      httpMethod: 'GET',
      authorizer: {claims: {'custom:rank': 'adm'}}
    },
    pathParameters: {id: uuidv4()}
  }, t.context);
  helperMock.restore();
  t.true(actual);
  t.pass();
});

test.serial('update', async t => {
  let actual = false;
  const helperMock = sinon.stub(helper, 'getStorage').callsFake(() => {
    return {
      save: () => {
        actual = true;
      }
    };
  });

  await m.proxyRouter({
    requestContext: {
      resourcePath: '/update',
      httpMethod: 'POST',
      authorizer: {claims: {'custom:rank': 'adm'}}
    },
    body: {name: 'test', id: uuidv4()}
  }, t.context);
  helperMock.restore();
  t.true(actual);
  t.pass();
});

test.serial('delete', async t => {
  let actual = false;
  const helperMock = sinon.stub(helper, 'getStorage').callsFake(() => {
    return {
      delete: () => {
        actual = true;
      }
    };
  });

  await m.proxyRouter({
    requestContext: {
      resourcePath: '/delete/{id}',
      httpMethod: 'POST',
      authorizer: {claims: {'custom:rank': 'adm'}}
    },
    pathParameters: {id: uuidv4()}
  }, t.context);
  helperMock.restore();
  t.true(actual);
  t.pass();
});
