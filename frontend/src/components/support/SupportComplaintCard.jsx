import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatDateTime } from '../../common/utils/formatDateTime';
import { PRIORITY_LABEL, STATUS_LABEL } from '../../data/complaintData';
import { resolveComplaintAssetUrl } from '../../services/complaintsService';

const updateDraft = (setComplaintDrafts, complaintId, draft, key) => (event) =>
  setComplaintDrafts((previous) => ({ ...previous, [complaintId]: { ...draft, [key]: event.target.value } }));

const SupportComplaintCard = ({
  complaint,
  draft,
  setComplaintDrafts,
  statusOptions,
  priorityOptions,
  isExpanded,
  onToggleExpand,
  onSaveComplaint,
  onDeleteComplaint,
  onOpenChat,
}) => {
  const evidenceImages = Array.isArray(complaint.evidenceImages)
    ? complaint.evidenceImages.filter((item) => item?.url)
    : [];
  const createdAtTimestamp = new Date(complaint.createdAt).getTime();
  const isNewComplaint = Number.isFinite(createdAtTimestamp) && Date.now() - createdAtTimestamp <= 24 * 60 * 60 * 1000;

  return (
    <article className={`complaint-card support-card${isExpanded ? ' expanded' : ' compact'}`}>
    <div className="complaint-head">
      <div>
        <h3>{complaint.title}</h3>
        <p className="subtext">
          {complaint.studentName || 'Unknown Student'} ({complaint.studentId}) - Room {complaint.roomNumber || 'N/A'}
        </p>
      </div>
      <div className="chip-row">
        {isNewComplaint ? <span className="chip new-ticket">New</span> : null}
        <span className={`chip status-${complaint.status}`}>{STATUS_LABEL[complaint.status] || complaint.status}</span>
        <span className={`chip priority-${complaint.priority}`}>{PRIORITY_LABEL[complaint.priority] || complaint.priority}</span>
      </div>
    </div>

    <p className={`support-card-description${isExpanded ? '' : ' compact'}`}>{complaint.description}</p>

    {evidenceImages.length > 0 ? (
      <div className="complaint-evidence-block">
        <p className="complaint-evidence-title">Evidence ({evidenceImages.length})</p>
        <div className="complaint-evidence-grid">
          {evidenceImages.map((image, index) => (
            <a
              className="complaint-evidence-item"
              href={resolveComplaintAssetUrl(image.url)}
              key={`${image.url}-${index}`}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open evidence image ${index + 1}`}
            >
              <img src={resolveComplaintAssetUrl(image.url)} alt={image.name || `Evidence image ${index + 1}`} />
              <span>{image.name || `Evidence ${index + 1}`}</span>
            </a>
          ))}
        </div>
      </div>
    ) : null}

    <div className="support-card-toolbar">
      <button className="secondary-btn" type="button" onClick={() => onOpenChat(complaint)}>
        Open Chat
      </button>
      <button className="ghost-btn support-card-expand" type="button" onClick={onToggleExpand} aria-expanded={isExpanded}>
        <span>{isExpanded ? 'Hide Manage' : 'Manage Ticket'}</span>
        {isExpanded ? <ChevronUp size={16} strokeWidth={2.4} aria-hidden="true" /> : <ChevronDown size={16} strokeWidth={2.4} aria-hidden="true" />}
      </button>
    </div>

    {isExpanded ? (
      <>
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
          <button className="ghost-btn" type="button" onClick={() => onDeleteComplaint(complaint._id)}>
            Delete
          </button>
        </div>
      </>
    ) : null}

      <div className="meta-grid">
        <span>Created: {formatDateTime(complaint.createdAt)}</span>
        <span>Last update: {formatDateTime(complaint.updatedAt)}</span>
        <span>Resolved at: {formatDateTime(complaint.resolvedAt)}</span>
      </div>
  </article>
  );
};

export default SupportComplaintCard;
