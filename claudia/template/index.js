const ApiBuilder = require('claudia-api-builder');

const api = new ApiBuilder();

module.exports = api;

api.get('/list', request => {
  const auth = request.context.authorizer;
  // console.log(JSON.stringify(auth, 2));

  return {id: request.pathParams.id, auth: auth};
});

api.post('/create', request => {
  const auth = request.context.authorizer;
  // console.log(JSON.stringify(auth, 2));

  return {id: request.pathParams.id, auth: auth};
});

api.get('/retrieve/{id}', request => {
  const auth = request.context.authorizer;
  // console.log(JSON.stringify(auth, 2));

  return {id: request.pathParams.id, auth: auth};
});

api.post('/update/{id}', request => {
  const auth = request.context.authorizer;
  // console.log(JSON.stringify(auth, 2));

  return {id: request.pathParams.id, auth: auth};
});

api.post('/delete/{id}', request => {
  const auth = request.context.authorizer;
  // console.log(JSON.stringify(auth, 2));

  return {id: request.pathParams.id, auth: auth};
});
