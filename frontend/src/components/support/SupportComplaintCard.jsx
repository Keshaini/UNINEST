import { formatDateTime } from '../../common/utils/formatDateTime';
import { PRIORITY_LABEL, STATUS_LABEL } from '../../data/complaintData';

const updateDraft = (setComplaintDrafts, complaintId, draft, key) => (event) =>
  setComplaintDrafts((previous) => ({ ...previous, [complaintId]: { ...draft, [key]: event.target.value } }));

const SupportComplaintCard = ({
  complaint,
  draft,
  setComplaintDrafts,
  statusOptions,
  priorityOptions,
  onSaveComplaint,
  onDeleteComplaint,
  onOpenChat,
}) => (
  <article className="complaint-card support-card">
    <div className="complaint-head">
      <div>
        <h3>{complaint.title}</h3>
        <p className="subtext">
          {complaint.studentName || 'Unknown Student'} ({complaint.studentId}) - Room {complaint.roomNumber || 'N/A'}
        </p>
      </div>
      <div className="chip-row">
        <span className={`chip status-${complaint.status}`}>{STATUS_LABEL[complaint.status] || complaint.status}</span>
        <span className={`chip priority-${complaint.priority}`}>{PRIORITY_LABEL[complaint.priority] || complaint.priority}</span>
      </div>
    </div>

    <p>{complaint.description}</p>

    <div className="split-row support-edit-grid">
      <div className="form-row">
        <label>Status</label>
        <select value={draft.status} onChange={updateDraft(setComplaintDrafts, complaint._id, draft, 'status')}>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABEL[status]}
            </option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <label>Priority</label>
        <select value={draft.priority} onChange={updateDraft(setComplaintDrafts, complaint._id, draft, 'priority')}>
          {priorityOptions.map((priority) => (
            <option key={priority} value={priority}>
              {PRIORITY_LABEL[priority]}
            </option>
          ))}
        </select>
      </div>
    </div>

    <div className="form-row">
      <label>Assigned To</label>
      <input value={draft.assignedTo} onChange={updateDraft(setComplaintDrafts, complaint._id, draft, 'assignedTo')} />
    </div>
    <div className="form-row">
      <label>Support Notes</label>
      <textarea rows={3} value={draft.supportNotes} onChange={updateDraft(setComplaintDrafts, complaint._id, draft, 'supportNotes')} />
    </div>

    <div className="action-row">
      <button className="primary-btn" type="button" onClick={() => onSaveComplaint(complaint._id, draft)}>
        Save Update
      </button>
      <button className="secondary-btn" type="button" onClick={() => onOpenChat(complaint)}>
        Open Chat
      </button>
      <button className="ghost-btn" type="button" onClick={() => onDeleteComplaint(complaint._id)}>
        Delete
      </button>
    </div>

    <div className="meta-grid">
      <span>Created: {formatDateTime(complaint.createdAt)}</span>
      <span>Last update: {formatDateTime(complaint.updatedAt)}</span>
      <span>Resolved at: {formatDateTime(complaint.resolvedAt)}</span>
    </div>
  </article>
);

export default SupportComplaintCard;
