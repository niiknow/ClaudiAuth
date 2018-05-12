import test from 'ava';
import sinon from 'sinon';
import helper from './lib/helper';
import m from '.';

test.beforeEach(t => {
  t.context.done = sinon.spy();
});

test('list', t => {
  const helperMock = sinon.mock(helper);
  let actual = false;
  helperMock.expects('getStorage').withArgs('s3', 'template').returns({
    list: () => {
      actual = true;
    }
  });

  return m.proxyRouter({
    requestContext: {
      resourcePath: '/list',
      httpMethod: 'POST',
      authorizer: {claims: {'custom:rank': 'adm'}}
    }
  }, t.context).then(() => {
    helperMock.restore();
    helperMock.verify();
    return t.true(actual);
  });
});

/*
test('list', t => {
  return m.proxyRouter({
    requestContext: {
      resourcePath: '/list',
      httpMethod: 'GET'
    }
  }, t.context).then(() => {
    return t.true(t.context.done.calledOnce);
  });
});

test('create', t => {
  return m.proxyRouter({
    requestContext: {
      resourcePath: '/create',
      httpMethod: 'POST'
    }
  }, t.context).then(() => {
    return t.true(t.context.done.calledOnce);
  });
});

test('retrieve', t => {
  return m.proxyRouter({
    requestContext: {
      resourcePath: '/retrieve',
      httpMethod: 'GET'
    },
    pathParameters: {
      id: 'test'
    }
  }, t.context).then(() => {
    return t.true(t.context.done.calledOnce);
  });
});

test('update', t => {
  return m.proxyRouter({
    requestContext: {
      resourcePath: '/update',
      httpMethod: 'POST'
    },
    pathParameters: {
      id: 'test'
    }
  }, t.context).then(() => {
    return t.true(t.context.done.calledOnce);
  });
});

test('delete', t => {
  return m.proxyRouter({
    requestContext: {
      resourcePath: '/delete',
      httpMethod: 'POST'
    },
    pathParameters: {
      id: 'test'
    }
  }, t.context).then(() => {
    return t.true(t.context.done.calledOnce);
  });
});
*/
