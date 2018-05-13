const ApiBuilder = require('claudia-api-builder');
const Joi = require('joi');
const helper = require('./lib/helper');

const name = 'template';
const api = new ApiBuilder();

module.exports = api;

api.post('/list', req => {
  const auth = req.context.authorizer;
  const storage = helper.getStorage('s3', name);
  // console.log(JSON.stringify(auth, 2));

  // only admiral rank and user can read
  if (!helper.isRank(auth, 'adm')) {
    return helper.fail('Access is denied');
  }

  return storage.list();
});

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
  if (!helper.isRank(auth, 'adm')) {
    return helper.fail('Access is denied');
  }

  return storage.save(result.value);
});

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
  if (!helper.isRank(auth, 'adm')) {
    return helper.fail('Access is denied');
  }

  return storage.retrieve(result.value.id);
});

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
  if (!helper.isRank(auth, 'adm')) {
    return helper.fail('Access is denied');
  }

  return storage.save(result.value);
});

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
  if (!helper.isRank(auth, 'adm')) {
    return helper.fail('Access is denied');
  }

  return storage.delete(result.value.id);
});
