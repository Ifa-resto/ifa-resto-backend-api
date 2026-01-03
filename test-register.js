const http = require('http');

const data = JSON.stringify({
  email: "user2@example.com", // Changed to a new email
  password: "Stringst1",
  role: "CUSTOMER",
  firstName: "moasko",
  lastName: "dav",
  phone: "+2250574641453"
});

const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/v1/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  res.on('data', (chunk) => {
    console.log(`Response: ${chunk}`);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();