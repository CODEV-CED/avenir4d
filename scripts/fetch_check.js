const http = require('http');
const https = require('https');
const urls = [
  'http://localhost:3000/brand/nextyou-logo.png',
  'http://localhost:3000/',
  'http://localhost:3000/sjt',
  'http://localhost:3000/sweet-spot/lab',
];

function get(u) {
  return new Promise((resolve) => {
    const lib = u.startsWith('https') ? https : http;
    const req = lib.get(
      u,
      { timeout: 5000, headers: { 'accept-encoding': 'gzip,deflate' } },
      (res) => {
        const ctype = res.headers['content-type'] || '';
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          if (ctype.startsWith('image')) {
            resolve({ url: u, status: res.statusCode, ctype, len: buf.length });
          } else {
            const body = buf.toString('utf8');
            resolve({
              url: u,
              status: res.statusCode,
              ctype,
              len: buf.length,
              body: body.slice(0, 2000),
            });
          }
        });
      },
    );
    req.on('error', (e) => resolve({ url: u, err: e.message }));
  });
}
(async () => {
  for (const u of urls) {
    const r = await get(u);
    if (r.err) console.log(r.url, 'ERR', r.err);
    else {
      console.log(r.url, '->', r.status, r.ctype, 'len=', r.len);
      console.log('snippet:', r.body.slice(0, 300));
      console.log('contains marketing body class?', /body\.marketing/.test(r.body));
      console.log('contains #app-shell-header?', /#app-shell-header/.test(r.body));
      console.log('---');
    }
  }
})();
