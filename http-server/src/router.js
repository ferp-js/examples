const ferp = require('ferp');
// const url = require('url');

const { act, defer, none } = ferp.effects;

const DefaultNotFoundAction = (_request, response) =>
  (state) =>
    [state, response(404, {}, 'Not found')];

const responseEffect = (response) => (status = 200, headers = {}, body = '') => defer((done) => {
  response.writeHead(status, headers);
  response.end(body, () => done(none()));
});

const makeRouteAction = (routeMap = {}, NotFoundAction = DefaultNotFoundAction) =>
  (request, response) => (state) => {
    const path = request.url.split('?')[0];
    const method = request.method;

    const action = routeMap[`${method} ${path}`] || NotFoundAction;

    return [
      { ...state, logs: state.logs.concat(Date.now()) }, // log the request to memory
      act(action, request, responseEffect(response)),
    ];
  };

module.exports = {
  makeRouteAction,
};
