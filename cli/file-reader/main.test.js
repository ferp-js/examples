const test = require('ava');
const sinon = require('sinon');
const { app } = require('ferp');

const { init, main } = require('./main.js');

const makeTestRig = (fileName, readFileCallbackResults = [null, 'hello']) => {
  const readFileFn = (_file, _options, callback) => callback(...readFileCallbackResults);

  const run = (observe) => {
    return app({
      init: init(fileName, readFileFn),
      observe,
    });
  };

  return { run, readFileFn };
};

test.cb('successfully reads a file', (t) => {
  const fileName = 'test.txt';
  const fileContents = 'hello';
  const fileError = null;
  const testRig = makeTestRig(fileName, [fileError, fileContents]);
  const expectedStates = [
    { file: fileName, content: '', error: '' },
    { file: fileName, content: fileContents, error: '' },
  ];

  testRig.run((tuple) => {
    t.deepEqual(tuple[0], expectedStates.shift());
    if (expectedStates.length === 0) {
      t.end();
    }
  });
});


test.cb('fails to reads a file', (t) => {
  const fileName = 'test.txt';
  const fileContents = 'hello';
  const fileError = { message: 'oh no!' };
  const testRig = makeTestRig(fileName, [fileError, fileContents]);
  const expectedStates = [
    { file: fileName, content: '', error: '' },
    { file: fileName, content: '', error: fileError.message },
  ];

  testRig.run((tuple) => {
    t.deepEqual(tuple[0], expectedStates.shift());
    if (expectedStates.length === 0) {
      t.end();
    }
  });
});

test('main runs the application', (t) => {
  t.teardown(() => {
    sinon.restore();
  });
  sinon.stub(console, 'log');

  const fileContents = 'test';

  const readFileFn = (_file, _options, callback) => callback(null, fileContents);

  main('test.txt', readFileFn);

  return new Promise((resolve) => setTimeout(resolve, 1))
    .then(() => {
      t.is(console.log.callCount, 4);
    });
});
