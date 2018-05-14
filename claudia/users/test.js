import test from 'ava';
import sinon from 'sinon';
import helper from './lib/helper';
import m from '.';

test.beforeEach(t => {
  t.context.done = sinon.spy();
});

test.serial('/list success with valid values', async t => {
  let actual = false;
  const helperMock = sinon.stub(helper, 'cognitoIdentityServiceProvider').value({
    listUsers: () => {
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
      resourcePath: '/list',
      httpMethod: 'POST',
      authorizer: {claims: {'custom:rank': 'adm'}}
    },
    body: {
      filter: 'a > 1',
      limit: 60,
      page: '99'
    }
  }, t.context);

  helperMock.restore();
  t.true(actual);
  t.pass();
});

test.serial('/create success with valid values', async t => {
  let actual = false;
  const helperMock = sinon.stub(helper, 'cognitoIdentityServiceProvider').value({
    adminCreateUser: () => {
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
      resourcePath: '/create',
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

test.serial('/retrieve success with valid values', async t => {
  let actual = false;
  const helperMock = sinon.stub(helper, 'cognitoIdentityServiceProvider').value({
    adminGetUser: () => {
      actual = true;
      return {
        promise: () => {
          return new Promise(resolve => {
            resolve({});
          });
        }
      };
    },
    listUsers: () => {
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
      resourcePath: '/retrieve/{email}',
      httpMethod: 'GET',
      authorizer: {claims: {'custom:rank': 'adm'}}
    },
    pathParameters: {
      email: 'friends@niiknow.org'
    }
  }, t.context);

  helperMock.restore();
  t.true(actual);
  t.pass();
});

test.serial('/update success with valid values', async t => {
  let actual = false;
  const helperMock = sinon.stub(helper, 'cognitoIdentityServiceProvider').value({
    adminUpdateUserAttributes: () => {
      actual = true;
      return {
        promise: () => {
          return new Promise(resolve => {
            resolve({});
          });
        }
      };
    },
    listUsers: () => {
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
      resourcePath: '/update',
      httpMethod: 'POST',
      authorizer: {claims: {'custom:rank': 'adm'}}
    },
    body: {
      given_name: 'Friends',
      middle_name: 'At',
      family_name: 'NeedToKnow',
      email: 'friends@niiknow.org',
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

test.serial('/delete success with valid values', async t => {
  let actual = false;
  const helperMock = sinon.stub(helper, 'cognitoIdentityServiceProvider').value({
    adminDeleteUser: () => {
      actual = true;
      return {
        promise: () => {
          return new Promise(resolve => {
            resolve({});
          });
        }
      };
    },
    listUsers: () => {
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
      resourcePath: '/delete/{email}',
      httpMethod: 'POST',
      authorizer: {claims: {'custom:rank': 'adm'}}
    },
    pathParameters: {
      email: 'friends@niiknow.org'
    }
  }, t.context);

  helperMock.restore();
  t.true(actual);
  t.pass();
});

test.serial('/disable success with valid values', async t => {
  let actual = false;
  const helperMock = sinon.stub(helper, 'cognitoIdentityServiceProvider').value({
    adminDisableUser: () => {
      actual = true;
      return {
        promise: () => {
          return new Promise(resolve => {
            resolve({});
          });
        }
      };
    },
    listUsers: () => {
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
      resourcePath: '/disable/{email}',
      httpMethod: 'POST',
      authorizer: {claims: {'custom:rank': 'adm'}}
    },
    pathParameters: {
      email: 'friends@niiknow.org'
    }
  }, t.context);

  helperMock.restore();
  t.true(actual);
  t.pass();
});

test.serial('/enable success with valid values', async t => {
  let actual = false;
  const helperMock = sinon.stub(helper, 'cognitoIdentityServiceProvider').value({
    adminEnableUser: () => {
      actual = true;
      return {
        promise: () => {
          return new Promise(resolve => {
            resolve({});
          });
        }
      };
    },
    listUsers: () => {
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
      resourcePath: '/enable/{email}',
      httpMethod: 'POST',
      authorizer: {claims: {'custom:rank': 'adm'}}
    },
    pathParameters: {
      email: 'friends@niiknow.org'
    }
  }, t.context);

  helperMock.restore();
  t.true(actual);
  t.pass();
});

test.serial('/rank success with valid values', async t => {
  let actual = false;
  const helperMock = sinon.stub(helper, 'cognitoIdentityServiceProvider').value({
    adminUpdateUserAttributes: () => {
      actual = true;
      return {
        promise: () => {
          return new Promise(resolve => {
            resolve({});
          });
        }
      };
    },
    listUsers: () => {
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
      resourcePath: '/rank/{rank}/{email}',
      httpMethod: 'POST',
      authorizer: {claims: {'custom:rank': 'adm'}}
    },
    pathParameters: {
      email: 'friends@niiknow.org',
      rank: 'adm'
    }
  }, t.context);

  helperMock.restore();
  t.true(actual);
  t.pass();
});
