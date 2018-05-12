const ApiBuilder = require('claudia-api-builder');
const helper = require('./lib/helper');

const api = new ApiBuilder();

module.exports = api;

api.post('/list', req => {
  const auth = req.context.authorizer;
  // console.log(JSON.stringify(auth, 2));

  // only admiral rank can do this
  if (!helper.isRank(auth, 'adm')) {
    return helper.fail({message: 'Access is denied.'});
  }

  const data = {
    filter: req.body.filter,
    limit: req.body.limit || 60,
    page: req.body.page
  };

  if (data.limit > 60) {
    data.limit = 60;
  }

  helper.cognitoIdentityServiceProvider.listUsers({
    AttributesToGet: ['username', 'email', 'phone', 'given_name', 'family_name'],
    Filter: data.filter,
    Limit: data.limit,
    PaginationToken: data.page,
    UserPoolId: helper.poolData.id
  }).promise().then(result => {
    console.log('list result', result);
    return helper.success(result);
  }).catch(err => {
    console.log('list err', err);
    return helper.fail(err);
  });
});

api.post('/create', req => {
  const auth = req.context.authorizer;
  // console.log(JSON.stringify(auth, 2));

  // only admiral rank can do this
  if (!helper.isRank(auth, 'adm')) {
    return helper.fail({message: 'Access is denied.'});
  }

  const result = Joi.validate(req.body, UserValidation.schema);
  if (result.error) {
    return helper.fail(result);
  }

  // setup required attributes
  const params = {
    UserPoolId: helper.poolData.id,
    Username: result.value.email,
    TemporaryPassword: result.value.password,
    UserAttributes: [
      {
        Name: 'custom:uid',
        Value: helper.uuidEmail(result.value.email)
      },
      {
        Name: 'custom:rank',
        Value: 'user'
      }
    ]
  };

  for (const k in result.value) {
    if (['password', 'confirmPassword', 'uid', 'rank'].indexOf(k) > -1) {
      continue;
    }

    if (UserValidation.custom.indexOf(k) > -1) {
      params.UserAttributes.push({
        Name: `custom:${k}`,
        Value: result.value[k]
      })
    } else {
      params.UserAttributes.push({
        Name: k,
        Value: result.value[k]
      })
    }
  }

  helper.cognitoIdentityServiceProvider.adminCreateUser(params).promise().then(result => {
    console.log('create result', result);
    return result;
  });
});

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

  // only admiral rank and user can read
  if (!helper.isRank(auth, 'adm') && !helper.isUser(auth, result.value.email)) {
    return helper.fail({message: 'Access is denied.'});
  }

  helper.cognitoIdentityServiceProvider.listUsers({
    Username: result.value.email,
    UserPoolId: helper.poolData.id
  }).promise().then(result => {
    console.log('retrieve result', result);
    return helper.success(result);
  }).catch(err => {
    console.log('retrieve err', err);
    return helper.fail(err);
  });
});

api.post('/update', req => {
  const auth = req.context.authorizer;
  // console.log(JSON.stringify(auth, 2));

  // only admiral rank can do this
  if (!helper.isRank(auth, 'adm')) {
    return helper.fail({message: 'Access is denied.'});
  }
  const schema = Object.assign({}, UserValidation.schema);
  delete schema['password'];
  delete schema['confirmPassword'];

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
    if (['password', 'confirmPassword', 'uid', 'rank'].indexOf(k) > -1) {
      continue;
    }

    if (UserValidation.custom.indexOf(k) > -1) {
      params.UserAttributes.push({
        Name: `custom:${k}`,
        Value: result.value[k]
      })
    } else {
      params.UserAttributes.push({
        Name: k,
        Value: result.value[k]
      })
    }
  }

  helper.cognitoIdentityServiceProvider.adminUpdateUserAttributes(params).promise().then(result => {
    console.log('update result', result);
    return result;
  });
});

api.post('/delete/{email}', req => {
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
  if (!helper.isRank(auth, 'adm')) {
    return helper.fail({message: 'Access is denied.'});
  }

  helper.cognitoIdentityServiceProvider.adminDeleteUser({
    UserPoolId: helper.poolData.id,
    Username: result.value.email
  }).promise().then(result => {
    console.log('delete result', result);
    return result;
  });
});

api.post('/disable/{email}', req => {
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
  if (!helper.isRank(auth, 'adm')) {
    return helper.fail({message: 'Access is denied.'});
  }

  helper.cognitoIdentityServiceProvider.adminDisableUser({
    UserPoolId: helper.poolData.id,
    Username: result.value.email
  }).promise().then(result => {
    console.log('disable result', result);
    return result;
  });
});

api.post('/enable/{email}', req => {
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
  if (!helper.isRank(auth, 'adm')) {
    return helper.fail({message: 'Access is denied.'});
  }

  helper.cognitoIdentityServiceProvider.adminEnableUser({
    UserPoolId: helper.poolData.id,
    Username: result.value.email
  }).promise().then(result => {
    console.log('enable result', result);
    return result;
  });
});

/**
 * set rank
 * @param String  rank    adm/capt/cdr/lt/ens
 * @param String  email
 */
api.post('/rank/{rank}/{email}', request => {
  const auth = req.context.authorizer;
  // console.log(JSON.stringify(auth, 2));

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

  helper.cognitoIdentityServiceProvider.adminUpdateUserAttributes(params).promise().then(result => {
    console.log('rank result', result);
    return result;
  });
});
