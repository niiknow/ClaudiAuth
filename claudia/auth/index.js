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
  const authFlow = req.body.secure ? 'USER_PASSWORD_AUTH' : 'ADMIN_NO_SRP_AUTH';

  // validate
  const result = Joi.validate(req.body, {
    email: UserValidation.schema.email,
    password: Joi.string().required()
  });
  if (result.error) {
    return helper.fail(result);
  }

  helper.cognitoIdentityServiceProvider.adminInitiateAuth({
    AuthFlow: authFlow,
    AuthParameters: {
      USERNAME: result.value.email,
      PASSWORD: result.value.password
    },
    ClientId: helper.poolData.clientId,
    UserPoolId: helper.poolData.id
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

  helper.cognitoIdentityServiceProvider.adminInitiateAuth({
    AuthFlow: 'REFRESH_TOKEN_AUTH',
    AuthParameters: {
      REFRESH_TOKEN: result.value.refresh_token
    },
    ClientId: helper.poolData.clientId,
    UserPoolId: helper.poolData.id
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
    Username: uuid,
    Password: result.value.password,
    UserAttributes: [
      {
        Name: 'preferred_username',
        Value: uuid
      },
      {
        Name: 'email',
        Value: result.value.email
      },
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
      'rank', 'email', 'preferred_username'
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

  helper.cognitoIdentityServiceProvider.signUp(params)
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

  helper.cognitoIdentityServiceProvider.confirmSignUp(params).promise()
    .then(helper.success).catch(helper.fail);
});

api.post('/confirm-resend', req => {
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

  helper.cognitoIdentityServiceProvider.resendConfirmationCode(params).promise()
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

  helper.cognitoIdentityServiceProvider.changePassword(params).promise()
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

  helper.cognitoIdentityServiceProvider.forgotPassword(params).promise()
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
    Username: result.value.username,
    ConfirmationCode: result.value.confirmationCode,
    Password: result.value.password
  };

  helper.cognitoIdentityServiceProvider.confirmForgotPassword(params).promise()
    .then(helper.success).catch(helper.fail);
});
