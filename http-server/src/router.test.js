const test = require('ava');
const sinon = require('sinon');
const { URL } = require('url');
const { effects } = require('ferp');
const appTestRig = require('../../support/appTestRig.js');
const { DefaultNotFoundAction, makeResponseEffect, makeRouteAction } = require('./router.js');

const fakeResponse = () => ({
  writeHead: sinon.fake(),
  end: sinon.fake((_, callback) => callback()),
});

const makeRequestObject = (method, fullUrl, headers = {}, body = undefined) => {
  const url = new URL(fullUrl);
  return {
    key: `${method.toUpperCase()} ${url.pathname}`,
    url,
    headers,
    body,
  };
};

test('DefaultNotFoundAction returns a 404 with text Not found', (t) => {
  const tacos = {};
  const response = sinon.fake(() => tacos);
  const state = {};

  const result = DefaultNotFoundAction(null, response)(state);

  t.is(result[0], state);
  t.is(result[1], tacos);
  t.truthy(response.calledOnceWithExactly(404, {}, 'Not found'));
});

test.cb('responseEffect calls writeHead and ends the response', (t) => {
  const response = fakeResponse();

  const status = 400;
  const headers = { 'Content-Type': 'application/json' }
  const body = JSON.stringify({ error: true });

  const EndTest = (state) => [state, effects.none()];

  const responseFx = makeResponseEffect({ remote: {}, headers: {} }, response, 0, effects.act(EndTest));

  const initialState = { logs: [] };

  appTestRig({
    init: [
      initialState,
      responseFx(status, headers, body),
    ],
  }, [
    () => {}, // Ignore init action
    (state, effect, actionName) => {
      t.is(actionName, 'LogAction');
    },
    (state, effect, actionName) => {
      t.is(state.logs.length, 1);
      t.is(actionName, 'EndTest');
      t.deepEqual(effect, effects.none());
      t.truthy(response.writeHead.calledOnceWithExactly(status, headers), 'called writeHeader');
      t.truthy(response.end.calledOnceWithExactly(body, sinon.match.any), 'called end');
      t.end();
    },
  ]);
});

test('makeRouteAction creates an action with an any-mimetype known url', (t) => {
  const TestRoute = (_request, responseFx) => (state) => [
    state,
    responseFx(200, {}, ''),
  ];

  const RouteAction = makeRouteAction({
    'GET /': TestRoute,
  });

  const response = fakeResponse();
  const request = makeRequestObject('GET', 'http://localhost/');

  const initialState = {
    logs: [],
  };

  const result = RouteAction(request, response)(initialState);

  t.is(result[0].logs.length, 1);
});

test('makeRouteAction creates an action with an unknown url', (t) => {
  const TestRoute = (_request, responseFx) => (state) => [
    state,
    responseFx(200, {}, ''),
  ];

  const NotFoundRoute = (_request, responseFx) => (state) => [
    state,
    responseFx(404, {}, 'Not found'),
  ];

  const RouteAction = makeRouteAction({
    'GET /': TestRoute,
  }, NotFoundRoute);

  const response = fakeResponse();
  const request = makeRequestObject('GET', 'http://localhost/');

  const initialState = {
    logs: [],
  };

  const result = RouteAction(request, response)(initialState);

  t.is(result[0].logs.length, 1);
});
