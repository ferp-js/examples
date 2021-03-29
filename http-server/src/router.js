const ferp = require('ferp');

const { act, batch, defer, none } = ferp.effects;

const DefaultNotFoundAction = (_, responseFx) =>
  (state) =>
    [state, responseFx(404, {}, 'Not found')];

const LogAction = (request, status, headers, body, timestamp) => (state) => {
  const date = (new Date(timestamp)).toISOString();
  return [
    {
      ...state, 
      logs: state.logs.concat({
        request,
        response: { status, headers, body },
        timestamp,
        summary: `${date}; ${request.remote.ip} (UA=${request.headers['user-agent']}) -> http ${status} (${JSON.stringify(headers)})`,
      }),
    },
    none(),
  ];
};

const makeResponseEffect = (request, response, timestamp, afterEffect) => (status, headers, body) => defer((done) => {
  response.writeHead(status, headers);
  response.end(
    body,
    () => done(batch([
      act(LogAction, request, status, headers, body, timestamp),
      afterEffect,
    ])),
  );
});

const makeRouteAction = (routeMap, NotFoundAction = DefaultNotFoundAction, afterResponseEffect = none()) => {
  const routes = Object.keys(routeMap).reduce((memo, routeKey) => {
    const route = routeMap[routeKey];
    return typeof route === 'function'
      ? { ...memo, [routeKey]: { '*/*': route } }
      : { ...memo, [routeKey]: route };
  }, {});

  return (request, response) => (state) => {
    const accept = request.headers.accept;

    const responseFx = makeResponseEffect(request, response, Date.now(), afterResponseEffect);

    const route = routes[request.key];
    if (!route) {
      return [
        state,
        act(NotFoundAction, request, responseFx),
      ];
    }

    const action = route[accept] || route['*/*'];

    if (!action) {
      return [
        state,
        responseFx(406, {}, 'Accept header is not valid for this request'),
      ];
    }

    return [
      { ...state, logs: state.logs.concat(Date.now()) }, // log the request to memory
      act(action, request, responseFx),
    ];
  };
};

module.exports = {
  DefaultNotFoundAction,
  makeResponseEffect,
  makeRouteAction,
};
