// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const net = require('net');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static frontend (put index.html + assets in ./public)
app.use(express.static(path.join(__dirname, 'public')));

// Port for the HTTP/WebSocket bridge (Render will set process.env.PORT)
const PORT = parseInt(process.env.PORT, 10) || 8080;

// TCP chat server port (internal). Use a non-privileged port.
const TCP_PORT = parseInt(process.env.TCP_PORT, 10) || 4000;
const TCP_HOST = process.env.TCP_HOST || '127.0.0.1';

// ---------- TCP Chat Server ----------
let clients = new Map();

const tcpServer = net.createServer((socket) => {
  socket.setEncoding('utf8');
  socket.write('Welcome! You Are Login \n');

  let username = null;

  socket.on('data', (data) => {
    const message = data.toString().trim();

    // LOGIN
    if (!username && message.startsWith('LOGIN ')) {
      const requestedName = message.split(' ')[1];
      if (!requestedName) {
        socket.write('ERR invalid-username\n');
        return;
      }

      if ([...clients.values()].includes(requestedName)) {
        socket.write('ERR username-taken\n');
        return;
      }

      username = requestedName;
      clients.set(socket, username);

      // send username OK
      socket.write(`${username} OK\n`);

      // Notify others
      broadcastTCP(`INFO ${username} joined\n`, socket);
      return;
    }

    // Must login first
    if (!username) {
      socket.write('ERR please-login-first\n');
      return;
    }

    // MSG command
    if (message.startsWith('MSG ')) {
      const text = message.slice(4).trim();
      if (text.length > 0) {
        broadcastTCP(`MSG ${username} ${text}\n`, socket);
      }
      return;
    }

    // WHO command
    if (message === 'WHO') {
      for (let user of clients.values()) {
        socket.write(`USER ${user}\n`);
      }
      return;
    }

    // Unknown command
    socket.write('ERR unknown-command\n');
  });

  socket.on('close', () => {
    if (username) {
      clients.delete(socket);
      broadcastTCP(`INFO ${username} disconnected\n`);
    }
  });

  socket.on('error', () => {});
});

function broadcastTCP(message, senderSocket) {
  for (const [client] of clients.entries()) {
    if (client !== senderSocket) client.write(message);
  }
}

// Start TCP server (listens on internal port)
tcpServer.listen(TCP_PORT, TCP_HOST, () => {
  console.log(`✅ TCP Chat Server running on ${TCP_HOST}:${TCP_PORT}`);
});

// ---------- WebSocket bridge ----------
wss.on('connection', (ws) => {
  console.log('🌐 WebSocket Client Connected');

  // Connect this websocket connection to an internal TCP socket
  const tcpSocket = new net.Socket();
  tcpSocket.setEncoding('utf8');

  tcpSocket.connect(TCP_PORT, TCP_HOST, () => {
    console.log('🔗 Bridge connected to TCP Chat Server');
    ws.send('Connected to Bridge Server\n');
  });

  tcpSocket.on('data', (data) => {
    // forward TCP data to WS client
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data.toString());
    }
  });

  tcpSocket.on('close', () => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send('Disconnected from TCP Server\n');
    }
  });

  tcpSocket.on('error', (err) => {
    console.error('TCP Error:', err.message);
    if (ws.readyState === WebSocket.OPEN) {
      ws.send('Error connecting to TCP Server\n');
    }
  });

  ws.on('message', (msg) => {
    // forward from WS to TCP (append newline)
    tcpSocket.write(msg.toString() + '\n');
  });

  ws.on('close', () => {
    tcpSocket.end();
    console.log('🔻 WebSocket Client Disconnected');
  });

  ws.on('error', () => {
    tcpSocket.end();
  });
});

// Start HTTP/WebSocket server on required port
server.listen(PORT, () => {
  console.log(`🌐 Bridge HTTP/WebSocket server listening on port ${PORT}`);
});
