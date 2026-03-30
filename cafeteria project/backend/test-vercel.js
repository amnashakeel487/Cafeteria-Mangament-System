const https = require('https');

const data = JSON.stringify({
  email: 'admin@culinary.edu',
  password: 'adminpassword'
});

const options = {
  hostname: 'cafeteria-mangament-system.vercel.app',
  port: 443,
  path: '/api/admin/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);

  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
