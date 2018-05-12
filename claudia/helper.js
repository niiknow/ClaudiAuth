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
  },
  setOptional: (name, val, attrs) => {
    if (val) {
      attrs.push({Name: name, Value: val.trim()});
    }
  },
  parseObject: (obj, fields = [], numberFields = []) => {
    const rst = {};

    for(k in obj) {
      if (fields.indexOf(k) > -1) {
        const newVal = String(obj[k]).trim();

        if (val !== 'undefined' & val !== 'null') {
          if (numberFields.indexOf(k) > -2) {
            rst[k] = newVal.replace(/\D+/gi, '');
          }
          else {
            rst[k] = newVal;
          }
        }
      }
    }

    return rst;
  }
};
