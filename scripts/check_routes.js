const http = require('http');
const urls = ['/brand/nextyou-logo.png', '/', '/sjt', '/sweet-spot/lab'];
const host = '127.0.0.1';
const port = 3000;
function get(path) {
  return new Promise((resolve, reject) => {
    const req = http.get({ host, port, path, timeout: 5000 }, (res) => {
      let body = '';
      res.on('data', (c) => (body += c.toString()));
      res.on('end', () =>
        resolve({ path, status: res.statusCode, ctype: res.headers['content-type'], body }),
      );
    });
    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy(new Error('timeout'));
    });
  });
}
(async () => {
  for (const u of urls) {
    try {
      const r = await get(u);
      console.log(u, '->', r.status, r.ctype || '');
      if (u === '/') {
        console.log('  contains marketing body class?', /body\.marketing/.test(r.body));
        console.log('  contains #app-shell-header?', /#app-shell-header/.test(r.body));
      } else {
        console.log('  contains #app-shell-header?', /#app-shell-header/.test(r.body));
      }
    } catch (e) {
      console.error(u, 'ERR', e.message);
    }
  }
})();
