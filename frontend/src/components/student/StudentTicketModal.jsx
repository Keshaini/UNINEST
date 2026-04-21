import TicketChatSection from './TicketChatSection';
import TicketInfoSection from './TicketInfoSection';

const StudentTicketModal = ({
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
}) => {
  if (!isTicketModalOpen) {
    return null;
  }

  return (
    <div
      className="ticket-modal-overlay"
      role="presentation"
      onClick={(event) => event.target === event.currentTarget && closeTicketModal()}
    >
      <article className="ticket-modal" role="dialog" aria-modal="true" aria-label="Ticket full details">
        <header className="ticket-modal-header">
          <h3>Ticket Full Details</h3>
          <button className="modal-close-btn" type="button" onClick={closeTicketModal} aria-label="Close ticket details">
            <span className="modal-close-icon" aria-hidden="true">
              <svg viewBox="0 0 20 20" focusable="false">
                <path d="M5 5L15 15" />
                <path d="M15 5L5 15" />
              </svg>
            </span>
            <span className="modal-close-text">Close</span>
          </button>
        </header>

        {ticketModalLoading ? <p className="empty-state modal-message">Loading ticket details...</p> : null}
        {ticketModalError ? <p className="empty-state modal-message">{ticketModalError}</p> : null}
        {!ticketModalLoading && !fullTicket ? <p className="empty-state modal-message">Ticket details unavailable.</p> : null}

        {!ticketModalLoading && fullTicket ? (
          <div className="ticket-modal-body">
            <TicketInfoSection ticket={fullTicket} />
            <TicketChatSection
              sortedMessages={sortedMessages}
              isSocketConnected={isSocketConnected}
              chatInput={chatInput}
              setChatInput={setChatInput}
              chatImagePreview={chatImagePreview}
              chatImageName={chatImageName}
              canSendChatMessage={canSendChatMessage}
              chatSending={chatSending}
              onImageChange={handleChatImageChange}
              onRemoveImage={clearPendingChatImage}
              onSendMessage={handleSendChatMessage}
            />
          </div>
        ) : null}
      </article>
    </div>
  );
};

export default StudentTicketModal;
