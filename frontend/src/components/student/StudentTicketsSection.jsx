import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { STATUS_LABEL, STATUS_OPTIONS } from '../../data/complaintData';
import StudentTicketCard from './StudentTicketCard';

const OPEN_TICKET_STATUSES = ['pending', 'in_progress'];

const StudentTicketsSection = ({
  currentStudentId,
  studentComplaints,
  loadingStudentComplaints,
  onLoadMyComplaints,
  onOpenTicket,
  feedback,
  showOpenButton = true,
}) => {
  const navigate = useNavigate();
  const [activeTicketTab, setActiveTicketTab] = useState('');
  const [hasManualTabSelection, setHasManualTabSelection] = useState(false);
  const totalTickets = studentComplaints.length;
  const openTickets = studentComplaints.filter((ticket) => OPEN_TICKET_STATUSES.includes(ticket.status?.toLowerCase?.() || '')).length;
  const resolvedTickets = studentComplaints.filter((ticket) => (ticket.status?.toLowerCase?.() || '') === 'resolved').length;
  const tabOptions = STATUS_OPTIONS.map((status) => ({
    id: status,
    label: STATUS_LABEL[status] || status,
    count: studentComplaints.filter((ticket) => (ticket.status?.toLowerCase?.() || '') === status).length,
  }));
  const firstAvailableTab = tabOptions.find((tab) => tab.count > 0)?.id || STATUS_OPTIONS[0];
  const selectedTicketTab = activeTicketTab || firstAvailableTab;
  const filteredComplaints = studentComplaints.filter((ticket) => {
    const status = ticket.status?.toLowerCase?.() || '';
    return status === selectedTicketTab;
  });
  const activeStatusLabel = STATUS_LABEL[selectedTicketTab]?.toLowerCase() || selectedTicketTab;
  const emptyStateMessage = totalTickets === 0 ? 'No complaints found for this student.' : `No ${activeStatusLabel} tickets found for this student.`;

  useEffect(() => {
    setActiveTicketTab('');
    setHasManualTabSelection(false);
  }, [currentStudentId]);

  useEffect(() => {
    if (!currentStudentId || hasManualTabSelection) return;
    setActiveTicketTab(firstAvailableTab);
  }, [currentStudentId, firstAvailableTab, hasManualTabSelection]);

  return (
    <article className="panel tickets-panel reveal delay">
      <header className="panel-header">
        <div className="tickets-header-row">
          <div className="tickets-header-copy">
            <h2>My Tickets</h2>
            <p>
              {currentStudentId
                ? `Showing tickets only for student ID: ${currentStudentId}`
                : 'Submit your first complaint to activate your My Tickets dashboard.'}
            </p>
          </div>
          <button className="back-btn" type="button" onClick={() => navigate('/complaints/student')} aria-label="Back to complaint form">
            <span className="back-btn-icon" aria-hidden="true">
              <svg viewBox="0 0 20 20" focusable="false">
                <path d="M12.5 4.5L7 10l5.5 5.5" />
              </svg>
            </span>
            <span className="back-btn-text">Back to Form</span>
          </button>
        </div>
      </header>

      {currentStudentId ? (
        <div className="ticket-summary" aria-label="Ticket summary">
          <div className="summary-item">
            <span className="summary-label">Total</span>
            <strong className="summary-value">{totalTickets}</strong>
          </div>
          <div className="summary-item">
            <span className="summary-label">Open</span>
            <strong className="summary-value">{openTickets}</strong>
          </div>
          <div className="summary-item">
            <span className="summary-label">Resolved</span>
            <strong className="summary-value">{resolvedTickets}</strong>
          </div>
        </div>
      ) : null}

      {feedback?.message ? (
        <div
          className={`inline-feedback ${feedback.type === 'error' ? 'error' : 'success'}`}
          role={feedback.type === 'error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          {feedback.message}
        </div>
      ) : null}

      {currentStudentId ? (
        <div className="my-ticket-toolbar">
          <button className="secondary-btn" type="button" onClick={onLoadMyComplaints} disabled={loadingStudentComplaints}>
            {loadingStudentComplaints ? 'Loading...' : 'Refresh My Tickets'}
          </button>
          <span className="toolbar-hint">Select a ticket to view full conversation and updates.</span>
          {showOpenButton ? (
            <button className="ghost-btn" type="button" onClick={() => navigate('/complaints/student/tickets')}>
              Open My Tickets
            </button>
          ) : null}
        </div>
      ) : null}

      {currentStudentId && studentComplaints.length > 0 ? (
        <div className="ticket-filter-tabs" role="tablist" aria-label="Filter tickets by status">
          {tabOptions.map((tab) => (
            <button
              key={tab.id}
              className={`ticket-filter-tab ${selectedTicketTab === tab.id ? 'active' : ''}`}
              type="button"
              role="tab"
              aria-selected={selectedTicketTab === tab.id}
              onClick={() => {
                setActiveTicketTab(tab.id);
                setHasManualTabSelection(true);
              }}
            >
              <span>{tab.label}</span>
              <span className="ticket-filter-count">{tab.count}</span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="complaint-list">
        {!currentStudentId ? <p className="empty-state">No student profile found yet.</p> : null}
        {currentStudentId && filteredComplaints.length === 0 ? (
          <p className="empty-state">{emptyStateMessage}</p>
        ) : null}
        {filteredComplaints.map((complaint) => (
          <StudentTicketCard key={complaint._id} complaint={complaint} onOpenTicket={onOpenTicket} />
        ))}
      </div>
    </article>
  );
};

export default StudentTicketsSection;
