import { formatDateTime } from '../../common/utils/formatDateTime';

const TicketChatSection = ({ sortedMessages, chatInput, setChatInput, chatSending, onSendMessage }) => {
  const messageCount = sortedMessages.length;
  const latestMessage = messageCount > 0 ? sortedMessages[messageCount - 1] : null;

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
        <span className="chat-live-badge" aria-label="Live chat is active">
          <span className="chat-live-dot" aria-hidden="true" />
          Live
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
            key={message._id || `${message.senderRole}-${message.sentAt}-${message.message}`}
          >
            <div className="chat-meta">
              <strong>{message.senderName || (message.senderRole === 'student' ? 'Student' : 'Support')}</strong>
              <span>{formatDateTime(message.sentAt)}</span>
            </div>
            <p>{message.message}</p>
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
          required
        />

        <div className="chat-form-footer">
          <span className="chat-helper-text">Keep it short and include actionable details.</span>
          <span className="chat-char-count">{chatInput.length}/600</span>
        </div>

        <button className="primary-btn send-chat-btn" type="submit" disabled={chatSending}>
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
