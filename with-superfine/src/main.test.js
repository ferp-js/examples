import test from 'ava';
import { effects } from 'ferp';
import { IncrAction, DecrAction, upgradeHWithDispatch } from './main.js';

test('IncrAction increments the value', (t) => {
  t.deepEqual(IncrAction({ value: 0 }), [
    { value: 1 },
    effects.none(),
  ]);
});

test('DecrAction decrements the value', (t) => {
  t.deepEqual(DecrAction({ value: 0 }), [
    { value: -1 },
    effects.none(),
  ]);
});

test('upgradeHWithDispatch only changes event function handlers', (t) => {
  const originalH = (tag, props) => ({ tag, props, children: [] });
  const upgradedH = upgradeHWithDispatch(originalH);

  const onclick = () => {};
  const otherProp = {};

  t.notDeepEqual(upgradedH('div', { onclick }), originalH('div', { onclick }));

  t.deepEqual(upgradedH('div', { otherProp }), originalH('div', { otherProp }));
});
