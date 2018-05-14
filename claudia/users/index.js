const ApiBuilder = require('claudia-api-builder');
const Joi = require('joi');
const UserValidation = require('./lib/user.validation');
const helper = require('./lib/helper');
const Access = require('./lib/access');

const api = new ApiBuilder();

api.registerAuthorizer('MyCustomAuth', {
  providerARNs: [helper.userPoolArn]
});

module.exports = api;

api.post('/list', req => {
  const auth = req.context.authorizer;
  // console.log(JSON.stringify(auth, 2));

  // only admiral rank can do this
  if (!Access.isRank(auth, 'adm')) {
    return helper.fail('Access is denied.');
  }

  // validate
  const result = Joi.validate(req.body, {
    filter: Joi.string().trim(),
    limit: Joi.number().max(60),
    page: Joi.string().trim()
  });

  if (result.error) {
    return helper.fail(result);
  }
  if (!result.value.filter) {
    result.value.filter = 'cognito:user_status = "CONFIRMED"';
  }

  return helper.cognitoIdentityServiceProvider.listUsers({
    AttributesToGet: ['email', 'custom:rank', 'custom:uid'],
    Filter: result.value.filter,
    Limit: result.value.limit || 60,
    PaginationToken: result.value.page,
    UserPoolId: helper.poolData.id
  }).promise().then(rst => {
    const users = [];

    if (rst.Users) {
      rst.Users.forEach(user => {
        users.push(helper.transformCognitoUser(user));
      });
    }

    return helper.success({Users: users});
  }).catch(helper.fail);
}, {cognitoAuthorizer: 'MyCustomAuth'});

api.post('/create', req => {
  const auth = req.context.authorizer;
  // console.log(JSON.stringify(auth, 2));

  // only admiral rank can do this
  if (!Access.isRank(auth, 'adm')) {
    return helper.fail('Access is denied.');
  }

  const result = Joi.validate(req.body, UserValidation.schema);
  if (result.error) {
    return helper.fail(result);
  }
  const uuid = helper.uuidEmail(result.value.email);

  // setup required attributes
  const params = {
    UserPoolId: helper.poolData.id,
    Username: uuid,
    TemporaryPassword: result.value.password,
    ForceAliasCreation: true,
    UserAttributes: [
      {
        Name: 'custom:uid',
        Value: uuid
      },
      {
        Name: 'custom:rank',
        Value: 'user'
      }
    ]
  };

  for (const k in result.value) {
    if ([
      'password', 'confirmPassword', 'uid',
      'rank', 'teams', 'email', 'preferred_username',
      'create_at', 'update_at', 'enabled', 'status',
      'email_verified', 'phone_number_verified'
    ].indexOf(k) > -1) {
      continue;
    }

    if (UserValidation.custom.indexOf(k) > -1) {
      params.UserAttributes.push({
        Name: `custom:${k}`,
        Value: result.value[k]
      });
    } else {
      params.UserAttributes.push({
        Name: k,
        Value: result.value[k]
      });
    }
  }

  return helper.cognitoIdentityServiceProvider.adminCreateUser(params)
    .promise().then(helper.success).catch(helper.fail);
}, {cognitoAuthorizer: 'MyCustomAuth'});

api.get('/retrieve/{email}', req => {
  const auth = req.context.authorizer;
  // console.log(JSON.stringify(auth, 2));

  // validate
  const result = Joi.validate(req.pathParams, {
    email: UserValidation.schema.email
  });
  if (result.error) {
    return helper.fail(result);
  }

  // only admiral rank
  if (!Access.isRank(auth, 'adm')) {
    return helper.fail('Access is denied.');
  }

  return helper.cognitoIdentityServiceProvider.adminGetUser({
    Username: result.value.email,
    UserPoolId: helper.poolData.id
  }).promise().then(helper.success).catch(helper.fail);
}, {cognitoAuthorizer: 'MyCustomAuth'});

api.post('/update', req => {
  const auth = req.context.authorizer;
  // console.log(JSON.stringify(auth, 2));

  // only admiral rank can do this
  if (!Access.isRank(auth, 'adm')) {
    return helper.fail('Access is denied.');
  }

  const schema = Object.assign({}, UserValidation.schema);
  delete schema.password;
  delete schema.confirmPassword;

  const result = Joi.validate(req.body, schema);
  if (result.error) {
    return helper.fail(result);
  }

  // setup required attributes
  const params = {
    UserPoolId: helper.poolData.id,
    Username: result.value.email,
    UserAttributes: []
  };

  for (const k in result.value) {
    if ([
      'password', 'confirmPassword', 'uid',
      'rank', 'teams', 'email', 'preferred_username',
      'create_at', 'update_at', 'enabled', 'status',
      'email_verified', 'phone_number_verified'
    ].indexOf(k) > -1) {
      continue;
    }

    if (UserValidation.custom.indexOf(k) > -1) {
      params.UserAttributes.push({
        Name: `custom:${k}`,
        Value: result.value[k]
      });
    } else {
      params.UserAttributes.push({
        Name: k,
        Value: result.value[k]
      });
    }
  }

  // setup required attributes
  return helper.cognitoIdentityServiceProvider.adminUpdateUserAttributes(params)
    .promise().then(helper.success).catch(helper.fail);
}, {cognitoAuthorizer: 'MyCustomAuth'});

api.post('/delete/{email}', req => {
  const auth = req.context.authorizer;
  // console.log(JSON.stringify(auth, 2));

  // only admiral rank
  if (!Access.isRank(auth, 'adm')) {
    return helper.fail('Access is denied.');
  }

  // validate
  const result = Joi.validate(req.pathParams, {
    email: UserValidation.schema.email
  });
  if (result.error) {
    return helper.fail(result);
  }

  return helper.cognitoIdentityServiceProvider.adminDeleteUser({
    UserPoolId: helper.poolData.id,
    Username: result.value.email
  }).promise().then(helper.success).catch(helper.fail);
}, {cognitoAuthorizer: 'MyCustomAuth'});

api.post('/disable/{email}', req => {
  const auth = req.context.authorizer;
  // console.log(JSON.stringify(auth, 2));

  // only admiral rank
  if (!Access.isRank(auth, 'adm')) {
    return helper.fail({message: 'Access is denied.'});
  }

  // validate
  const result = Joi.validate(req.pathParams, {
    email: UserValidation.schema.email
  });
  if (result.error) {
    return helper.fail(result);
  }

  return helper.cognitoIdentityServiceProvider.adminDisableUser({
    UserPoolId: helper.poolData.id,
    Username: result.value.email
  }).promise().then(helper.success).catch(helper.fail);
}, {cognitoAuthorizer: 'MyCustomAuth'});

api.post('/enable/{email}', req => {
  const auth = req.context.authorizer;
  // console.log(JSON.stringify(auth, 2));

  // only admiral rank
  if (!Access.isRank(auth, 'adm')) {
    return helper.fail('Access is denied.');
  }

  // validate
  const result = Joi.validate(req.pathParams, {
    email: UserValidation.schema.email
  });
  if (result.error) {
    return helper.fail(result);
  }

  return helper.cognitoIdentityServiceProvider.adminEnableUser({
    UserPoolId: helper.poolData.id,
    Username: result.value.email
  }).promise().then(helper.success).catch(helper.fail);
}, {cognitoAuthorizer: 'MyCustomAuth'});

/**
 * set rank
 * @param String  rank    adm/capt/cdr/lt/ens
 * @param String  email
 */
api.post('/rank/{rank}/{email}', req => {
  const auth = req.context.authorizer;
  // console.log(JSON.stringify(auth, 2));

  // only admiral rank
  if (!Access.isRank(auth, 'adm')) {
    return helper.fail('Access is denied.');
  }

  // validate
  const result = Joi.validate(req.pathParams, {
    email: UserValidation.schema.email,
    rank: Joi.string().trim().valid(['adm', 'capt', 'cdr', 'lt', 'ens', 'user'])
  });
  if (result.error) {
    return helper.fail(result);
  }

  // setup required attributes
  const params = {
    UserPoolId: helper.poolData.id,
    Username: result.value.email,
    UserAttributes: [
      {
        Name: 'custom:rank',
        Value: result.value.rank
      }
    ]
  };
  return helper.cognitoIdentityServiceProvider.adminUpdateUserAttributes(params)
    .promise().then(helper.success).catch(helper.fail);
}, {cognitoAuthorizer: 'MyCustomAuth'});
