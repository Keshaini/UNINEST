import { useEffect, useMemo, useRef, useState } from 'react';
import { useTicketChatSocket } from '../../../common/hooks/useTicketChatSocket';
import { appendUniqueTicketMessage, sortTicketMessages, toClientError } from '../../../common/utils/ticketChatUtils';
import { getSupportTicketDetails, getSupportTicketMessages, sendSupportTicketMessage } from '../../../services/complaintsService';

const MAX_CHAT_IMAGE_SIZE = 5 * 1024 * 1024;

export const useSupportTicketChat = ({ onAfterMessage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [chatError, setChatError] = useState('');
  const [chatImageFile, setChatImageFile] = useState(null);
  const [chatImagePreview, setChatImagePreview] = useState('');
  const activeLoadRef = useRef(0);

  const sortedMessages = useMemo(() => sortTicketMessages(messages), [messages]);
  const chatImageName = chatImageFile?.name || '';
  const canSendSupportMessage = Boolean(chatInput.trim() || chatImageFile) && !chatSending;

  const clearPendingChatImage = () => {
    setChatImageFile(null);
    setChatImagePreview('');
  };

  const handleChatImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setChatError('Please choose a valid image file.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_CHAT_IMAGE_SIZE) {
      setChatError('Image must be 5MB or smaller.');
      event.target.value = '';
      return;
    }

    setChatImageFile(file);
    setChatImagePreview(URL.createObjectURL(file));
    setChatError('');
  };

  const openChat = async (complaint) => {
    if (!complaint?._id) return;
    setChatError('');
    setChatInput('');
    setChatSending(false);
    clearPendingChatImage();
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
    clearPendingChatImage();
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
    if ((!message && !chatImageFile) || !ticket?._id) return;
    setChatSending(true);
    try {
      const senderName = ticket.assignedTo?.trim() || 'Support Team';
      const formPayload = new FormData();
      formPayload.append('senderName', senderName);
      formPayload.append('message', message);
      if (chatImageFile) formPayload.append('image', chatImageFile);

      const sentMessage = chatImageFile
        ? (await sendSupportTicketMessage(ticket._id, formPayload)).data
        : isSocketConnected
          ? await sendSocketMessage({ senderName, message })
          : (await sendSupportTicketMessage(ticket._id, { senderName, message })).data;
      setMessages((previous) => appendUniqueTicketMessage(previous, sentMessage));
      setChatInput('');
      clearPendingChatImage();
      setChatError('');
      await onAfterMessage?.();
    } catch (error) {
      try {
        const fallbackPayload = chatImageFile ? new FormData() : { senderName: ticket.assignedTo?.trim() || 'Support Team', message };
        if (chatImageFile) {
          fallbackPayload.append('senderName', ticket.assignedTo?.trim() || 'Support Team');
          fallbackPayload.append('message', message);
          fallbackPayload.append('image', chatImageFile);
        }

        const fallbackResponse = await sendSupportTicketMessage(ticket._id, fallbackPayload);
        setMessages((previous) => appendUniqueTicketMessage(previous, fallbackResponse.data));
        setChatInput('');
        clearPendingChatImage();
        setChatError('');
        await onAfterMessage?.();
      } catch (fallbackError) {
        setChatError(toClientError(fallbackError, toClientError(error, 'Failed to send support message.')));
      }
    } finally {
      setChatSending(false);
    }
  };

  useEffect(
    () => () => {
      if (chatImagePreview) URL.revokeObjectURL(chatImagePreview);
    },
    [chatImagePreview]
  );

  return {
    isOpen,
    ticket,
    sortedMessages,
    chatInput,
    setChatInput,
    chatImagePreview,
    chatImageName,
    chatSending,
    chatError,
    isSocketConnected,
    canSendSupportMessage,
    openChat,
    closeChat,
    handleChatImageChange,
    clearPendingChatImage,
    sendSupportMessage,
  };
};
