const { Server } = require('socket.io');
const registerChatHandlers = require('./registerChatHandlers');

const createSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    registerChatHandlers(io, socket);
  });

  return io;
};

module.exports = createSocketServer;
