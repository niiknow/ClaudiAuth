const ApiBuilder = require('claudia-api-builder');

const api = new ApiBuilder();

module.exports = api;

api.post('/list', req => {
  const auth = req.context.authorizer;
  // console.log(JSON.stringify(auth, 2));

  return {id: req.pathParams.id, auth: auth};
});

api.post('/create', req => {
  const auth = req.context.authorizer;
  // console.log(JSON.stringify(auth, 2));

  return {id: req.pathParams.id, auth: auth};
});

api.get('/retrieve/{id}', req => {
  const auth = req.context.authorizer;
  // console.log(JSON.stringify(auth, 2));

  return {id: req.pathParams.id, auth: auth};
});

api.post('/update/{id}', req => {
  const auth = req.context.authorizer;
  // console.log(JSON.stringify(auth, 2));

  return {id: req.pathParams.id, auth: auth};
});

api.post('/delete/{id}', req => {
  const auth = req.context.authorizer;
  // console.log(JSON.stringify(auth, 2));

  return {id: req.pathParams.id, auth: auth};
});
