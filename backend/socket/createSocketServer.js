const { Server } = require('socket.io');
const registerChatHandlers = require('./registerChatHandlers');
const { setIo } = require('./socketStore');

const createSocketServer = (httpServer, allowedOrigins = ['*']) => {
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    registerChatHandlers(io, socket);
  });

  setIo(io);
  return io;
};

module.exports = createSocketServer;
