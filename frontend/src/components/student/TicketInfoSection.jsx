import { formatDateTime } from '../../common/utils/formatDateTime';
import { CATEGORY_LABEL, PRIORITY_LABEL, STATUS_LABEL } from '../../data/complaintData';

const TicketInfoSection = ({ ticket }) => {
  const ticketRef = String(ticket._id || '').slice(-6).toUpperCase() || 'N/A';

  return (
    <section className="ticket-full-info">
      <div className="ticket-info-top">
        <div className="chip-row">
          <span className={`chip status-${ticket.status}`}>{STATUS_LABEL[ticket.status] || ticket.status}</span>
          <span className={`chip priority-${ticket.priority}`}>{PRIORITY_LABEL[ticket.priority] || ticket.priority}</span>
          <span className="chip category">{CATEGORY_LABEL[ticket.category] || ticket.category}</span>
        </div>
        <span className="ticket-ref">#{ticketRef}</span>
      </div>

      <h4>{ticket.title}</h4>
      <p className="ticket-description">{ticket.description}</p>

      <dl className="ticket-full-meta">
        <div className="meta-item">
          <dt>Student</dt>
          <dd>{ticket.studentName || ticket.studentId}</dd>
        </div>
        <div className="meta-item">
          <dt>Room</dt>
          <dd>{ticket.roomNumber || 'N/A'}</dd>
        </div>
        <div className="meta-item">
          <dt>Assigned</dt>
          <dd>{ticket.assignedTo || 'Not assigned'}</dd>
        </div>
        <div className="meta-item">
          <dt>Created</dt>
          <dd>{formatDateTime(ticket.createdAt)}</dd>
        </div>
        <div className="meta-item">
          <dt>Updated</dt>
          <dd>{formatDateTime(ticket.updatedAt)}</dd>
        </div>
        <div className="meta-item">
          <dt>Resolved</dt>
          <dd>{formatDateTime(ticket.resolvedAt)}</dd>
        </div>
      </dl>

      {ticket.supportNotes ? (
        <div className="support-notes">
          <strong>Latest Support Note:</strong> {ticket.supportNotes}
        </div>
      ) : (
        <div className="support-notes muted">
          <strong>Latest Support Note:</strong> No support note yet.
        </div>
      )}
    </section>
  );
};

export default TicketInfoSection;
