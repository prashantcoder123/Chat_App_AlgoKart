const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const net = require('net');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

wss.on('connection', (ws) => {
  const tcpClient = new net.Socket();

  // Connect to TCP server
  tcpClient.connect(4000, '127.0.0.1', () => {
    console.log('🔗 Connected to TCP chat server');
  });

  // When data comes from TCP server → send to browser
  tcpClient.on('data', (data) => {
    ws.send(data.toString());
  });

  // When browser sends message → forward to TCP server
  ws.on('message', (msg) => {
    const clean = msg.toString().trim();
    if (clean.length > 0) {
      tcpClient.write(clean + '\n'); // ✅ ensure newline
    }
  });

  ws.on('close', () => tcpClient.destroy());
  tcpClient.on('error', (err) => console.log('TCP Error:', err.message));
});

server.listen(8080, () =>
  console.log('🌐 Bridge server running on http://localhost:8080')
);
