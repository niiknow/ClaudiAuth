const ApiBuilder = require('claudia-api-builder');
const AWS = require('AWS');
const uuidv5 = require('uuid/v5');

const api = new ApiBuilder();
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
const poolData = {
  id: process.env.userPoolId,
  clientId: process.env.userPoolClientId
}

aws.config.region = process.env.region;

module.exports = api;
// references:
// https://docs.aws.amazon.com/cognito/latest/developerguide/using-amazon-cognito-user-identity-pools-javascript-examples.html
// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html

api.post('/login', request => {
  const body = request.body;
  var authData = {
    username : body.username.trim(),
    password : body.password.trim(),
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
    attrs.push({ Name: name, Value: val.trim() });
  }
}

api.post('/signup', request => {
  const body = request.body;
  const customFields =  ['address2', 'city', 'state', 'postal', 'country',
    'is_retired', 'occupation', 'employer', 'email_list_optin_at',
    'pay_type', 'pay_customer_id', 'pay_brand', 'pay_last4',
    'pay_exp_month', 'pay_exp_year'];
  let { email, password, first_name, last_name } = body;

  password = password.trim();
  email = email.toLowerCase().trim();
  username = uuidv5(email, 'email');

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
          Value: first_name
      },
      {
          Name: 'family_name',
          Value: last_name
      },
      {
          Name: 'email',
          Value: email
      }
    ]
  };

  // set internal fields that are not exact match
  setOptional('address', body.address1, createUserParams.UserAttributes);
  setOptional('phone_number', body.phone, createUserParams.UserAttributes);

  // set internal fields that are exact match
  setOptional('middle_name', body.middle_name, createUserParams.UserAttributes);
  setOptional('picture', body.picture, createUserParams.UserAttributes);
  setOptional('profile', body.profile, createUserParams.UserAttributes);
  setOptional('timezone', body.timezone, createUserParams.UserAttributes);

  // we set this up earlier as AliasAttributes
  setOptional('preferred_username', email, createUserParams.UserAttributes);

  // set custom fields
  customFields.forEach(k => {
    setOptional(`custom:${k}`, body[k], createUserParams.UserAttributes);
  });

  return cognitoIdentityServiceProvider.adminCreateUser(createUserParams).promise().then(data => {
    console.log('create user response1', data);
    const authRequest = {
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
      },
      ClientId: poolData.clientId,
      UserPoolId: poolData.id
    };

    return cognitoIdentityServiceProvider.adminInitiateAuth(authRequest).promise();
  }).then(data => {
    console.log('create user response2', data);
    if (data.ChallengeName == 'NEW_PASSWORD_REQUIRED') {
      let challengeRequest = {
        ChallengeName: 'NEW_PASSWORD_REQUIRED',
        ChallengeResponses: {
            USERNAME: data.ChallengeParameters.USER_ID_FOR_SRP || username,
            NEW_PASSWORD: password,
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
  const body = request.body;
  const authData = {
      token : body.token.trim(),
      password : body.password.trim(),
      oldPassword : body.oldpassword.trim()
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
  const body = request.body;
  const authData = {
      username : body.username.trim()
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
  const body = request.body;
  const authData = {
    username : body.username.trim(),
    confirmationCode: body.confirmationCode.trim(),
    password: body.password.trim()
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
