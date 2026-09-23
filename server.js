const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const { createProxyMiddleware } = require('http-proxy-middleware');
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

app.post(
  '/analyze-frame',
  createProxyMiddleware({
    target: 'http://localhost:5000',
    changeOrigin: true,
    logLevel: 'debug'
  })
);


app.use(express.static(path.join(__dirname, 'public')));

const rooms = {};

io.on('connection', (socket) => {
  console.log('✅ New connection:', socket.id);


  socket.on('create-room', (roomId) => {
    rooms[roomId] = { interviewer: socket.id };
    socket.join(roomId);
    console.log(`📋 Room created: ${roomId}`);
  });


  socket.on('join-room', (roomId) => {
    if (!rooms[roomId]) {
      socket.emit('error', 'Room not found');
      return;
    }
    rooms[roomId].candidate = socket.id;
    socket.join(roomId);
    
    socket.to(roomId).emit('candidate-joined');
    console.log(`👤 Candidate joined room: ${roomId}`);
  });

  
  socket.on('offer', ({ roomId, offer }) => {
    socket.to(roomId).emit('offer', offer);
  });

  socket.on('answer', ({ roomId, answer }) => {
    socket.to(roomId).emit('answer', answer);
  });

  socket.on('ice-candidate', ({ roomId, candidate }) => {
    socket.to(roomId).emit('ice-candidate', candidate);
  });

  socket.on('detection-result', (data) => {
  const roomId = [...socket.rooms].find(r => r !== socket.id);
  if (roomId) {
    socket.to(roomId).emit('detection-result', data);
  }
});

  socket.on('disconnect', () => {
    Object.keys(rooms).forEach(roomId => {
      if (rooms[roomId].interviewer === socket.id ||
          rooms[roomId].candidate === socket.id) {
        io.to(roomId).emit('peer-disconnected');
        delete rooms[roomId];
      }
    });
    console.log('❌ Disconnected:', socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Signaling server running!`);
  console.log(`   Local: http://localhost:${PORT}`);
  console.log(`   Network: http://YOUR_IP:${PORT}`);
  console.log(`\n   Share candidate page: http://YOUR_IP:${PORT}/candidate.html\n`);
});