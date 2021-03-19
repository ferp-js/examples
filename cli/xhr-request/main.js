const ferp = require('ferp');
const fetch = require('node-fetch');

const { updateLogger } = require('../common/updateLogger.js');

const {
  act,
  batch,
  defer,
  none,
  thunk,
} = ferp.effects;

const getTodoItem = (id, onSuccess, onError, get) => defer(
  get(`https://jsonplaceholder.typicode.com/todos/${id}`)
    .then(response => response.json())
    .then(data => act(onSuccess, data))
    .catch(() => act(onError, id, get)),
);

const delay = (effect, milliseconds) => thunk(() => defer((resolve) => {
  setTimeout(resolve, milliseconds, effect);
}));

const todoToString = (item) => `[${item.completed ? 'X' : ' '}] ${item.id}: ${item.title}`;

const TodoAdd = (item) => (state) => [
  { ...state, todo: state.todo.concat(todoToString(item)).sort() },
  none(),
];

const TodoFail = (id, get) => (state) => [
  state,
  delay(getTodoItem(id, TodoAdd, TodoFail, get), 250),
];

const TodoRequest = (id, get) => (state) => [
  state,
  getTodoItem(id, TodoAdd, TodoFail, get),
];

const init = (ids, get) => [
  {
    todo: [],
  },
  batch(ids.map(id => (
    act(TodoRequest, id, get)
  ))),
];

const main = () => ferp.app({
  init: init([4, 2, 5, 3, 1, 7, 6], fetch),

  observe: updateLogger,
});

module.exports = {
  init,
  main,
  getTodoItem
};
