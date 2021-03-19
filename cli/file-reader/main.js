const ferp = require('ferp');
const path = require('path');

const { updateLogger } = require('../common/updateLogger.js');

const { act, defer, none } = ferp.effects;

const readEffect = (file, onSuccess, onError, readFile) => defer((resolve) => {
  readFile(file, { encoding: 'utf-8' }, (err, data) => {
    if (err) {
      return resolve(onError(err));
    }
    return resolve(onSuccess(data));
  });
});

const ReadOk = (data) => (state) => [{ ...state, content: data }, none()];
const ReadErr = (error) => (state) => [{ ...state, error: error.message }, none()];

const init = (file, readFile) => [
  { file, content: '', error: '' },
  readEffect(
    path.resolve(__dirname, file),
    (data) => act(ReadOk, data),
    (err) => act(ReadErr, err),
    readFile,
  ),
];

const main = (file, readFileFn) => ferp.app({
  init: init(file, readFileFn),
  observe: updateLogger,
});

module.exports = {
  readEffect,
  init,
  main,
};
