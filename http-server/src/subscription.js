const { URL } = require('url');

const extractIpFromRequest = (request) => (
  (request.headers['x-forwarded-for'] || '').split(',')[0]
  || request.connection.remoteAddress
);

const serverSubscription = (dispatch, createServer, config, RouteAction) => {
  const server = createServer((request, response) => {
    const data = [];

    request.on('data', (chunk) => {
      data.push(chunk);
    });

    request.on('end', () => {
      const url = new URL(`http://localhost:${config.port}${request.url}`);
      dispatch(RouteAction(
        {
          key: `${request.method.toUpperCase()} ${url.pathname}`,
          url,
          headers: request.headers,
          body: data,
          remote: {
            ip: extractIpFromRequest(request),
          },
        },
        response,
      ), 'RouteAction');
    });
  });

  server.on('clientError', (_err, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  });

  server.listen(config.port, '0.0.0.0', () => {
    if (!config.log) return;
    config.log('+-----------------------------------');
    config.log('|');
    config.log(`| Server started on http://0.0.0.0:${config.port}/`);
    config.log(`|                   http://localhost:${config.port}/`);
    config.log('|');
    config.log('+-----------------------------------');
  });

  return () => {
    server.close();
  };
};

module.exports = {
  serverSubscription,
};
