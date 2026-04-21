const {
  normalizeString,
  isValidRole,
  validateAccess,
  loadComplaint,
  appendMessage,
} = require('./chatService');

const MAX_CHAT_MESSAGE_LENGTH = 2000;

const roomName = (ticketId) => `ticket:${ticketId}`;
const runSafely = (ack, handler) =>
  Promise.resolve(handler()).catch(() => ack?.({ success: false, message: 'Socket server error.' }));

const resolveTicketContext = async ({ ticketId, participantRole, studentId }) => {
  const normalizedTicketId = normalizeString(ticketId);
  const normalizedRole = normalizeString(participantRole).toLowerCase();

  if (!normalizedTicketId) {
    return { ok: false, message: 'ticketId is required.' };
  }
  if (!isValidRole(normalizedRole)) {
    return { ok: false, message: 'participantRole must be student or support.' };
  }

  const { complaint, error } = await loadComplaint(normalizedTicketId);
  if (!complaint) {
    return { ok: false, message: error };
  }

  const access = validateAccess({ complaint, participantRole: normalizedRole, studentId });
  if (!access.ok) {
    return { ok: false, message: access.message };
  }

  return { ok: true, ticketId: normalizedTicketId, participantRole: normalizedRole, complaint };
};

const registerChatHandlers = (io, socket) => {
  socket.on('ticket:join', (payload = {}, ack) =>
    runSafely(ack, async () => {
      const context = await resolveTicketContext(payload);
      if (!context.ok) return ack?.({ success: false, message: context.message });
      socket.join(roomName(context.ticketId));
      return ack?.({ success: true, data: { ticketId: context.ticketId } });
    })
  );

  socket.on('ticket:leave', (payload = {}, ack) =>
    runSafely(ack, async () => {
      const ticketId = normalizeString(payload.ticketId);
      if (!ticketId) return ack?.({ success: false, message: 'ticketId is required.' });
      socket.leave(roomName(ticketId));
      return ack?.({ success: true });
    })
  );

  socket.on('ticket:message:send', (payload = {}, ack) =>
    runSafely(ack, async () => {
      const context = await resolveTicketContext(payload);
      if (!context.ok) return ack?.({ success: false, message: context.message });
      const message = normalizeString(payload.message);
      if (!message) return ack?.({ success: false, message: 'Message is required.' });
      if (message.length > MAX_CHAT_MESSAGE_LENGTH) {
        return ack?.({
          success: false,
          message: `Message must be ${MAX_CHAT_MESSAGE_LENGTH} characters or fewer.`,
        });
      }
      const savedMessage = await appendMessage({
        complaint: context.complaint,
        ticketId: context.ticketId,
        participantRole: context.participantRole,
        senderName: payload.senderName,
        message,
      });
      io.to(roomName(context.ticketId)).emit('ticket:message', {
        ticketId: context.ticketId,
        message: savedMessage,
      });
      return ack?.({ success: true, data: { message: savedMessage } });
    })
  );
};

module.exports = registerChatHandlers;
