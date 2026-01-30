const express = require('express');
const app = express();

app.get('/test', (req, res) => {
  res.json({ message: 'Test server working!' });
});

const server = app.listen(5001, () => {
  console.log('Test server listening on port 5001');
  console.log('Server object:', !!server);
  console.log('Server listening:', server.listening);
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

// Keep process alive
setInterval(() => {
  console.log('Still alive... Listening:', server.listening);
}, 5000);
