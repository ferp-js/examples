const test = require('ava');
const { app, effects } = require('ferp');
const { init } = require('./main.js');

const makeTestRig = (max, delay, observe) => app({
  init: init(max, delay),
  observe,
});

test.cb('it starts with a tick immediately', (t) => {
  const max = 1;
  const delay = 0;

  const expectedStates = [
    { value: 0, max, delay },
    { value: 1, max, delay },
    { value: 1, max, delay },
  ];

  makeTestRig(max, delay, ([state]) => {
    t.deepEqual(state, expectedStates.shift());
    if (expectedStates.length === 0) {
      t.end();
    }
  });
});

test.cb('it schedules the next tick', (t) => {
  const max = 2;
  const delay = 0;

  const expectedStates = [
    { value: 0, max, delay },
    { value: 1, max, delay },
    { value: 1, max, delay },
    { value: 2, max, delay },
    { value: 2, max, delay },
  ];

  makeTestRig(max, delay, ([state]) => {
    t.deepEqual(state, expectedStates.shift());
    if (expectedStates.length === 0) {
      t.end();
    }
  });
});
