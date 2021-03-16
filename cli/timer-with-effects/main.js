const ferp = require('ferp');

const { updateLogger } = require('../common/updateLogger.js');

const { act, defer, none } = ferp.effects;

const delay = (action, milliseconds) => defer((resolve) => {
  setTimeout(resolve, milliseconds, action);
});

const Schedule = (NextAction) => (state) => [
  state,
  state.value >= state.max ? none() : delay(NextAction, state.delay),
];

const Tick = (state) => [
  { ...state, value: state.value + 1 },
  act(Schedule, act(Tick)),
];

const init = (max, millisecondDelay) => [
  { value: 0, max, delay: millisecondDelay },
  act(Tick),
];

const main = (max, millisecondDelay) => ferp.app({
  init: init(max, millisecondDelay),

  observe: updateLogger,
});

module.exports = {
  init,
  main,
};
