const test = require('ava');
const { app, effects } = require('ferp');
const { subscribe, init, every, Increment } = require('./main.js');

test('subscription only runs when value is less than max', (t) => {
  t.deepEqual(subscribe({ value: 0, max: 1, delay: 1 }), [
    [every, Increment, 1]
  ]);
  t.deepEqual(subscribe({ value: 1, max: 1, delay: 1 }), [
    false,
  ]);
});

test.cb('it runs the application until the value is larger than the max', (t) => {
  const max = 2;
  const delay = 0;
  const makeState = (value) => ({ value, max, delay });
  const expectedStates = [
    0,
    1,
    2
  ].map(makeState);

  app({
    init: init(max, delay),
    subscribe,
    observe: ([state, effect]) => {
      const expectedState = expectedStates.shift();
      t.deepEqual(state, expectedState);
      t.deepEqual(effect, effects.none());
      if (expectedStates.length === 0) {
        t.end();
      }
    },
  });


});
