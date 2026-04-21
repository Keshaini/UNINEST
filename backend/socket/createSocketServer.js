const { Server } = require('socket.io');
const registerChatHandlers = require('./registerChatHandlers');

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

  return io;
};

module.exports = createSocketServer;
