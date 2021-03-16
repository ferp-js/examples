const test = require('ava');
const sinon = require('sinon');
const { effects } = require('ferp');
const { updateLogger } = require('./updateLogger.js');

test.beforeEach(() => {
  sinon.stub(console, 'log');
});

test.afterEach(() => {
  sinon.restore();
});

test('logs tuple', (t) => {
  const tuple = [{ isState: true }, effects.none()];

  updateLogger(tuple, 'myAction');
  t.truthy(console.log.calledWithExactly('myAction: ', tuple));
});
