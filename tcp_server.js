// const net = require('net');

// const PORT = 4000;
// let clients = new Map();

// const server = net.createServer((socket) => {
//   socket.setEncoding('utf8');
//   socket.write('Welcome! You Are Login \n');

//   let username = null;

//   socket.on('data', (data) => {
//     const message = data.trim();

//     // LOGIN
//     if (!username && message.startsWith('LOGIN ')) {
//       const requestedName = message.split(' ')[1];
//       if (!requestedName) {
//         socket.write('ERR invalid-username\n');
//         return;
//       }

//       if ([...clients.values()].includes(requestedName)) {
//         socket.write('ERR username-taken\n');
//         return;
//       }

//       username = requestedName;
//       clients.set(socket, username);

//       // 🔹 Send username before OK
//       socket.write(`${username} OK\n`);

//       // Notify others
//       broadcast(`INFO ${username} joined\n`, socket);
//       return;
//     }

//     // Must login first
//     if (!username) {
//       socket.write('ERR please-login-first\n');
//       return;
//     }

//     // MSG command
//     if (message.startsWith('MSG ')) {
//       const text = message.slice(4).trim();
//       if (text.length > 0) {
//         broadcast(`MSG ${username} ${text}\n`, socket);
//       }
//       return;
//     }

//     // WHO command
//     if (message === 'WHO') {
//       for (let user of clients.values()) {
//         socket.write(`USER ${user}\n`);
//       }
//       return;
//     }

//     // Unknown command
//     socket.write('ERR unknown-command\n');
//   });

//   socket.on('close', () => {
//     if (username) {
//       clients.delete(socket);
//       broadcast(`INFO ${username} disconnected\n`);
//     }
//   });

//   socket.on('error', () => {});
// });

// function broadcast(message, senderSocket) {
//   for (const [client] of clients.entries()) {
//     if (client !== senderSocket) client.write(message);
//   }
// }

// server.listen(PORT, () => {
//   console.log(`✅ TCP Chat Server running on port ${PORT}`);
// });
const net = require('net');

// ✅ Use Render's port if available
const PORT = process.env.PORT || 4000;
let clients = new Map();

const server = net.createServer((socket) => {
  socket.setEncoding('utf8');
  socket.write('Welcome! You Are Login \n');

  let username = null;

  socket.on('data', (data) => {
    const message = data.trim();

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

      // 🔹 Send username before OK
      socket.write(`${username} OK\n`);

      // Notify others
      broadcast(`INFO ${username} joined\n`, socket);
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
        broadcast(`MSG ${username} ${text}\n`, socket);
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
      broadcast(`INFO ${username} disconnected\n`);
    }
  });

  socket.on('error', () => {});
});

function broadcast(message, senderSocket) {
  for (const [client] of clients.entries()) {
    if (client !== senderSocket) client.write(message);
  }
}

// ✅ Use dynamic or fallback port
server.listen(PORT, () => {
  console.log(`✅ TCP Chat Server running on port ${PORT}`);
});
