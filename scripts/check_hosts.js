const http = require('http');
const hosts = ['localhost', '127.0.0.1', '::1'];
const paths = ['/brand/nextyou-logo.png', '/', '/sjt', '/sweet-spot/lab'];
const port = 3000;

function get(host, path) {
  return new Promise((resolve) => {
    const options = { host, port, path, timeout: 5000 };
    const req = http.get(options, (res) => {
      let body = '';
      res.on('data', (c) => (body += c.toString()));
      res.on('end', () =>
        resolve({
          host,
          path,
          status: res.statusCode,
          ctype: res.headers['content-type'],
          body: body.slice(0, 5000),
        }),
      );
    });
    req.on('error', (e) => resolve({ host, path, err: e.message }));
  });
}

(async () => {
  for (const host of hosts) {
    for (const p of paths) {
      const r = await get(host, p);
      if (r.err) console.log(`${host}${p} ERR ${r.err}`);
      else {
        console.log(`${host}${p} -> ${r.status} ${r.ctype || ''}`);
        if (p === '/')
          console.log('  contains marketing body class?', /body\.marketing/.test(r.body));
        console.log('  contains #app-shell-header?', /#app-shell-header/.test(r.body));
      }
    }
  }
})();
