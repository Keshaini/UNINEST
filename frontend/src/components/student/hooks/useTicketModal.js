import { useEffect, useMemo, useRef, useState } from 'react';
import { useTicketChatSocket } from '../../../common/hooks/useTicketChatSocket';
import { appendUniqueTicketMessage, sortTicketMessages, toClientError } from '../../../common/utils/ticketChatUtils';
import { getStudentTicketDetails, getStudentTicketMessages, sendStudentTicketMessage } from '../../../services/complaintsService';

const MAX_CHAT_IMAGE_SIZE = 5 * 1024 * 1024;

export const useTicketModal = ({ currentStudentId, onLoadMyComplaints, fallbackStudentName }) => {
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [fullTicket, setFullTicket] = useState(null);
  const [ticketMessages, setTicketMessages] = useState([]);
  const [ticketModalLoading, setTicketModalLoading] = useState(false);
  const [ticketModalError, setTicketModalError] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [chatImageFile, setChatImageFile] = useState(null);
  const [chatImagePreview, setChatImagePreview] = useState('');
  const activeLoadRef = useRef(0);
  const sortedMessages = useMemo(() => sortTicketMessages(ticketMessages), [ticketMessages]);
  const chatImageName = chatImageFile?.name || '';
  const canSendChatMessage = Boolean(chatInput.trim() || chatImageFile) && !chatSending;

  const clearPendingChatImage = () => {
    setChatImageFile(null);
    setChatImagePreview('');
  };

  const handleChatImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setTicketModalError('Please choose a valid image file.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_CHAT_IMAGE_SIZE) {
      setTicketModalError('Image must be 5MB or smaller.');
      event.target.value = '';
      return;
    }

    setChatImageFile(file);
    setChatImagePreview(URL.createObjectURL(file));
    setTicketModalError('');
  };

  const closeTicketModal = () => {
    activeLoadRef.current += 1;
    setIsTicketModalOpen(false);
    setSelectedTicketId('');
    setFullTicket(null);
    setTicketMessages([]);
    setChatInput('');
    setChatSending(false);
    clearPendingChatImage();
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
    clearPendingChatImage();
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
    if ((!message && !chatImageFile) || !selectedTicketId || !currentStudentId) return;
    setChatSending(true);
    try {
      const shouldUploadImage = Boolean(chatImageFile);
      const senderName = fallbackStudentName?.trim() || currentStudentId;
      const formPayload = new FormData();
      formPayload.append('senderName', senderName);
      formPayload.append('message', message);
      if (chatImageFile) formPayload.append('image', chatImageFile);

      const sentMessage = shouldUploadImage
        ? (await sendStudentTicketMessage(selectedTicketId, currentStudentId, formPayload)).data
        : isSocketConnected
          ? await sendSocketMessage({ senderName, message })
          : (await sendStudentTicketMessage(selectedTicketId, currentStudentId, { senderName, message })).data;
      setTicketMessages((previous) => appendUniqueTicketMessage(previous, sentMessage));
      setChatInput('');
      clearPendingChatImage();
      setTicketModalError('');
      await onLoadMyComplaints();
    } catch (error) {
      try {
        const fallbackPayload = chatImageFile ? new FormData() : { senderName: fallbackStudentName?.trim() || currentStudentId, message };
        if (chatImageFile) {
          fallbackPayload.append('senderName', fallbackStudentName?.trim() || currentStudentId);
          fallbackPayload.append('message', message);
          fallbackPayload.append('image', chatImageFile);
        }

        const fallbackResponse = await sendStudentTicketMessage(selectedTicketId, currentStudentId, fallbackPayload);
        setTicketMessages((previous) => appendUniqueTicketMessage(previous, fallbackResponse.data));
        setChatInput('');
        clearPendingChatImage();
        setTicketModalError('');
        await onLoadMyComplaints();
      } catch (fallbackError) {
        setTicketModalError(toClientError(fallbackError, toClientError(error, 'Failed to send message.')));
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
    chatImagePreview,
    chatImageName,
    canSendChatMessage,
    chatSending,
    handleChatImageChange,
    clearPendingChatImage,
    handleSendChatMessage,
    openTicketModal,
  };
};
