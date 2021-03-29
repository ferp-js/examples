const test = require('ava');
const { server } = require('../../support/serverTestRig.js');

test('returns the page', (t) => {
  const rig = server({
    'GET /foo/bar': (_, responseFx) => (state) => {
      return [state, responseFx(200, {}, 'hello')];
    },
  });
  
  return rig.get('/foo/bar')
    .then((response) => {
      t.is(response.status, 200);
      t.deepEqual(response.headers, {});
      t.is(response.body, 'hello');
    });
});

test('returns not found', (t) => {
  const rig = server({
    'GET /foo/bar': (_, responseFx) => (state) => {
      return [state, responseFx(200, {}, 'hello')];
    },
  });
  
  return rig.get('/')
    .then((response) => {
      t.is(response.status, 404);
      t.deepEqual(response.headers, {});
    });
});

test('returns unacceptable', (t) => {
  const rig = server({
    'GET /foo/bar': {
      'text/html': (_, responseFx) => (state) => {
        return [state, responseFx(200, {}, 'hello')];
      },
    },
  });
  
  return rig.get('/foo/bar', { Accept: 'application/json' })
    .then((response) => {
      t.is(response.status, 406);
      t.deepEqual(response.headers, {});
    });
});
