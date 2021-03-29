const { app } = require('ferp');

module.exports = (appProps, expectations) => {
  const remainingExpectations = [...expectations];
  return app({
    ...appProps,
    observe: ([state, effect], actionName) => {
      if (appProps.observe) appProps.observe([state, effect], actionName);
      const expectFn = remainingExpectations.shift();
      expectFn(state, effect, actionName);
    },
  });
};
