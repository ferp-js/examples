const ferp = require('ferp');

const { updateLogger } = require('../common/updateLogger.js');

const { act, none } = ferp.effects;

const every = (dispatch, onTick, milliseconds) => {
  const tick = () => {
    dispatch(onTick);
  };

  const handle = setInterval(tick, milliseconds);

  return () => {
    clearInterval(handle);
  };
};

const Increment = (state) => [{ ...state, value: state.value + 1 }, none()];

const init = (max, delay) => [
  { value: 0, max, delay },
  none(),
];

const subscribe = state => [
  state.value < state.max && [every, Increment, state.delay],
];

const main = (max, delay) => ferp.app({
  init: init(max, delay),

  subscribe,

  observe: updateLogger,
});

module.exports = {
  subscribe,
  every,
  Increment,
  init,
  main,
};
