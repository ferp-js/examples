import * as  ferp from 'ferp';
import * as superfineObserver from './superfineObserver';

const { none } = ferp.effects;

export const IncrAction = (state) => [
  { ...state, value: state.value + 1 },
  none(),
];

export const DecrAction = (state) => [
  { ...state, value: state.value - 1 },
  none(),
];

export const upgradeHWithDispatch = (h, dispatch) => {
  return (tag, originalProps, children) => {
    const props = Object.keys(originalProps).reduce((newProps, key) => {
      let prop = originalProps[key];
      if (key.startsWith('on')) {
        prop = (event) => {
          dispatch(originalProps[key](event));
        };
      }
      newProps[key] = prop;
      return newProps;
    }, {});

    return h(tag, props, children);
  };

};

export const initialState = { value: 0 };

export const main = (replaceElement, { patch, h: superfineH, text }) => {
  let realDispatch = () => {};
  const dispatch = (action, actionName) => realDispatch(action, actionName);

  const h = upgradeHWithDispatch(superfineH, dispatch);

  const view = (state) => (
    h('div', {}, [
      h(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          },
        },
        [
          h('button', { type: 'button', onclick: () => DecrAction }, text('-')),
          h('h1', { style: { width: '200px', textAlign: 'center' } }, text(state.value.toString())),
          h('button', { type: 'button', onclick: () => IncrAction }, text('+')),
        ],
      ),
    ])
  );

  realDispatch = ferp.app({
    init: [
      initialState,
      none(),
    ],

    observe: superfineObserver.make(patch, replaceElement, view),
  });

  return realDispatch;
};
