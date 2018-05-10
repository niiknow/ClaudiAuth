const AWS = require('aws-sdk');
const uuidv5 = require('uuid/v5');

AWS.config.region = process.env.region;

export default {
  cognitoIdentityServiceProvider: new AWS.CognitoIdentityServiceProvider(),
  poolData: {
    id: process.env.userPoolId,
    clientId: process.env.userPoolClientId
  },
  uuidEmail: email => {
    return uuidv5(email, 'email');
  }
};
