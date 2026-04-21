import { formatDateTime } from '../../common/utils/formatDateTime';
import { CATEGORY_LABEL, PRIORITY_LABEL, STATUS_LABEL } from '../../data/complaintData';

const StudentTicketCard = ({ complaint, onOpenTicket }) => (
  <article className={`complaint-card status-${complaint.status}`}>
    <div className="ticket-card-header">
      <div className="chip-row">
        <span className={`chip status-${complaint.status}`}>{STATUS_LABEL[complaint.status] || complaint.status}</span>
        <span className={`chip priority-${complaint.priority}`}>{PRIORITY_LABEL[complaint.priority] || complaint.priority}</span>
        <span className="chip category">{CATEGORY_LABEL[complaint.category] || complaint.category}</span>
      </div>
      <span className="ticket-id">#{String(complaint._id || '').slice(-6).toUpperCase() || 'N/A'}</span>
    </div>

    <h3>{complaint.title}</h3>
    <p>{complaint.description}</p>

    <dl className="meta-grid">
      <div className="meta-item">
        <dt>Created</dt>
        <dd>{formatDateTime(complaint.createdAt)}</dd>
      </div>
      <div className="meta-item">
        <dt>Updated</dt>
        <dd>{formatDateTime(complaint.updatedAt)}</dd>
      </div>
      <div className="meta-item">
        <dt>Assigned</dt>
        <dd>{complaint.assignedTo || 'Not assigned'}</dd>
      </div>
    </dl>

    <div className="ticket-card-actions">
      <button className="ghost-btn" type="button" onClick={() => onOpenTicket(complaint)}>
        View Details
      </button>
    </div>
  </article>
);

export default StudentTicketCard;
