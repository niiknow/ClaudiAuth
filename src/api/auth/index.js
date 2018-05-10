const ApiBuilder = require('claudia-api-builder');
const AWS = require('aws-sdk');
const uuidv5 = require('uuid/v5');

const api = new ApiBuilder();
const cognitoIdentityServiceProvider = process.env.cogidsp_mock || new AWS.CognitoIdentityServiceProvider();
const poolData = {
  id: process.env.userPoolId,
  clientId: process.env.userPoolClientId
};

AWS.config.region = process.env.region;

module.exports = api;
// references:
// https://docs.aws.amazon.com/cognito/latest/developerguide/using-amazon-cognito-user-identity-pools-javascript-examples.html
// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html

function translateAuthenticationResult(result) {
  const rsp = {success: false};

  if (result) {
    if (result.AuthenticationResult && result.AuthenticationResult.IdToken) {
      const rst = result.AuthenticationResult;
      rsp.success = true;
      rsp.access_token = rst.IdToken;
      rsp.backup_token = rst.AccessToken;
      rsp.refresh_token = rst.RefreshToken;
      rsp.expires_in = rst.ExpiresIn;
      rsp.token_type = rst.TokenType;
    }
    if (result.ChallengeName) {
      rsp.next = {
        challenge: result.ChallengeName,
        challenge_parameters: result.ChallengeParameters,
        session: result.Session
      };
    }
  }

  return rsp;
}

api.post('/login', request => {
  const authData = {
    username: request.body.username.trim(),
    password: request.body.password.trim()
  };

  cognitoIdentityServiceProvider.adminInitiateAuth({
    AuthFlow: 'ADMIN_NO_SRP_AUTH',
    AuthParameters: {
      USERNAME: authData.username,
      PASSWORD: authData.password
    },
    ClientId: poolData.clientId,
    UserPoolId: poolData.id
  }).promise().then(result => {
    console.log('login result', result);
    return translateAuthenticationResult(result);
  });
});

api.post('/login-next', request => {
  // request.context.authorizer.claims['custom:teams']
  const authData = {
    challenge: request.body.challenge.trim(),
    challenge_parameters: request.body.challenge_parameters.trim(),
    username: request.body.username.trim(),
    password: request.body.password.trim(),
    session: request.body.session.trim()
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
      ClientId: poolData.clientId,
      UserPoolId: poolData.id
    };
    return cognitoIdentityServiceProvider.adminRespondToAuthChallenge(challengeRequest).promise();
  }

  return rsp;
});

api.post('/refresh', request => {
  const authData = {
    refresh_token: request.body.refresh_token.trim()
  };

  cognitoIdentityServiceProvider.adminInitiateAuth({
    AuthFlow: 'REFRESH_TOKEN_AUTH',
    AuthParameters: {
      REFRESH_TOKEN: authData.refresh_token
    },
    ClientId: poolData.clientId,
    UserPoolId: poolData.id
  }).promise().then(result => {
    console.log('refresh result', result);
    return translateAuthenticationResult(result);
  });
});

function setOptional(name, val, attrs) {
  if (val) {
    attrs.push({Name: name, Value: val.trim()});
  }
}

api.post('/signup', request => {
  const customFields = ['address2', 'city', 'state', 'postal', 'country',
    'is_retired', 'occupation', 'employer', 'email_list_optin_at',
    'pay_type', 'pay_customer_id', 'pay_brand', 'pay_last4',
    'pay_exp_month', 'pay_exp_year'];
  let {email, password} = request.body;

  password = password.trim();
  email = email.toLowerCase().trim();
  const username = uuidv5(email, 'email');

  // setup required attributes
  const createUserParams = {
    ClientId: poolData.clientId,
    Username: username,
    Password: password,
    UserAttributes: [
      {
        Name: 'given_name',
        Value: request.body.first_name
      },
      {
        Name: 'family_name',
        Value: request.body.last_name
      },
      {
        Name: 'email',
        Value: email
      }
    ]
  };

  // set internal fields that are not exact match
  setOptional('address', request.body.address1, createUserParams.UserAttributes);
  setOptional('phone_number', request.body.phone, createUserParams.UserAttributes);

  // set internal fields that are exact match
  setOptional('middle_name', request.body.middle_name, createUserParams.UserAttributes);
  setOptional('picture', request.body.picture, createUserParams.UserAttributes);
  setOptional('profile', request.body.profile, createUserParams.UserAttributes);
  setOptional('timezone', request.body.timezone, createUserParams.UserAttributes);

  // we set this up earlier as AliasAttributes
  setOptional('preferred_username', email, createUserParams.UserAttributes);

  // set custom fields
  customFields.forEach(k => {
    setOptional(`custom:${k}`, request.body[k], createUserParams.UserAttributes);
  });
  cognitoIdentityServiceProvider.signUp(createUserParams).promise().then(result => {
    console.log('signup result', result);
    return result;
  });
});

api.post('/signup-confirm', request => {
  const authData = {
    username: request.body.username.trim(),
    confirmationCode: request.body.confirmationCode.trim()
  };
  const params = {
    ClientId: poolData.clientId,
    Username: authData.username,
    ConfirmationCode: authData.confirmationCode
  };

  cognitoIdentityServiceProvider.confirmSignUp(params).promise().then(result => {
    console.log(result);
    return result;
  });
});

api.post('/confirm-resend', request => {
  const authData = {
    username: request.body.username.trim()
  };
  const params = {
    ClientId: poolData.clientId,
    Username: authData.username
  };

  cognitoIdentityServiceProvider.resendConfirmationCode(params).promise().then(result => {
    console.log(result);
    return result;
  });
});

api.post('/change-pw', request => {
  const authData = {
    token: request.body.token.trim(),
    password: request.body.password.trim(),
    oldPassword: request.body.oldpassword.trim()
  };
  const params = {
    PreviousPassword: authData.oldPassword,
    ProposedPassword: authData.password,
    AccessToken: authData.token
  };

  cognitoIdentityServiceProvider.changePassword(params).promise().then(result => {
    console.log(result);
    return result;
  });
});

api.post('/forgot-pw', request => {
  const authData = {
    username: request.body.username.trim()
  };
  const params = {
    ClientId: poolData.clientId,
    Username: authData.username
  };

  cognitoIdentityServiceProvider.forgotPassword(params).promise().then(result => {
    console.log(result);
    return result;
  });
});

api.post('/forgot-pw-confirm', request => {
  const authData = {
    username: request.body.username.trim(),
    confirmationCode: request.body.confirmationCode.trim(),
    password: request.body.password.trim()
  };
  const params = {
    ClientId: poolData.clientId,
    Username: authData.username,
    ConfirmationCode: authData.confirmationCode,
    Password: authData.password
  };

  cognitoIdentityServiceProvider.confirmForgotPassword(params).promise().then(result => {
    console.log(result);
    return result;
  });
});
