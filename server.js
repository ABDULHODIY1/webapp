const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const redisAdapter = require('socket.io-redis');

// Random pairing queue
let waiting = null;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Attach Redis adapter for scalability
io.adapter(redisAdapter({ host: 'localhost', port: 6379 }));

// Serve static frontend
app.use(express.static('public'));

// Handle socket connections
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Pairing logic
  if (!waiting) {
    waiting = socket;
    socket.emit('status', 'Sherik izlanmoqda...');
  } else {
    const partner = waiting;
    waiting = null;
    const room = `${socket.id}#${partner.id}`;
    socket.join(room);
    partner.join(room);

    // Notify both
    io.to(room).emit('paired', { room });
    console.log(`Paired ${socket.id} with ${partner.id}`);
  }

  // Signaling relay
  socket.on('signal', (data) => {
    socket.to(data.room).emit('signal', {
      from: socket.id,
      signal: data.signal,
    });
  });

  socket.on('disconnect', () => {
    if (waiting && waiting.id === socket.id) waiting = null;
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
