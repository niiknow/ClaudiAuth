const ApiBuilder = require('claudia-api-builder');

const api = new ApiBuilder();

module.exports = api;

// list existing shopping lists for a profile id
api.post('/Create', request => {
  return { id: request.id };
});
