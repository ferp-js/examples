const htmlAction = require('./lib/htmlAction.js');
const jsonAction = require('./lib/jsonAction.js');

require('./main.js').main({
  'GET /': htmlAction.make(200, 'pages.index'),
  'GET /index.json': jsonAction.make(200, { data: [1, 2, 3, 4] }),
  'GET /foo': {
    'text/html': htmlAction.make(200, 'pages.index'),
    'application/json': jsonAction.make(200, { data: [1, 2, 3, 4] }),
  },
});
