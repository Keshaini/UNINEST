import { useEffect, useMemo, useRef, useState } from 'react';
import { useTicketChatSocket } from '../../../common/hooks/useTicketChatSocket';
import { appendUniqueTicketMessage, sortTicketMessages, toClientError } from '../../../common/utils/ticketChatUtils';
import { getStudentTicketDetails, getStudentTicketMessages, sendStudentTicketMessage } from '../../../services/complaintsService';

export const useTicketModal = ({ currentStudentId, onLoadMyComplaints, fallbackStudentName }) => {
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [fullTicket, setFullTicket] = useState(null);
  const [ticketMessages, setTicketMessages] = useState([]);
  const [ticketModalLoading, setTicketModalLoading] = useState(false);
  const [ticketModalError, setTicketModalError] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const activeLoadRef = useRef(0);
  const sortedMessages = useMemo(() => sortTicketMessages(ticketMessages), [ticketMessages]);

  const closeTicketModal = () => {
    activeLoadRef.current += 1;
    setIsTicketModalOpen(false);
    setSelectedTicketId('');
    setFullTicket(null);
    setTicketMessages([]);
    setChatInput('');
    setChatSending(false);
    setTicketModalError('');
    setTicketModalLoading(false);
  };

  const loadTicketModalData = async (ticketId, seedTicket = null) => {
    if (!ticketId || !currentStudentId) return;
    const loadId = activeLoadRef.current + 1;
    activeLoadRef.current = loadId;
    setTicketModalLoading(true);
    setTicketModalError('');
    setFullTicket(seedTicket || null);
    setTicketMessages(seedTicket?.chatMessages || []);
    const [details, messages] = await Promise.allSettled([
      getStudentTicketDetails(ticketId, currentStudentId),
      getStudentTicketMessages(ticketId, currentStudentId),
    ]);

    if (activeLoadRef.current !== loadId) return;

    const ticket = details.status === 'fulfilled' ? details.value.data || seedTicket : seedTicket;
    const chatPayload = messages.status === 'fulfilled' ? messages.value.data || [] : ticket?.chatMessages || [];
    const chat = chatPayload.filter((message) => !message.ticketId || message.ticketId === ticketId);
    setFullTicket(ticket || null);
    setTicketMessages(chat);
    const detailError = details.status === 'rejected' && !ticket ? toClientError(details.reason, 'Failed to load ticket details.') : '';
    const chatError = messages.status === 'rejected' ? toClientError(messages.reason, 'Chat is temporarily unavailable.') : '';
    setTicketModalError(detailError || chatError);
    setTicketModalLoading(false);
  };

  const openTicketModal = async (ticket) => {
    if (!ticket?._id) return;
    setSelectedTicketId(ticket._id);
    setFullTicket(ticket);
    setTicketMessages(ticket.chatMessages || []);
    setChatInput('');
    setChatSending(false);
    setTicketModalError('');
    setIsTicketModalOpen(true);
    await loadTicketModalData(ticket._id, ticket);
  };

  const { isSocketConnected, sendSocketMessage } = useTicketChatSocket({
    enabled: isTicketModalOpen && Boolean(selectedTicketId),
    ticketId: selectedTicketId,
    participantRole: 'student',
    studentId: currentStudentId,
    onMessage: (message) => setTicketMessages((previous) => appendUniqueTicketMessage(previous, message)),
    onError: (errorText) => setTicketModalError(errorText),
  });

  const handleSendChatMessage = async (event) => {
    event.preventDefault();
    const message = chatInput.trim();
    if (!message || !selectedTicketId || !currentStudentId) return;
    setChatSending(true);
    try {
      const messagePayload = {
        senderName: fallbackStudentName?.trim() || currentStudentId,
        message,
      };
      const sentMessage = isSocketConnected
        ? await sendSocketMessage(messagePayload)
        : (await sendStudentTicketMessage(selectedTicketId, currentStudentId, messagePayload)).data;
      setTicketMessages((previous) => appendUniqueTicketMessage(previous, sentMessage));
      setChatInput('');
      setTicketModalError('');
      await onLoadMyComplaints();
    } catch (error) {
      try {
        const fallbackResponse = await sendStudentTicketMessage(selectedTicketId, currentStudentId, {
          senderName: fallbackStudentName?.trim() || currentStudentId,
          message,
        });
        setTicketMessages((previous) => appendUniqueTicketMessage(previous, fallbackResponse.data));
        setChatInput('');
        setTicketModalError('');
        await onLoadMyComplaints();
      } catch (fallbackError) {
        setTicketModalError(toClientError(fallbackError, toClientError(error, 'Failed to send message.')));
      }
    } finally {
      setChatSending(false);
    }
  };

  useEffect(() => {
    if (!isTicketModalOpen) return undefined;
    const handleEscape = (event) => event.key === 'Escape' && closeTicketModal();
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isTicketModalOpen]);

  return {
    isTicketModalOpen,
    closeTicketModal,
    ticketModalLoading,
    ticketModalError,
    fullTicket,
    sortedMessages,
    isSocketConnected,
    chatInput,
    setChatInput,
    chatSending,
    handleSendChatMessage,
    openTicketModal,
  };
};
