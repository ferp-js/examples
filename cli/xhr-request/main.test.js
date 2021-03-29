const test = require('ava');
const { app, effects } = require('ferp');
const { init, todoToString } = require('./main.js');

test.cb('fetches todo items successfully', (t) => {
  const item = { id: 1, title: 'foo', completed: false };
  const get = () => Promise.resolve({ json: () => Promise.resolve(item) });

  const expectedStates = [
    { todo: [] },
    { todo: [] },
    { todo: [`[ ] ${item.id}: ${item.title}`] },
  ];

  app({
    init: init([1], get),
    observe: ([state]) => {
      const expectedState = expectedStates.shift();
      t.deepEqual(state, expectedState);
      if (expectedStates.length === 0) {
        t.end();
      }
    },
  });
});

test.cb('fetches todo items with a failure, then successful response', (t) => {
  const item = { id: 1, title: 'foo', completed: false };
  const responses = [
    Promise.reject(new Error()),
    Promise.resolve({ json: () => Promise.resolve(item) })
  ];
  const get = () => {
    return responses.shift();
  };

  const expectedStates = [
    { todo: [] },
    { todo: [] },
    { todo: [] },
    { todo: [`[ ] ${item.id}: ${item.title}`] },
  ];

  app({
    init: init([1], get),
    observe: ([state]) => {
      const expectedState = expectedStates.shift();
      t.deepEqual(state, expectedState);
      if (expectedStates.length === 0) {
        t.end();
      }
    },
  });
});

test('todoToString shows completed', (t) => {
  t.is(todoToString({ title: 'test', completed: true, id: 1 }), '[X] 1: test');
});
