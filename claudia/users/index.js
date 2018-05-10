const ApiBuilder = require('claudia-api-builder');
const helper = require('../helper');

const api = new ApiBuilder();

module.exports = api;

api.get('/list', request => {
  const auth = request.context.authorizer;
  // console.log(JSON.stringify(auth, 2));

  // only admiral rank can do this
  if (!helper.isRank(auth, 'adm')) {
    return helper.fail({message: 'Access is denied.'});
  }

  return {id: request.pathParams.id, auth: auth};
});

api.post('/create', request => {
  const auth = request.context.authorizer;
  // console.log(JSON.stringify(auth, 2));

  // only admiral rank can do this
  if (!helper.isRank(auth, 'adm')) {
    return helper.fail({message: 'Access is denied.'});
  }

  return {id: request.pathParams.id, auth: auth};
});

api.get('/retrieve/{id}', request => {
  const auth = request.context.authorizer;
  // console.log(JSON.stringify(auth, 2));

  // only admiral rank and user can read
  if (!helper.isRank(auth, 'adm') && !helper.isUser(auth, id)) {
    return helper.fail({message: 'Access is denied.'});
  }


  return {id: request.pathParams.id, auth: auth};
});

api.post('/update/{id}', request => {
  const auth = request.context.authorizer;
  // console.log(JSON.stringify(auth, 2));

  // only admiral rank and user can update
  if (!helper.isRank(auth, 'adm') && !helper.isUser(auth, id)) {
    return helper.fail({message: 'Access is denied.'});
  }

  return {id: request.pathParams.id, auth: auth};
});

api.post('/delete/{id}', request => {
  const auth = request.context.authorizer;
  // console.log(JSON.stringify(auth, 2));

  // only admiral rank can delete user
  if (!helper.isRank(auth, 'adm')) {
    return helper.fail({message: 'Access is denied.'});
  }

  return {id: request.pathParams.id, auth: auth};
});

/**
 * add or remove team
 * @param Guid    id      userid
 * @param Guid    teamid  team id
 * @param String  action  add/remove/admin
 */
api.post('/{id}/team/{teamid}/{action}', request => {
  const auth = request.context.authorizer;
  // console.log(JSON.stringify(auth, 2));

  // only admiral rank and user can update
  if (!helper.isRank(auth, 'adm')) {
    return helper.fail({message: 'Access is denied.'});
  }

  return {id: request.pathParams.id, auth: auth};
});

/**
 * set rank
 * @param Guid    id      userid
 * @param String  rank    adm/capt/cdr/lt/ens
 */
api.post('/{id}/rank/{rank}/set', request => {
  const auth = request.context.authorizer;
  // console.log(JSON.stringify(auth, 2));

  // only admiral rank and user can update
  if (!helper.isRank(auth, 'adm')) {
    return helper.fail({message: 'Access is denied.'});
  }

  return {id: request.pathParams.id, auth: auth};
});
