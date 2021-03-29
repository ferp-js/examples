const make = (status, json) => (_request, responseEffect) => (state) => [
  state,
  responseEffect(status, { 'Content-Type': 'application/json' }, JSON.stringify(json)),
];

module.exports = {
  make,
};
