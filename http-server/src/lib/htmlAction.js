const fs = require('fs/promises');
const path = require('path');
const pug = require('pug');
const { effects } = require('ferp');

const pugBaseDirectory = path.resolve(__dirname, '..', '..', 'resources', 'views');

const pugify = (responseEffect) => (status, pugFile, variables) => {
  const filename = path.resolve(pugBaseDirectory, pugFile.replace(/\./, '/') + '.pug');

  return effects.defer(fs.readFile(filename, { encoding: 'utf8' })
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

const make = (status, pugFile, variables) => (_request, responseEffect) => (state) => [
  state,
  pugify(responseEffect)(status, pugFile, variables),
];

module.exports = {
  make,
};
