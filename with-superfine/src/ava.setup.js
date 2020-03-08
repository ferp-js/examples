const jsdom = require('jsdom');

const { window } = new jsdom.JSDOM(`<!doctype html>
<html lang="end">
  <head></head>
  <body>
    <div id='app'></div>
  </body>
</html>
`);
global.window = window;
global.document = window.document;
