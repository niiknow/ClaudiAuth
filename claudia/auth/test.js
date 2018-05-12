import test from 'ava';
import sinon from 'sinon';
import helper from './lib/helper';
import m from '.';

test.beforeEach(t => {
  t.context.done = sinon.spy();
});

test.serial('login success with valid values', async t => {
  let actual = false;
  const helperMock = sinon.stub(helper, 'cognitoIdentityServiceProvider').value({
    adminInitiateAuth: () => {
      actual = true;
      return {
        promise: () => {
          return new Promise(resolve => {
            resolve({});
          });
        }
      };
    }
  });

  await m.proxyRouter({
    requestContext: {
      resourcePath: '/login',
      httpMethod: 'POST',
      authorizer: {claims: {'custom:rank': 'adm'}}
    },
    body: {
      email: 'friends@niiknow.org',
      password: 'TakeAGuess!1'
    }
  }, t.context);

  helperMock.restore();
  t.true(actual);
  t.pass();
});

test.serial('refresh success with valid values', async t => {
  let actual = false;
  const helperMock = sinon.stub(helper, 'cognitoIdentityServiceProvider').value({
    adminInitiateAuth: () => {
      actual = true;
      return {
        promise: () => {
          return new Promise(resolve => {
            resolve({});
          });
        }
      };
    }
  });

  await m.proxyRouter({
    requestContext: {
      resourcePath: '/refresh',
      httpMethod: 'POST',
      authorizer: {claims: {'custom:rank': 'adm'}}
    },
    body: {
      refresh_token: '#@TSFSDFDFHSFDS32343fdfsgssfdf'
    }
  }, t.context);

  helperMock.restore();
  t.true(actual);
  t.pass();
});

test.serial('signup success with valid values', async t => {
  let actual = false;
  const helperMock = sinon.stub(helper, 'cognitoIdentityServiceProvider').value({
    signUp: () => {
      actual = true;
      return {
        promise: () => {
          return new Promise(resolve => {
            resolve({});
          });
        }
      };
    }
  });

  await m.proxyRouter({
    requestContext: {
      resourcePath: '/signup',
      httpMethod: 'POST',
      authorizer: {claims: {'custom:rank': 'adm'}}
    },
    body: {
      given_name: 'Friends',
      middle_name: 'At',
      family_name: 'NeedToKnow',
      email: 'friends@niiknow.org',
      password: 'DoYouNeedToKnow!1',
      confirmPassword: 'DoYouNeedToKnow!1',
      phone_number: '7775551234',
      address: '123 Cloud Dr',
      address2: 'Suite 69',
      city: 'Washington',
      state: 'DC',
      postal: '20007',
      country: 'USA',
      picture: 'Wouldn\'t you like to see?',
      profile: 'idk',
      timezone: '-5',
      is_retired: false,
      occupation: 'hazard',
      employer: 'Citizen United',
      email_list_optin_at: new Date().toUTCString(),
      pay_type: 'manual',
      pay_cid: 'na',
      pay_brand: 'niiknow',
      pay_last4: 1234,
      pay_xmonth: 1,
      pay_xyear: 1969
    }
  }, t.context);

  helperMock.restore();
  t.true(actual);
  t.pass();
});

test.serial('signup fail due to unknown property', async t => {
  await m.proxyRouter({
    requestContext: {
      resourcePath: '/signup',
      httpMethod: 'POST',
      authorizer: {claims: {'custom:rank': 'adm'}}
    },
    body: {
      given_name: 'Friends',
      middle_name: 'At',
      family_name: 'NeedToKnow',
      email: 'friends@niiknow.org',
      password: 'DoYouNeedToKnow!1',
      confirmPassword: 'DoYouNeedToKnow!1',
      unknown: 'xxx'
    }
  }, t.context);
  t.true(t.context.done.calledOnce);
  t.is(t.context.done.lastCall.lastArg.body, '{"errorMessage":"\\"unknown\\" is not allowed"}');
  t.pass();
});

test.serial('signup-confirm success with valid values', async t => {
  let actual = false;
  const helperMock = sinon.stub(helper, 'cognitoIdentityServiceProvider').value({
    confirmSignUp: () => {
      actual = true;
      return {
        promise: () => {
          return new Promise(resolve => {
            resolve({});
          });
        }
      };
    }
  });

  await m.proxyRouter({
    requestContext: {
      resourcePath: '/signup-confirm',
      httpMethod: 'POST',
      authorizer: {claims: {'custom:rank': 'adm'}}
    },
    body: {
      email: 'friends@niiknow.com',
      confirmationCode: '#@TSFSDFDFHSFDS32343fdfsgssfdf'
    }
  }, t.context);

  helperMock.restore();
  t.true(actual);
  t.pass();
});

test.serial('confirm-resend success with valid values', async t => {
  let actual = false;
  const helperMock = sinon.stub(helper, 'cognitoIdentityServiceProvider').value({
    resendConfirmationCode: () => {
      actual = true;
      return {
        promise: () => {
          return new Promise(resolve => {
            resolve({});
          });
        }
      };
    }
  });

  await m.proxyRouter({
    requestContext: {
      resourcePath: '/confirm-resend',
      httpMethod: 'POST',
      authorizer: {claims: {'custom:rank': 'adm'}}
    },
    body: {
      email: 'friends@niiknow.com'
    }
  }, t.context);

  helperMock.restore();
  t.true(actual);
  t.pass();
});

test.serial('change-password success with valid values', async t => {
  let actual = false;
  const helperMock = sinon.stub(helper, 'cognitoIdentityServiceProvider').value({
    changePassword: () => {
      actual = true;
      return {
        promise: () => {
          return new Promise(resolve => {
            resolve({});
          });
        }
      };
    }
  });

  await m.proxyRouter({
    requestContext: {
      resourcePath: '/change-pw',
      httpMethod: 'POST',
      authorizer: {claims: {'custom:rank': 'adm'}}
    },
    body: {
      token: 'isdjfkljsd!23kl',
      password: 'MakeAGuess!1',
      oldPassword: 'MakeAGuess!1'
    }
  }, t.context);

  helperMock.restore();
  t.true(actual);
  t.pass();
});

test.serial('forgot-password success with valid values', async t => {
  let actual = false;
  const helperMock = sinon.stub(helper, 'cognitoIdentityServiceProvider').value({
    forgotPassword: () => {
      actual = true;
      return {
        promise: () => {
          return new Promise(resolve => {
            resolve({});
          });
        }
      };
    }
  });

  await m.proxyRouter({
    requestContext: {
      resourcePath: '/forgot-pw',
      httpMethod: 'POST',
      authorizer: {claims: {'custom:rank': 'adm'}}
    },
    body: {
      email: 'friends@niiknow.com'
    }
  }, t.context);

  helperMock.restore();
  t.true(actual);
  t.pass();
});

test.serial('forgot-password-confirm success with valid values', async t => {
  let actual = false;
  const helperMock = sinon.stub(helper, 'cognitoIdentityServiceProvider').value({
    confirmForgotPassword: () => {
      actual = true;
      return {
        promise: () => {
          return new Promise(resolve => {
            resolve({});
          });
        }
      };
    }
  });

  await m.proxyRouter({
    requestContext: {
      resourcePath: '/forgot-pw-confirm',
      httpMethod: 'POST',
      authorizer: {claims: {'custom:rank': 'adm'}}
    },
    body: {
      confirmationCode: 'isdjfkljsd!23kl',
      email: 'friends@niiknow.org',
      password: 'MakeAGuess!1'
    }
  }, t.context);

  helperMock.restore();
  t.true(actual);
  t.pass();
});
