const fs = require('fs');
const email = process.env.SA_EMAIL;
const key = (process.env.SA_KEY || '').replace(/\\n/g, '\n');
if (!email || !key) { console.error('Missing SA_EMAIL or SA_KEY'); process.exit(1); }
fs.writeFileSync('config.js', `window.__ENV__={SA_EMAIL:${JSON.stringify(email)},SA_KEY:${JSON.stringify(key)}};`);
console.log('config.js written, key length:', key.length);
