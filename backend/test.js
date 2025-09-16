const WebSocket = require('ws');

const ws = new WebSocket('ws://103.250.146.66:8008');

ws.on('open', function open() {
  console.log('✅ Connected to WebSocket server');
  // Send a test message if needed
  ws.send(JSON.stringify({ action: "ping" }));
});

ws.on('message', function message(data) {
  console.log('📩 Received:', data);
});

ws.on('error', function error(err) {
  console.error('❌ WebSocket error:', err);
});

ws.on('close', function close() {
  console.log('🔌 Connection closed');
});
