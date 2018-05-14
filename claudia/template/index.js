const ApiBuilder = require('claudia-api-builder');
const Joi = require('joi');
const helper = require('./lib/helper');
const Access = require('./lib/access');

const name = 'template';
const api = new ApiBuilder();

api.registerAuthorizer('MyCustomAuth', {
  providerARNs: [helper.userPoolArn]
});

module.exports = api;

api.post('/list', req => {
  const auth = req.context.authorizer;
  const storage = helper.getStorage('s3', name);
  // console.log(JSON.stringify(auth, 2));

  // only admiral rank and user can read
  if (!Access.isRank(auth, 'adm')) {
    return helper.fail('Access is denied');
  }

  return storage.list();
}, {cognitoAuthorizer: 'MyCustomAuth'});

api.post('/create', req => {
  const auth = req.context.authorizer;
  const storage = helper.getStorage('s3', name);
  // console.log(JSON.stringify(auth, 2));

  // validate
  const result = Joi.validate(req.body, {
    name: helper.schema.default.name
  });
  if (result.error) {
    return helper.fail(result);
  }

  // only admiral rank and user can read
  if (!Access.isRank(auth, 'adm')) {
    return helper.fail('Access is denied');
  }

  return storage.save(result.value);
}, {cognitoAuthorizer: 'MyCustomAuth'});

api.get('/retrieve/{id}', req => {
  const auth = req.context.authorizer;
  const storage = helper.getStorage('s3', name);
  // console.log(JSON.stringify(auth, 2));

  // validate
  const result = Joi.validate(req.pathParams, {
    id: helper.schema.default.id
  });
  if (result.error) {
    return helper.fail(result);
  }

  // only admiral rank and user can read
  if (!Access.isRank(auth, 'adm')) {
    return helper.fail('Access is denied');
  }

  return storage.retrieve(result.value.id);
}, {cognitoAuthorizer: 'MyCustomAuth'});

api.post('/update', req => {
  const auth = req.context.authorizer;
  const storage = helper.getStorage('s3', name);
  // console.log(JSON.stringify(auth, 2));

  // validate
  const result = Joi.validate(req.body, {
    id: helper.schema.default.id,
    name: helper.schema.default.name
  });
  if (result.error) {
    return helper.fail(result);
  }

  // only admiral rank and user can read
  if (!Access.isRank(auth, 'adm')) {
    return helper.fail('Access is denied');
  }

  return storage.save(result.value);
}, {cognitoAuthorizer: 'MyCustomAuth'});

api.post('/delete/{id}', req => {
  const auth = req.context.authorizer;
  const storage = helper.getStorage('s3', name);
  // console.log(JSON.stringify(auth, 2));

  // validate
  const result = Joi.validate(req.pathParams, {
    id: helper.schema.default.id
  });
  if (result.error) {
    return helper.fail(result);
  }

  // only admiral rank and user can read
  if (!Access.isRank(auth, 'adm')) {
    return helper.fail('Access is denied');
  }

  return storage.delete(result.value.id);
}, {cognitoAuthorizer: 'MyCustomAuth'});
