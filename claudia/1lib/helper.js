const AWS = require('aws-sdk');
const Joi = require('joi');
const uuidv5 = require('uuid/v5');
const StorageS3 = require('./storages3');

AWS.config.region = process.env.region;

const helper = {
  nameSchema: Joi.string().trim().required().regex(/^[a-zA-Z0-9 ]{3,100}$/),
  translateAuthResult: result => {
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
  },
  cognitoIdentityServiceProvider: new AWS.CognitoIdentityServiceProvider(),
  poolData: {
    id: process.env.userPoolId,
    clientId: process.env.userPoolClientId
  },
  uuidEmail: email => {
    return uuidv5(email, '24ccd1e9-9951-4dd7-bb8c-84fe063702d1');
  },
  isRank: (auth, checkRank = 'adm') => {
    const rank = auth.claims['custom:rank'];
    return (rank && rank === checkRank);
  },
  fail: data => {
    if (typeof data === 'string' || data instanceof String) {
      return {success: false, error: {errorMessage: data}};
    }

    return {success: false, error: data};
  },
  success: data => {
    return {success: true, value: data};
  },
  getStorage: (type, name) => {
    if (type === 's3') {
      return new StorageS3(process.env.bucketName, name);
    }
  }
};

module.exports = helper;
