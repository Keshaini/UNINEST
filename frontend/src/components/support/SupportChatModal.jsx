import { ImagePlus, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { formatDateTime } from '../../common/utils/formatDateTime';
import { PRIORITY_LABEL, STATUS_LABEL } from '../../data/complaintData';
import { resolveComplaintAssetUrl } from '../../services/complaintsService';

const SupportChatModal = ({
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
  handleChatImageChange,
  clearPendingChatImage,
  onClose,
  onSendMessage,
}) => {
  const imageInputRef = useRef(null);
  const messageCount = sortedMessages.length;
  const latestMessage = messageCount > 0 ? sortedMessages[messageCount - 1] : null;
  const ticketCode = ticket?._id ? `#${String(ticket._id).slice(-6).toUpperCase()}` : '#N/A';
  const statusLabel = STATUS_LABEL[ticket?.status] || ticket?.status || 'Pending';
  const priorityLabel = PRIORITY_LABEL[ticket?.priority] || ticket?.priority || 'Medium';

  useEffect(() => {
    if (!chatImagePreview && imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  }, [chatImagePreview]);

  if (!isOpen || !ticket) return null;

  return (
    <div className="support-chat-overlay" role="presentation" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <article className="support-chat-modal" role="dialog" aria-modal="true" aria-label="Support ticket chat">
        <header className="support-chat-header">
          <div className="support-chat-head-copy">
            <p className="support-chat-eyebrow">Ticket Conversation</p>
            <h3>{ticket.title}</h3>
            <p className="support-chat-context">
              <span>{ticket.studentName || ticket.studentId || 'Unknown student'}</span>
              <span>Room {ticket.roomNumber || 'N/A'}</span>
              <span>{ticketCode}</span>
            </p>
          </div>
          <button className="support-chat-close" type="button" onClick={onClose} aria-label="Close chat modal">
            <span className="support-chat-close-icon" aria-hidden="true">
              <svg viewBox="0 0 20 20" focusable="false">
                <path d="M5 5L15 15" />
                <path d="M15 5L5 15" />
              </svg>
            </span>
            <span>Close</span>
          </button>
        </header>

        <div className="support-chat-statusbar">
          <span className={`socket-status ${isSocketConnected ? 'live' : 'reconnecting'}`}>
            <span className="socket-dot" aria-hidden="true" />
            {isSocketConnected ? 'Connection live' : 'Reconnecting...'}
          </span>
          <div className="support-chat-tags">
            <span className={`chip status-${ticket.status}`}>{statusLabel}</span>
            <span className={`chip priority-${ticket.priority}`}>{priorityLabel}</span>
            <span className="chip ticket-code">{ticketCode}</span>
          </div>
        </div>

        <p className="support-chat-subtitle">
          {latestMessage
            ? `${messageCount} message(s) | Last update ${formatDateTime(latestMessage.sentAt)}`
            : 'No messages yet. Start with a clear response so the student knows the next step.'}
        </p>

        {chatError ? (
          <div className="support-chat-error" role="alert" aria-live="assertive">
            {chatError}
          </div>
        ) : null}

        <div className="support-chat-thread" role="log" aria-live="polite">
          {sortedMessages.length === 0 ? (
            <div className="support-chat-empty">
              <strong>No chat messages yet</strong>
              <p>Write a concise update with a timeline or action needed from the student.</p>
            </div>
          ) : null}
          {sortedMessages.map((message) => (
            <article className={`support-chat-item ${message.senderRole}`} key={message._id || `${message.sentAt}-${message.message}-${message.imageUrl || ''}`}>
              <span className="support-chat-avatar" aria-hidden="true">
                {(message.senderRole === 'support' ? 'S' : 'U').toUpperCase()}
              </span>
              <div className="support-chat-bubble">
                <div className="chat-meta">
                  <strong>{message.senderName || (message.senderRole === 'support' ? 'Support Team' : 'Student')}</strong>
                  <span>{formatDateTime(message.sentAt)}</span>
                </div>
                {message.imageUrl ? (
                  <a
                    className="chat-image-link"
                    href={resolveComplaintAssetUrl(message.imageUrl)}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open image sent by ${message.senderName || message.senderRole}`}
                  >
                    <img className="chat-image" src={resolveComplaintAssetUrl(message.imageUrl)} alt={message.imageName || 'Chat attachment'} />
                  </a>
                ) : null}
                {message.message ? <p>{message.message}</p> : null}
              </div>
            </article>
          ))}
        </div>

        <form className="chat-form" onSubmit={onSendMessage}>
          <label htmlFor="support-chat-input">Reply to student</label>
          <textarea
            id="support-chat-input"
            rows={3}
            maxLength={600}
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
            placeholder="Type a clear update, next action, or request for more details..."
          />
          <div className="chat-attachment-row">
            <input
              ref={imageInputRef}
              id="support-chat-image"
              className="chat-file-input"
              type="file"
              accept="image/*"
              onChange={handleChatImageChange}
            />
            <label className="chat-upload-btn" htmlFor="support-chat-image">
              <ImagePlus size={16} strokeWidth={2.2} aria-hidden="true" />
              <span>Add Photo</span>
            </label>
            <span className="chat-upload-note">JPG, PNG, WEBP, or GIF up to 5MB.</span>
          </div>
          {chatImagePreview ? (
            <div className="chat-upload-preview">
              <img src={chatImagePreview} alt={chatImageName || 'Selected upload'} />
              <div className="chat-upload-preview-copy">
                <strong>{chatImageName || 'Selected image'}</strong>
                <span>This photo will be sent with your next reply.</span>
              </div>
              <button
                className="chat-remove-upload"
                type="button"
                onClick={() => {
                  if (imageInputRef.current) imageInputRef.current.value = '';
                  clearPendingChatImage();
                }}
                aria-label="Remove selected chat image"
              >
                <X size={16} strokeWidth={2.2} aria-hidden="true" />
              </button>
            </div>
          ) : null}
          <div className="chat-form-footer">
            <span className="chat-helper-text">Keep it short, specific, and actionable.</span>
            <span className="chat-char-count">{chatInput.length}/600</span>
          </div>
          <button className="primary-btn support-chat-send" type="submit" disabled={!canSendSupportMessage}>
            <span className="send-icon" aria-hidden="true">
              <svg viewBox="0 0 20 20" focusable="false">
                <path d="M3 10.5L17 3.5L12.2 16.5L10 11.9L3 10.5Z" />
              </svg>
            </span>
            <span>{chatSending ? 'Sending...' : 'Send Message'}</span>
          </button>
        </form>
      </article>
    </div>
  );
};

export default SupportChatModal;
