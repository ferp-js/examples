const { URL } = require('url');
const { main } = require('../http-server/src/main.js');
const { makeRouteAction } = require('../http-server/src/router.js');

const server = (routeMap) => {
  const TestRouteAction = makeRouteAction(routeMap);
  const dispatch = main(routeMap, { port: -1, log: false });

  const doRequest = (method, path, reqHeaders, body, ip) => new Promise((resolve, reject) => {
    const url = new URL(`http://localhost/${path}`);
    const request = {
      key: `${method} ${path}`,
      url,
      headers: reqHeaders,
      body,
      remote: { ip },
    };
    let status = 0, headers = {};

    const response = {
      writeHead: (httpStatus, httpHeaders) => {
        status = httpStatus;
        headers = httpHeaders;
      },
      end: (body, callback) => {
        callback();
        resolve({ status, headers, body });
      },
    };

    try {
      dispatch(TestRouteAction(request, response), 'TestRouteAction');
    } catch (err) {
      reject(err);
    }
  });

  const get = (path, headers = {}, ip = '192.168.0.254') => {
    return doRequest('GET', path, headers, null, ip);
  };

  const post = (path, headers = {}, body, ip = '192.168.0.254') => {
    return doRequest('POST', path, headers, body, ip);
  };

  return { get, post };
};

module.exports = { server }
