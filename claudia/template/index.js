const ApiBuilder = require('claudia-api-builder');

const api = new ApiBuilder();

module.exports = api;

// list existing shopping lists for a profile id
api.post('/test/{id}', request => {
  const data = request.context.authorizer;
  console.log(JSON.stringify(data, 2));

  return {id: request.pathParams.id};
});
