import SupportComplaintCard from './SupportComplaintCard';

const defaultDraft = (complaint) => ({
  status: complaint.status,
  priority: complaint.priority,
  assignedTo: complaint.assignedTo || '',
  supportNotes: complaint.supportNotes || '',
});

const SupportComplaintList = ({
  complaints,
  complaintDrafts,
  setComplaintDrafts,
  statusOptions,
  priorityOptions,
  onSaveComplaint,
  onDeleteComplaint,
  onOpenChat,
}) => (
  <div className="complaint-list">
    {complaints.length === 0 ? <p className="empty-state">No complaints match the current filters.</p> : null}
    {complaints.map((complaint) => (
      <SupportComplaintCard
        key={complaint._id}
        complaint={complaint}
        draft={complaintDrafts[complaint._id] || defaultDraft(complaint)}
        setComplaintDrafts={setComplaintDrafts}
        statusOptions={statusOptions}
        priorityOptions={priorityOptions}
        onSaveComplaint={onSaveComplaint}
        onDeleteComplaint={onDeleteComplaint}
        onOpenChat={onOpenChat}
      />
    ))}
  </div>
);

export default SupportComplaintList;
