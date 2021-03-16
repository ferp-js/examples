const updateLogger = (tuple, actionName) => {
  console.log(actionName + ': ', tuple);
  console.log('-----------\n'); // eslint-disable-line no-console
};

module.exports = {
  updateLogger,
};
