const ApiBuilder = require('claudia-api-builder');
const Joi = require('joi');
const helper = require('./lib/helper');
const UserValidation = require('./lib/user.validation');

const api = new ApiBuilder();

module.exports = api;
// references:
// https://docs.aws.amazon.com/cognito/latest/developerguide/using-amazon-cognito-user-identity-pools-javascript-examples.html
// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html

api.post('/login', req => {
  const authFlow = req.body.custom ? 'CUSTOM_AUTH' : 'USER_PASSWORD_AUTH';

  // validate
  const result = Joi.validate(req.body, {
    email: UserValidation.schema.email,
    password: Joi.string().required()
  });
  if (result.error) {
    return helper.fail(result);
  }

  return helper.cognitoIdentityServiceProvider.initiateAuth({
    AuthFlow: authFlow,
    AuthParameters: {
      USERNAME: result.value.email,
      PASSWORD: result.value.password
    },
    ClientId: helper.poolData.clientId
  }).promise().then(helper.translateAuthResult);
});

api.post('/login-new-password', req => {
  // validate
  const result = Joi.validate(req.body, {
    password: UserValidation.schema.password,
    confirmPassword: UserValidation.schema.confirmPassword,
    session: Joi.string().trim().required(),
    email: UserValidation.schema.email
  });
  if (result.error) {
    return helper.fail(result);
  }

  return helper.cognitoIdentityServiceProvider.respondToAuthChallenge({
    ChallengeName: 'NEW_PASSWORD_REQUIRED',
    ChallengeResponses: {
      USERNAME: result.value.email,
      PASSWORD: result.value.password
    },
    ClientId: helper.poolData.clientId,
    Session: result.value.session
  }).promise().then(helper.translateAuthResult);
});

api.post('/refresh', req => {
  // validate
  const result = Joi.validate(req.body, {
    refresh_token: Joi.string().trim().required()
  });
  if (result.error) {
    return helper.fail(result);
  }

  return helper.cognitoIdentityServiceProvider.initiateAuth({
    AuthFlow: 'REFRESH_TOKEN_AUTH',
    AuthParameters: {
      REFRESH_TOKEN: result.value.refresh_token
    },
    ClientId: helper.poolData.clientId
  }).promise().then(helper.translateAuthResult);
});

api.post('/signup', req => {
  const result = Joi.validate(req.body, UserValidation.schema);
  if (result.error) {
    return helper.fail(result);
  }
  const uuid = helper.uuidEmail(result.value.email);

  // setup required attributes
  const params = {
    ClientId: helper.poolData.clientId,
    Username: result.value.email,
    Password: result.value.password,
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

  return helper.cognitoIdentityServiceProvider.signUp(params)
    .promise().then(helper.success).catch(helper.fail);
});

api.post('/signup-confirm', req => {
  // validate
  const result = Joi.validate(req.body, {
    email: UserValidation.schema.email,
    confirmationCode: Joi.string().trim().required()
  });
  if (result.error) {
    return helper.fail(result);
  }
  const params = {
    ClientId: helper.poolData.clientId,
    Username: result.value.email,
    ConfirmationCode: result.value.confirmationCode,
    ForceAliasCreation: true
  };

  return helper.cognitoIdentityServiceProvider.confirmSignUp(params).promise()
    .then(helper.success).catch(helper.fail);
});

api.post('/signup-confirm-resend', req => {
  // validate
  const result = Joi.validate(req.body, {
    email: UserValidation.schema.email
  });
  if (result.error) {
    return helper.fail(result);
  }

  const params = {
    ClientId: helper.poolData.clientId,
    Username: result.value.email
  };

  return helper.cognitoIdentityServiceProvider.resendConfirmationCode(params).promise()
    .then(helper.success).catch(helper.fail);
});

api.post('/change-password', req => {
  // validate
  const result = Joi.validate(req.body, {
    token: Joi.string().trim().required(),
    password: UserValidation.schema.password,
    oldPassword: Joi.string().trim().required()
  });
  if (result.error) {
    return helper.fail(result);
  }

  const params = {
    PreviousPassword: result.value.oldPassword,
    ProposedPassword: result.value.password,
    AccessToken: result.value.token
  };

  return helper.cognitoIdentityServiceProvider.changePassword(params).promise()
    .then(helper.success).catch(helper.fail);
});

api.post('/forgot-password', req => {
  // validate
  const result = Joi.validate(req.body, {
    email: UserValidation.schema.email
  });
  if (result.error) {
    return helper.fail(result);
  }

  const params = {
    ClientId: helper.poolData.clientId,
    Username: result.value.email
  };

  return helper.cognitoIdentityServiceProvider.forgotPassword(params).promise()
    .then(helper.success).catch(helper.fail);
});

api.post('/forgot-password-confirm', req => {
  // validate
  const result = Joi.validate(req.body, {
    email: UserValidation.schema.email,
    confirmationCode: Joi.string().trim().required(),
    password: Joi.string().trim().required()
  });
  if (result.error) {
    return helper.fail(result);
  }

  const params = {
    ClientId: helper.poolData.clientId,
    Username: result.value.email,
    ConfirmationCode: result.value.confirmationCode,
    Password: result.value.password
  };

  return helper.cognitoIdentityServiceProvider.confirmForgotPassword(params).promise()
    .then(helper.success).catch(helper.fail);
});
