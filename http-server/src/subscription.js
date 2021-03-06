const serverSubscription = (createServer, port, messageType) => (dispatch) => {
  const server = createServer((request, response) => {
    dispatch({ type: messageType, request, response });
  });

  server.on('clientError', (err, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  });

  server.listen(port, '0.0.0.0', () => {
    console.log('+-----------------------------------'); // eslint-disable-line no-console
    console.log('|'); // eslint-disable-line no-console
    console.log(`| Server started on http://0.0.0.0:${port}/`); // eslint-disable-line no-console
    console.log(`|                   http://localhost:${port}/`); // eslint-disable-line no-console
    console.log('|'); // eslint-disable-line no-console
    console.log('+-----------------------------------'); // eslint-disable-line no-console
  });

  return () => {
    server.close();
  };
};

module.exports = {
  serverSubscription,
};
