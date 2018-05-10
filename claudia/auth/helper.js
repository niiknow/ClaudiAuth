const AWS = require('aws-sdk');
const uuidv5 = require('uuid/v5');

AWS.config.region = process.env.region;

export default {
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
    return uuidv5(email, 'email');
  }
};
