import { useCallback, useEffect, useRef, useState } from 'react';
import { getSocketClient } from '../socket/socketClient';

const getAckError = (ack) => ack?.message || 'Socket request failed.';
const buildJoinPayload = (ticketId, participantRole, studentId) => ({ ticketId, participantRole, studentId });

export const useTicketChatSocket = ({ enabled, ticketId, participantRole, studentId, onMessage, onError }) => {
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const messageHandlerRef = useRef(onMessage);
  const errorHandlerRef = useRef(onError);
  const socketRef = useRef(null);
  const ackTimeoutRef = useRef(null);

  useEffect(() => {
    messageHandlerRef.current = onMessage;
    errorHandlerRef.current = onError;
  }, [onMessage, onError]);

  useEffect(() => {
    if (!enabled || !ticketId || !participantRole) return undefined;
    const socket = getSocketClient();
    socketRef.current = socket;
    let isActive = true;

    const emitJoin = () => {
      socket.emit('ticket:join', buildJoinPayload(ticketId, participantRole, studentId), (ack) => {
        if (!isActive) return;
        if (!ack?.success) errorHandlerRef.current?.(getAckError(ack));
      });
    };

    const onConnect = () => {
      setIsSocketConnected(true);
      emitJoin();
    };
    const onDisconnect = () => setIsSocketConnected(false);
    const onConnectError = () => {
      setIsSocketConnected(false);
      errorHandlerRef.current?.('Live chat is temporarily unavailable. Messages will use the backup channel if supported.');
    };
    const onTicketMessage = (payload = {}) => {
      if (payload.ticketId !== ticketId || !payload.message) return;
      messageHandlerRef.current?.(payload.message);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('ticket:message', onTicketMessage);
    if (socket.connected) {
      setIsSocketConnected(true);
      emitJoin();
    } else {
      setIsSocketConnected(false);
    }

    return () => {
      isActive = false;
      socket.emit('ticket:leave', { ticketId });
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('ticket:message', onTicketMessage);
      if (socketRef.current === socket) socketRef.current = null;
      if (ackTimeoutRef.current) {
        clearTimeout(ackTimeoutRef.current);
        ackTimeoutRef.current = null;
      }
      setIsSocketConnected(false);
    };
  }, [enabled, ticketId, participantRole, studentId]);

  const sendSocketMessage = useCallback(
    (messagePayload) =>
      new Promise((resolve, reject) => {
        if (!ticketId || !participantRole) {
          reject(new Error('Ticket chat is not ready.'));
          return;
        }
        if (participantRole === 'student' && !studentId) {
          reject(new Error('Student ID is required for student chat.'));
          return;
        }
        const socket = socketRef.current || getSocketClient();
        if (!socket.connected) {
          reject(new Error('Live chat is unavailable right now.'));
          return;
        }
        ackTimeoutRef.current = setTimeout(() => {
          ackTimeoutRef.current = null;
          reject(new Error('Live chat timed out.'));
        }, 6000);
        socket.emit(
          'ticket:message:send',
          { ticketId, participantRole, studentId, ...messagePayload },
          (ack) => {
            if (ackTimeoutRef.current) {
              clearTimeout(ackTimeoutRef.current);
              ackTimeoutRef.current = null;
            }
            ack?.success ? resolve(ack.data?.message) : reject(new Error(getAckError(ack)));
          }
        );
      }),
    [ticketId, participantRole, studentId]
  );

  return { isSocketConnected, sendSocketMessage };
};
