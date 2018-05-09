const ApiBuilder = require('claudia-api-builder');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

const api = new ApiBuilder();
const userPool = new AmazonCognitoIdentity.CognitoUserPool({
	UserPoolId: process.env.userPoolId,
	ClientId: process.env.userPoolClientId
});

module.exports = api;
// ref: https://docs.aws.amazon.com/cognito/latest/developerguide/using-amazon-cognito-user-identity-pools-javascript-examples.html

api.post('/change-pw', request => {
  return { id: request.id };
});

api.post('/login', request => {
    var authenticationData = {
        Username : request.body.username,
        Password : request.body.password,
    };

    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    var userData = {
        Username : request.body.username,
        Pool : userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            console.log('access token + ' + result.getAccessToken().getJwtToken());
            /*Use the idToken for Logins Map when Federating User Pools with identity pools or when passing through an Authorization Header to an API Gateway Authorizer*/
            console.log('idToken + ' + result.idToken.jwtToken);
        },

        onFailure: function(err) {
            alert(err);
        }
    });
});

api.post('/me', request => {
  var userData = {
    Username : request.body.username,
    Pool : userPool
  };
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
});

api.post('/register', request => {
  let attributeList = [];
    
  let dataEmail = {
    Name : 'email',
    Value : request.email
  };
  let dataPhoneNumber = {
    Name : 'phone_number',
    Value : request.phone
  };
  let attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
  let attributePhoneNumber = new AmazonCognitoIdentity.CognitoUserAttribute(dataPhoneNumber);

  attributeList.push(attributeEmail);
  attributeList.push(attributePhoneNumber);

  userPool.signUp('username', 'password', attributeList, null, function(err, result){
    if (err) {
        alert(err);
        return;
    }
    cognitoUser = result.user;
    console.log('user name is ' + cognitoUser.getUsername());
  });
});


api.post('/recover-pw', request => {
  return { id: request.id };
});

api.post('/reset-pw', request => {
  return { id: request.id };
});


api.post('/verify-email', request => {
  return { id: request.id };
});

api.post('/verify-mfa', request => {
  return { id: request.id };
});

