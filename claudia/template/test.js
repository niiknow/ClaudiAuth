import test from 'ava';
import sinon from 'sinon';
import m from '.';

test.beforeEach(t => {
  t.context.done = sinon.spy();
});

test('hello', t => {
  return m.proxyRouter({
    requestContext: {
      resourcePath: '/hello',
      httpMethod: 'POST'
    },
    pathParameters: {
      id: 'world'
    }
  }, t.context).then(() => {
    return t.true(t.context.done.calledOnce);
  });
});
