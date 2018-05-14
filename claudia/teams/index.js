const ApiBuilder = require('claudia-api-builder');
const Joi = require('joi');
const helper = require('./lib/helper');
const AccessHelper = require('./lib/access');

const name = 'teams';
const api = new ApiBuilder();

module.exports = api;

api.post('/list', async req => {
  const auth = req.context.authorizer;
  const storage = helper.getStorage('s3', name);
  const isUser = !AccessHelper.isRank(auth, 'adm');

  return storage.list().then(rst => {
    const rsp = [];

    // if not admin
    if (isUser) {
      const teams = (auth.claims['custom:teams'] || '').split(',');
      rst.forEach(item => {
        // filter out the list of teams
        // to only the one that user has on their list
        if (teams.indexOf(item.id) > 0) {
          rsp.push(item);
        }
      });
      return helper.success(rsp);
    }

    return helper.success(rst);
  }).catch(helper.fail);
});

api.post('/create', req => {
  const auth = req.context.authorizer;
  const storage = helper.getStorage('s3', name);
  // console.log(JSON.stringify(auth, 2));

  // validate
  const result = Joi.validate(req.body, {
    name: helper.schema.default.name,
    desc: Joi.string().trim()
  });
  if (result.error) {
    return helper.fail(result);
  }

  // only admiral rank can create team
  if (!AccessHelper.isRank(auth, 'adm')) {
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
  const acc = AccessHelper.canAccessTeam(auth, result.value.id);
  if (acc && acc.read) {
    return storage.retrieve(result.value.id);
  }

  return helper.fail('Access is denied');
});

api.post('/update', req => {
  const auth = req.context.authorizer;
  const storage = helper.getStorage('s3', name);
  // console.log(JSON.stringify(auth, 2));

  // validate
  const result = Joi.validate(req.body, {
    id: helper.schema.default.id,
    name: helper.schema.default.name,
    desc: Joi.string().trim()
  });
  if (result.error) {
    return helper.fail(result);
  }

  const acc = AccessHelper.canAccessTeam(auth, result.value.id);
  if (acc && acc.write) {
    return storage.save(result.value);
  }

  return helper.fail('Access is denied');
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

  const acc = AccessHelper.canAccessTeam(auth, result.value.id);
  if (acc && acc.write) {
    return storage.delete(result.value.id);
  }

  return helper.fail('Access is denied');
});

api.post('/{id}/access/{access}/user/{uid}', req => {
  const auth = req.context.authorizer;
  const storage = helper.getStorage('s3', name);
  // console.log(JSON.stringify(auth, 2));

  // validate
  const result = Joi.validate(req.pathParams, {
    id: helper.schema.default.id,
    uid: helper.schema.default.id,
    access: Joi.string().trim().valid(['admin', 'user', 'remove'])
  });
  if (result.error) {
    return helper.fail(result);
  }

  const acc = AccessHelper.canAccessTeam(auth, result.value.id);
  if (acc && acc.access === 'admin') {
    const payload = {};
    payload[result.value.uid] = result.value.access;

    return storage.specialAttr(result.value.id, 'users', payload);
  }

  return helper.fail('Access is denied');
});
