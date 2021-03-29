import './ava.setup.js';
import test from 'ava';
import sinon from 'sinon';

import * as superfineObserver from './superfineObserver.js';

test('creates an observer method', (t) => {
  const patch = () => {};
  const target = global.document.createElement('div');
  const view = () => ({ tag: 'div', props: {}, children: [] });

  const observe = superfineObserver.make(patch, target, view);

  t.is(typeof observe, 'function');
  t.is(observe.length, 2);
});

test('runs the provided patch method', (t) => {
  const patch = sinon.fake();
  const target = global.document.createElement('div');
  const view = () => ({ tag: 'div', props: {}, children: [] });

  const observe = superfineObserver.make(patch, target, view);

  observe([{}, null], 'test');

  t.truthy(patch.calledOnceWithExactly(target, view()), 'calls patch');
});
