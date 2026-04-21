import { useEffect, useState } from 'react';
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
}) => {
  const [expandedComplaintId, setExpandedComplaintId] = useState('');

  useEffect(() => {
    if (!expandedComplaintId) return;
    const exists = complaints.some((complaint) => complaint._id === expandedComplaintId);
    if (!exists) setExpandedComplaintId('');
  }, [complaints, expandedComplaintId]);

  return (
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
          isExpanded={expandedComplaintId === complaint._id}
          onToggleExpand={() =>
            setExpandedComplaintId((previous) => (previous === complaint._id ? '' : complaint._id))
          }
          onSaveComplaint={onSaveComplaint}
          onDeleteComplaint={onDeleteComplaint}
          onOpenChat={onOpenChat}
        />
      ))}
    </div>
  );
};

export default SupportComplaintList;
