import { ImagePlus, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { formatDateTime } from '../../common/utils/formatDateTime';
import { resolveComplaintAssetUrl } from '../../services/complaintsService';

const TicketChatSection = ({
  sortedMessages,
  isSocketConnected,
  chatInput,
  setChatInput,
  chatImagePreview,
  chatImageName,
  canSendChatMessage,
  chatSending,
  onImageChange,
  onRemoveImage,
  onSendMessage,
}) => {
  const imageInputRef = useRef(null);
  const messageCount = sortedMessages.length;
  const latestMessage = messageCount > 0 ? sortedMessages[messageCount - 1] : null;

  useEffect(() => {
    if (!chatImagePreview && imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  }, [chatImagePreview]);

  return (
    <section className="ticket-chat-box">
      <div className="chat-box-head">
        <div>
          <h4>Chat with Support Service</h4>
          <p className="chat-subtitle">
            {latestMessage
              ? `${messageCount} message(s) | Last update ${formatDateTime(latestMessage.sentAt)}`
              : 'No messages yet. Start with a clear update so support can help faster.'}
          </p>
        </div>
        <span
          className="chat-live-badge"
          aria-label={isSocketConnected ? 'Live chat is active' : 'Live chat is reconnecting'}
          title={isSocketConnected ? 'Messages sync live over socket.' : 'Live socket is reconnecting. Messages will use the backup channel.'}
        >
          <span className="chat-live-dot" aria-hidden="true" />
          {isSocketConnected ? 'Live' : 'Backup'}
        </span>
      </div>

      <div className="chat-thread" role="log" aria-live="polite">
        {messageCount === 0 ? (
          <div className="chat-empty-state">
            <strong>No chat messages yet</strong>
            <p>Send a short, specific update with room number and issue status.</p>
          </div>
        ) : null}
        {sortedMessages.map((message) => (
          <article
            className={message.senderRole === 'student' ? 'chat-message student' : 'chat-message support'}
            key={message._id || `${message.senderRole}-${message.sentAt}-${message.message}-${message.imageUrl || ''}`}
          >
            <div className="chat-meta">
              <strong>{message.senderName || (message.senderRole === 'student' ? 'Student' : 'Support')}</strong>
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
          </article>
        ))}
      </div>

      <form className="chat-form" onSubmit={onSendMessage}>
        <label className="chat-input-label" htmlFor="ticket-chat-input">
          Your Message
        </label>
        <textarea
          id="ticket-chat-input"
          rows={3}
          maxLength={600}
          value={chatInput}
          onChange={(event) => setChatInput(event.target.value)}
          placeholder="Type your message to support service..."
        />

        <div className="chat-attachment-row">
          <input
            ref={imageInputRef}
            id="ticket-chat-image"
            className="chat-file-input"
            type="file"
            accept="image/*"
            onChange={onImageChange}
          />
          <label className="chat-upload-btn" htmlFor="ticket-chat-image">
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
              <span>This photo will be sent with your next message.</span>
            </div>
            <button
              className="chat-remove-upload"
              type="button"
              onClick={() => {
                if (imageInputRef.current) imageInputRef.current.value = '';
                onRemoveImage();
              }}
              aria-label="Remove selected chat image"
            >
              <X size={16} strokeWidth={2.2} aria-hidden="true" />
            </button>
          </div>
        ) : null}

        <div className="chat-form-footer">
          <span className="chat-helper-text">Keep it short and include actionable details.</span>
          <span className="chat-char-count">{chatInput.length}/600</span>
        </div>

        <button className="primary-btn send-chat-btn" type="submit" disabled={!canSendChatMessage}>
          <span className="send-chat-icon" aria-hidden="true">
            <svg viewBox="0 0 20 20" focusable="false">
              <path d="M3 10.5L17 3.5L12.2 16.5L10 11.9L3 10.5Z" />
            </svg>
          </span>
          <span>{chatSending ? 'Sending...' : 'Send Message'}</span>
        </button>
      </form>
    </section>
  );
};

export default TicketChatSection;
