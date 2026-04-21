const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');
const roomName = (userId) => `notifications:${userId}`;

const runSafely = (ack, handler) =>
  Promise.resolve(handler()).catch(() => ack?.({ success: false, message: 'Socket server error.' }));

const registerNotificationHandlers = (_io, socket) => {
  socket.on('notifications:subscribe', (payload = {}, ack) =>
    runSafely(ack, async () => {
      const userId = normalizeString(payload.userId);
      if (!userId) return ack?.({ success: false, message: 'userId is required.' });
      socket.join(roomName(userId));
      return ack?.({ success: true, data: { userId } });
    })
  );

  socket.on('notifications:unsubscribe', (payload = {}, ack) =>
    runSafely(ack, async () => {
      const userId = normalizeString(payload.userId);
      if (!userId) return ack?.({ success: false, message: 'userId is required.' });
      socket.leave(roomName(userId));
      return ack?.({ success: true });
    })
  );
};

module.exports = registerNotificationHandlers;
