import { useNavigate } from 'react-router-dom';
import StudentTicketCard from './StudentTicketCard';

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
  const totalTickets = studentComplaints.length;
  const openTickets = studentComplaints.filter((ticket) => ticket.status === 'pending' || ticket.status === 'in_progress').length;
  const resolvedTickets = studentComplaints.filter((ticket) => ticket.status === 'resolved').length;

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

      <div className="complaint-list">
        {!currentStudentId ? <p className="empty-state">No student profile found yet.</p> : null}
        {currentStudentId && studentComplaints.length === 0 ? (
          <p className="empty-state">No complaints found for this student.</p>
        ) : null}
        {studentComplaints.map((complaint) => (
          <StudentTicketCard key={complaint._id} complaint={complaint} onOpenTicket={onOpenTicket} />
        ))}
      </div>
    </article>
  );
};

export default StudentTicketsSection;
