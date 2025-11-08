
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const net = require('net');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ✅ Serve static frontend files (index.html, CSS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Use Render’s dynamic port OR fallback
const PORT = process.env.PORT || 8080;

// ✅ TCP Server Configuration
// If running both servers on Render, keep 'localhost'.
// If TCP server is deployed separately, replace with its Render URL/hostname.

//deploy before

// const TCP_SERVER_HOST = 'localhost';

const TCP_SERVER_HOST = 'chat-app-algokart-1.onrender.com';

const TCP_SERVER_PORT = process.env.TCP_PORT || 4000;

// 🧩 Bridge connections between WebSocket clients and TCP server
wss.on('connection', (ws) => {
  console.log('🌐 WebSocket Client Connected');

  const tcpSocket = new net.Socket();
  tcpSocket.connect(TCP_SERVER_PORT, TCP_SERVER_HOST, () => {
    console.log('🔗 Connected to TCP Chat Server');
    ws.send('Connected to Bridge Server\n');
  });

  tcpSocket.on('data', (data) => {
    ws.send(data.toString());
  });

  tcpSocket.on('close', () => {
    ws.send('Disconnected from TCP Server\n');
  });

  tcpSocket.on('error', (err) => {
    console.error('TCP Error:', err.message);
    ws.send('Error connecting to TCP Server\n');
  });

  ws.on('message', (msg) => {
    tcpSocket.write(msg.toString() + '\n');
  });

  ws.on('close', () => {
    tcpSocket.end();
    console.log('🔻 WebSocket Client Disconnected');
  });
});

// ✅ Start Bridge Server
server.listen(PORT, () => {
  console.log(`🌐 Bridge Server running on port ${PORT}`);
});
