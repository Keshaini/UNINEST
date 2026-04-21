import { useNavigate } from 'react-router-dom';
import { CATEGORY_LABEL, CATEGORY_OPTIONS, PRIORITY_LABEL, PRIORITY_OPTIONS } from '../../data/complaintData';
import { isComplaintFormComplete } from '../../common/utils/complaintFormValidation';

const updateField = (setter, key) => (event) => setter((previous) => ({ ...previous, [key]: event.target.value }));
const DESCRIPTION_MIN_LENGTH = 10;
const PRIORITY_HELP_TEXT = {
  low: 'Can wait.',
  medium: 'Handle soon.',
  high: 'Major impact.',
  urgent: 'Immediate risk.',
};

const StudentComplaintForm = ({ formData, setFormData, onSubmit, submitting, currentStudentId, feedback }) => {
  const navigate = useNavigate();
  const hasFeedback = Boolean(feedback?.message);
  const feedbackType = feedback?.type === 'error' ? 'error' : 'success';
  const isFormComplete = isComplaintFormComplete(formData);
  const isStudentNameLocked = Boolean(currentStudentId && formData.studentName);
  const descriptionLength = formData.description.trim().length;
  const hasDescription = descriptionLength > 0;
  const hasDescriptionError = hasDescription && descriptionLength < DESCRIPTION_MIN_LENGTH;
  const canSubmit = isFormComplete && !hasDescriptionError && !submitting;

  const handleSubmit = (event) => {
    if (!canSubmit) {
      event.preventDefault();
      return;
    }

    onSubmit(event);
  };

  return (
    <article className="panel form-panel reveal">
      <header className="panel-header">
        <h2>Chat to our team</h2>
        <p>Report room, facilities, or safety issues and UniNest support will follow up quickly.</p>
      </header>

      {hasFeedback ? (
        <div
          className={`inline-feedback ${feedbackType}`}
          role={feedbackType === 'error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          {feedback.message}
        </div>
      ) : null}

      <form className="complaint-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-row">
            <label htmlFor="studentId">Student ID</label>
            <input
              id="studentId"
              value={formData.studentId}
              onChange={updateField(setFormData, 'studentId')}
              placeholder="ex: STU-001"
              required
              disabled={Boolean(currentStudentId)}
            />
            {currentStudentId ? <span className="lock-note">Student ID is locked to your account.</span> : null}
          </div>

          <div className="form-row">
            <label htmlFor="studentName">Student Name</label>
            <input
              id="studentName"
              value={formData.studentName}
              onChange={updateField(setFormData, 'studentName')}
              placeholder="Your full name"
              required
              disabled={isStudentNameLocked}
            />
            {isStudentNameLocked ? <span className="lock-note">Student name is synced to your account.</span> : null}
          </div>

          <div className="form-row">
            <label htmlFor="roomNumber">Room Number</label>
            <input
              id="roomNumber"
              value={formData.roomNumber}
              onChange={updateField(setFormData, 'roomNumber')}
              placeholder="Room / Floor"
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="title">Issue Title</label>
            <input
              id="title"
              value={formData.title}
              onChange={updateField(setFormData, 'title')}
              placeholder="Short title for the issue"
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="category">Category</label>
            <select id="category" value={formData.category} onChange={updateField(setFormData, 'category')} required>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {CATEGORY_LABEL[category]}
                </option>
              ))}
            </select>
          </div>

          <div className={`form-row wide-field${hasDescriptionError ? ' has-error' : ''}`}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={updateField(setFormData, 'description')}
              placeholder="Add complete details to help support resolve quickly."
              minLength={DESCRIPTION_MIN_LENGTH}
              aria-invalid={hasDescriptionError}
              required
            />
            <span className={`field-validation-note${hasDescriptionError ? ' error' : ''}`}>
              {hasDescriptionError
                ? `Description must be at least ${DESCRIPTION_MIN_LENGTH} characters.`
                : `Minimum ${DESCRIPTION_MIN_LENGTH} characters.`}
            </span>
          </div>

          <fieldset className="priority-options wide-field">
            <legend>Priority level</legend>
            <div className="priority-grid">
              {PRIORITY_OPTIONS.map((priority) => (
                <label key={priority} className={`priority-card${formData.priority === priority ? ' active' : ''}`}>
                  <input
                    type="radio"
                    name="priority"
                    value={priority}
                    checked={formData.priority === priority}
                    onChange={updateField(setFormData, 'priority')}
                  />
                  <span className="priority-title">{PRIORITY_LABEL[priority]}</span>
                  <span className="priority-copy">{PRIORITY_HELP_TEXT[priority]}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="form-actions">
          {!isFormComplete ? <p className="form-validation-note">Fill all fields to enable ticket submission.</p> : null}
          {isFormComplete && hasDescriptionError ? (
            <p className="form-validation-note">Description needs at least 10 characters.</p>
          ) : null}
          <button className="primary-btn" type="submit" disabled={!canSubmit}>
            {submitting ? 'Submitting...' : 'Get in touch'}
          </button>
          <button className="ghost-btn" type="button" onClick={() => navigate('/complaints/student/tickets')}>
            Open My Tickets
          </button>
        </div>
      </form>
    </article>
  );
};

export default StudentComplaintForm;
