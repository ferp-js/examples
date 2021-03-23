const http = require('http');
const ferp = require('ferp');
const fs = require('fs/promises');
const path = require('path');
const pug = require('pug');

const { makeRouteAction} = require('./router.js');
const { serverSubscription } = require('./subscription.js');

const { none, defer } = ferp.effects;

const pugBaseDirectory = path.resolve(__dirname, '..', 'resources', 'views');

const pugify = (responseEffect) => (status, pugFile, variables) => {
  const filename = path.resolve(pugBaseDirectory, pugFile.replace(/\./, '/') + '.pug');
  return defer(fs.readFile(filename, { encoding: 'utf8' })
    .then((pugSource) => {
      const html = pug.render(pugSource, { ...variables, filename, basedir: pugBaseDirectory });

      return responseEffect(
        status,
        {},
        html,
      );
    })
    .catch((err) => {
      console.log('oh shit', err);
      return responseEffect(500, {}, JSON.stringify(err, null, 2));
    })
  );
};

const makeHtmlAction = (status, pugFile, variables) => (_request, responseEffect) => (state) => [
  state,
  pugify(responseEffect)(status, pugFile, variables),
];

const RouteAction = makeRouteAction({
  'GET /': makeHtmlAction(200, 'pages.index'),
});

const main = () => ferp.app({
  init: [
    { logs: [] },
    none(),
  ],

  subscribe: () => [
    [serverSubscription, http.createServer, 8080, RouteAction],
  ],

  observe: (_tuple, nameOfAction) => {
    console.log((new Date()).toString(), nameOfAction);
  },
});

module.exports = {
  main,
};
