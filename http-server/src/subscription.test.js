const test = require('ava');
const sinon = require('sinon');
const { URL } = require('url');
const { serverSubscription } = require('./subscription.js');

const createHttpFake = () => {
  let trigger = null;
  const cb = {
    clientError: [],
  };
  const listen = sinon.fake((_port, _host, callback) => callback());
  return {
    push: (request, response) => {
      if (!trigger) return;
      trigger(request, response);
    },
    createServer: (callback) => {
      trigger = callback;
      return {
        on: (event, callback) => {
          cb[event].push(callback);
        },
        listen,
        close: () => {},
      };
    },
    trigger: (event, ...params) => {
      (cb[event] || []).forEach((fn) => fn(...params));
    },
    listen,
  };
};

const createRequestFake = () => {
  const cb = {
    data: [],
    end: [],
  };
  return {
    method: 'get',
    url: '/',
    headers: {},
    connection: { remoteAddress: '1.1.1.1' },
    on: (event, callback) => {
      cb[event].push(callback);
    },
    trigger: (event, ...params) => {
      (cb[event] || []).forEach((fn) => fn(...params));
    },
  };
};

test('generates a runner function', (t) => {
  const httpFake = createHttpFake();
  const action = () => () => [];
  const runner = serverSubscription(() => {}, httpFake.createServer, { port: 0, log: sinon.fake() }, action);
  t.is(typeof runner, 'function');
});

test('can accept traffic', (t) => {
  const dispatch = sinon.fake();
  const httpFake = createHttpFake();
  const action = sinon.fake();
  const actionCreator = sinon.fake(() => action);

  const request = createRequestFake();
  const response = {};

  const detach = serverSubscription(dispatch, httpFake.createServer, { port: 0, log: sinon.fake() }, actionCreator);
  httpFake.push(request, response);
  request.trigger('end');

  t.truthy(dispatch.calledOnceWithExactly(action, 'RouteAction'), 'calls action');
  t.truthy(actionCreator.calledOnceWithExactly(
    {
      key: 'GET /',
      url: new URL('http://localhost:0/'),
      headers: request.headers,
      body: [],
      remote: {
        ip: '1.1.1.1',
      },
    },
    response,
  ), 'called action creator');

  detach();
});

test('can accept data', (t) => {
  const dispatch = sinon.fake();
  const httpFake = createHttpFake();
  const action = sinon.fake();
  const actionCreator = sinon.fake(() => action);

  const request = createRequestFake();
  const response = {};

  const detach = serverSubscription(dispatch, httpFake.createServer, { port: 0, log: sinon.fake() }, actionCreator);
  httpFake.push(request, response);
  request.trigger('data', 'hello');
  request.trigger('data', 'goodbye');
  request.trigger('end');

  t.truthy(dispatch.calledOnceWithExactly(action, 'RouteAction'), 'calls action');
  t.truthy(actionCreator.calledOnceWithExactly(
    {
      key: 'GET /',
      url: new URL('http://localhost:0/'),
      headers: request.headers,
      body: ['hello', 'goodbye'],
      remote: {
        ip: '1.1.1.1',
      },
    },
    response,
  ), 'called action creator');

  detach();
});

test('handles client errors', (t) => {
  const httpFake = createHttpFake();

  const detach = serverSubscription(sinon.fake(), httpFake.createServer, { port: 0, log: sinon.fake() }, sinon.fake());

  const socket = { end: sinon.fake() };
  httpFake.trigger('clientError', new Error(), socket);

  t.truthy(socket.end.calledOnceWithExactly('HTTP/1.1 400 Bad Request\r\n\r\n'), 'socket is closed');

  detach();
});

test('on server listen, log http connection information', (t) => {
  const httpFake = createHttpFake();
  const log = sinon.fake();

  const detach = serverSubscription(sinon.fake(), httpFake.createServer, { port: 0, log }, sinon.fake());

  t.truthy(httpFake.listen.called);
  t.truthy(log.callCount > 0, 'the server logs information on listen');

  detach();
});

test('on server listen, does not log http connection information when no log function', (t) => {
  const httpFake = createHttpFake();
  const log = null;

  const detach = serverSubscription(sinon.fake(), httpFake.createServer, { port: 0, log }, sinon.fake());

  t.truthy(httpFake.listen.called);

  detach();
});
