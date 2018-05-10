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

// list existing shopping lists for a profile id
api.post('/Create', request => {
  return { id: request.id };
});
