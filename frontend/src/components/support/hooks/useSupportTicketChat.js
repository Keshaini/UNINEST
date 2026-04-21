import { useMemo, useRef, useState } from 'react';
import { useTicketChatSocket } from '../../../common/hooks/useTicketChatSocket';
import { appendUniqueTicketMessage, sortTicketMessages, toClientError } from '../../../common/utils/ticketChatUtils';
import { getSupportTicketDetails, getSupportTicketMessages, sendSupportTicketMessage } from '../../../services/complaintsService';

export const useSupportTicketChat = ({ onAfterMessage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [chatError, setChatError] = useState('');
  const activeLoadRef = useRef(0);

  const sortedMessages = useMemo(() => sortTicketMessages(messages), [messages]);

  const openChat = async (complaint) => {
    if (!complaint?._id) return;
    setChatError('');
    setChatInput('');
    setChatSending(false);
    setTicket(complaint);
    setMessages(complaint.chatMessages || []);
    setIsOpen(true);
    const loadId = activeLoadRef.current + 1;
    activeLoadRef.current = loadId;

    try {
      const [detailsResponse, messagesResponse] = await Promise.allSettled([
        getSupportTicketDetails(complaint._id),
        getSupportTicketMessages(complaint._id),
      ]);

      if (activeLoadRef.current !== loadId) return;

      const fullTicket = detailsResponse.status === 'fulfilled' ? detailsResponse.value.data || complaint : complaint;
      const rawChatMessages = messagesResponse.status === 'fulfilled' ? messagesResponse.value.data || [] : fullTicket.chatMessages || [];
      const chatMessages = rawChatMessages.filter((message) => !message.ticketId || message.ticketId === complaint._id);
      setTicket(fullTicket);
      setMessages(chatMessages);

      const detailsError =
        detailsResponse.status === 'rejected' ? toClientError(detailsResponse.reason, 'Failed to load full ticket details.') : '';
      const messagesError =
        messagesResponse.status === 'rejected' ? toClientError(messagesResponse.reason, 'Failed to load full ticket chat.') : '';
      setChatError(detailsError || messagesError);
    } catch (error) {
      setChatError(toClientError(error, 'Failed to load full ticket chat.'));
    }
  };

  const closeChat = () => {
    activeLoadRef.current += 1;
    setIsOpen(false);
    setTicket(null);
    setMessages([]);
    setChatInput('');
    setChatError('');
    setChatSending(false);
  };

  const { sendSocketMessage, isSocketConnected } = useTicketChatSocket({
    enabled: isOpen && Boolean(ticket?._id),
    ticketId: ticket?._id || '',
    participantRole: 'support',
    studentId: '',
    onMessage: (message) => setMessages((previous) => appendUniqueTicketMessage(previous, message)),
    onError: (errorText) => setChatError(errorText),
  });

  const sendSupportMessage = async (event) => {
    event.preventDefault();
    const message = chatInput.trim();
    if (!message || !ticket?._id) return;
    setChatSending(true);
    try {
      const messagePayload = {
        senderName: ticket.assignedTo?.trim() || 'Support Team',
        message,
      };
      const sentMessage = isSocketConnected
        ? await sendSocketMessage(messagePayload)
        : (await sendSupportTicketMessage(ticket._id, messagePayload)).data;
      setMessages((previous) => appendUniqueTicketMessage(previous, sentMessage));
      setChatInput('');
      setChatError('');
      await onAfterMessage?.();
    } catch (error) {
      try {
        const fallbackResponse = await sendSupportTicketMessage(ticket._id, {
          senderName: ticket.assignedTo?.trim() || 'Support Team',
          message,
        });
        setMessages((previous) => appendUniqueTicketMessage(previous, fallbackResponse.data));
        setChatInput('');
        setChatError('');
        await onAfterMessage?.();
      } catch (fallbackError) {
        setChatError(toClientError(fallbackError, toClientError(error, 'Failed to send support message.')));
      }
    } finally {
      setChatSending(false);
    }
  };

  return {
    isOpen,
    ticket,
    sortedMessages,
    chatInput,
    setChatInput,
    chatSending,
    chatError,
    isSocketConnected,
    openChat,
    closeChat,
    sendSupportMessage,
  };
};
