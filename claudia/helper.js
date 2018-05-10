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
  },
  isRank: (auth, checkRank = 'adm') => {
    const rank = auth.claims['custom:rank'];
    return (rank && rank === checkRank);
  },
  fail: data => {
    data.success = false;
    return data;
  },
  success: data => {
    data.success = true;
    return data;
  }
};
