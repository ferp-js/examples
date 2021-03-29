const http = require('http');
const ferp = require('ferp');

const { makeRouteAction} = require('./router.js');
const { serverSubscription } = require('./subscription.js');

const { none } = ferp.effects;

const init = [
  { logs: [] },
  none(),
];

const makeObserve = (log) => (tuple, nameOfAction) => {
  if (!log) return;

  if (nameOfAction !== 'LogAction') {
    log('> ', nameOfAction);
    return;
  }
  log(nameOfAction, tuple[0].logs[tuple[0].logs.length - 1].summary);
};

const makeSubscribe = (RouteAction, config) => (_state) => [
  config.port > 0 && [serverSubscription, http.createServer, config, RouteAction],
];

const main = (routeMap, config) => {
  const RouteAction = makeRouteAction(routeMap);

  const dispatch = ferp.app({
    init,

    subscribe: makeSubscribe(RouteAction, config),

    observe: makeObserve(config.log),
  });

  return dispatch;
};

module.exports = {
  main,
  makeObserve,
  makeSubscribe,
};
