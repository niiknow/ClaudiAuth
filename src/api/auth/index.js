const ApiBuilder = require('claudia-api-builder');
const AWS = require('aws-sdk');
const uuidv5 = require('uuid/v5');

const api = new ApiBuilder();
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
const poolData = {
  id: process.env.userPoolId,
  clientId: process.env.userPoolClientId
};

AWS.config.region = process.env.region;

module.exports = api;
// references:
// https://docs.aws.amazon.com/cognito/latest/developerguide/using-amazon-cognito-user-identity-pools-javascript-examples.html
// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html

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
    console.log(result);
    return result.AuthenticationResult;
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
    UserPoolId: poolData.id,
    Username: username,
    ForceAliasCreation: false,
    MessageAction: 'SUPPRESS',
    TemporaryPassword: password,
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

  return cognitoIdentityServiceProvider.adminCreateUser(createUserParams).promise().then(data => {
    console.log('create user response1', data);
    const authRequest = {
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password
      },
      ClientId: poolData.clientId,
      UserPoolId: poolData.id
    };

    return cognitoIdentityServiceProvider.adminInitiateAuth(authRequest).promise();
  }).then(data => {
    console.log('create user response2', data);
    if (data.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
      const challengeRequest = {
        ChallengeName: 'NEW_PASSWORD_REQUIRED',
        ChallengeResponses: {
          USERNAME: data.ChallengeParameters.USER_ID_FOR_SRP || username,
          NEW_PASSWORD: password
        },
        Session: data.Session,
        ClientId: poolData.clientId,
        UserPoolId: poolData.id
      };
      return cognitoIdentityServiceProvider.adminRespondToAuthChallenge(challengeRequest).promise();
    }
  }).then(data => {
    console.log('create user response3', data);
    return data.AuthenticationResult;
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
