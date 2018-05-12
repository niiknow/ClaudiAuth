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
  }).promise().then(result => {
    console.log('login result', result);
    return helper.translateAuthResult(result);
  });
});

api.post('/login-next', req => {
  const authData = {
    challenge: req.body.challenge.trim(),
    challenge_parameters: req.body.challenge_parameters.trim(),
    username: req.body.username.trim(),
    password: req.body.password.trim(),
    session: req.body.session.trim()
  };
  const rsp = {success: false};

  // see: https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_AdminInitiateAuth.html
  if (authData.challenge === 'NEW_PASSWORD_REQUIRED') {
    const challengeRequest = {
      ChallengeName: authData.challenge,
      ChallengeResponses: {
        USERNAME: authData.challenge_parameters.USER_ID_FOR_SRP || authData.username,
        NEW_PASSWORD: authData.password
      },
      Session: authData.session,
      ClientId: helper.poolData.clientId,
      UserPoolId: helper.poolData.id
    };
    return helper.cognitoIdentityServiceProvider.adminRespondToAuthChallenge(challengeRequest).promise();
  }

  return rsp;
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
  }).promise().then(result => {
    console.log('refresh result', result);
    return helper.translateAuthResult(result);
  });
});

api.post('/signup', req => {
  const result = Joi.validate(req.body, UserValidation.schema);
  if (result.error) {
    return helper.fail(result);
  }

  // setup required attributes
  const params = {
    ClientId: helper.poolData.clientId,
    Username: result.value.email,
    Password: result.value.password,
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

  helper.cognitoIdentityServiceProvider.signUp(params).promise().then(result => {
    console.log('signup result', result);
    return result;
  });
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
    ConfirmationCode: result.value.confirmationCode
  };

  helper.cognitoIdentityServiceProvider.confirmSignUp(params).promise().then(result => {
    console.log(result);
    return result;
  });
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

  helper.cognitoIdentityServiceProvider.resendConfirmationCode(params).promise().then(result => {
    console.log(result);
    return result;
  });
});

api.post('/change-pw', req => {
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

  helper.cognitoIdentityServiceProvider.changePassword(params).promise().then(result => {
    console.log(result);
    return result;
  });
});

api.post('/forgot-pw', req => {
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

  helper.cognitoIdentityServiceProvider.forgotPassword(params).promise().then(result => {
    console.log(result);
    return result;
  });
});

api.post('/forgot-pw-confirm', req => {
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

  helper.cognitoIdentityServiceProvider.confirmForgotPassword(params).promise().then(result => {
    console.log(result);
    return result;
  });
});
