import test from 'ava';
import sinon from 'sinon';
import m from '.';

test.beforeEach(t => {
  t.context.done = sinon.spy();
});

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
