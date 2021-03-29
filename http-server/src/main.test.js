const test = require('ava');
const sinon = require('sinon');
const { effects } = require('ferp');
const http = require('http');

const { main, makeObserve, makeSubscribe } = require('./main.js');
const { serverSubscription } = require('./subscription.js');

test('runs the app', (t) => {
  const dispatch = main({}, { port: -1 });
  t.is(typeof dispatch, 'function');
});

test('makeObserve can log information', (t) => {
  const log = sinon.fake();
  const observe = makeObserve(log);

  const tuple = [{ logs: [] }, effects.none()];
  const nameOfAction = 'Foo';

  observe(tuple, nameOfAction);

  t.truthy(log.calledWithExactly('> ', nameOfAction), 'logs action name');
  t.truthy(log.neverCalledWithMatch(nameOfAction, sinon.match.string));
});

test('makeObserve logs the latest log summary', (t) => {
  const log = sinon.fake();
  const observe = makeObserve(log);

  const tuple = [{ logs: [{}, { summary: 'test' }] }, effects.none()];
  const nameOfAction = 'LogAction';

  observe(tuple, nameOfAction);

  t.truthy(log.neverCalledWithMatch('> ', nameOfAction), 'does not logs action name');
  t.truthy(log.calledWithExactly(nameOfAction, 'test'), 'logs latest summary');
});

test('makeSubscribe creates a subscribe function', (t) => {
  const RouteAction = () => {};
  const config = { port: 1111 };

  const subscribe = makeSubscribe(RouteAction, config);

  t.is(typeof subscribe, 'function');
  t.is(subscribe.length, 1);
});

test('makeSubscribe will declare subscription when the port is valid', (t) => {
  const RouteAction = () => {};
  const config = { port: 1111 };

  const subscribe = makeSubscribe(RouteAction, config);

  t.deepEqual(subscribe({}), [
    [serverSubscription, http.createServer, config, RouteAction],
  ]);
});

test('makeSubscribe will not declare subscription when the port is invalid', (t) => {
  const RouteAction = () => {};
  const config = { port: -1 };

  const subscribe = makeSubscribe(RouteAction, config);

  t.deepEqual(subscribe({}), [
    false,
  ]);
});
