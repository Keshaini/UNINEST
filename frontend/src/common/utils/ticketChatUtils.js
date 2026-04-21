export const sortTicketMessages = (messages = []) =>
  [...messages].sort((first, second) => new Date(first.sentAt) - new Date(second.sentAt));

const buildMessageKey = (message = {}) => message._id || `${message.senderRole}-${message.sentAt}-${message.message}`;

export const appendUniqueTicketMessage = (messages = [], nextMessage) => {
  if (!nextMessage) return messages;
  const nextKey = buildMessageKey(nextMessage);
  const exists = messages.some((message) => buildMessageKey(message) === nextKey);
  return exists ? messages : [...messages, nextMessage];
};

export const toClientError = (error, fallback) => error?.response?.data?.message || error?.message || fallback;
