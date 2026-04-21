import { Headset, ImagePlus, LayoutGrid, MessageSquareText, ShieldCheck, UserRound, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORY_LABEL, CATEGORY_OPTIONS, PRIORITY_LABEL, PRIORITY_OPTIONS } from '../../data/complaintData';
import { isComplaintFormComplete } from '../../common/utils/complaintFormValidation';

const updateField = (setter, key) => (event) => setter((previous) => ({ ...previous, [key]: event.target.value }));
const DESCRIPTION_MIN_LENGTH = 10;
const MAX_EVIDENCE_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_EVIDENCE_IMAGE_COUNT = 4;
const ALLOWED_EVIDENCE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const PRIORITY_HELP_TEXT = {
  low: 'Can wait.',
  medium: 'Handle soon.',
  high: 'Major impact.',
  urgent: 'Immediate risk.',
};

const formatFileSize = (sizeInBytes = 0) => {
  if (sizeInBytes >= 1024 * 1024) return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  if (sizeInBytes >= 1024) return `${Math.round(sizeInBytes / 1024)} KB`;
  return `${sizeInBytes} B`;
};

const StudentComplaintForm = ({ formData, setFormData, onSubmit, submitting, currentStudentId, feedback }) => {
  const navigate = useNavigate();
  const evidenceInputRef = useRef(null);
  const previousEvidenceRef = useRef([]);
  const [evidenceError, setEvidenceError] = useState('');
  const hasFeedback = Boolean(feedback?.message);
  const feedbackType = feedback?.type === 'error' ? 'error' : 'success';
  const isFormComplete = isComplaintFormComplete(formData);
  const isStudentNameLocked = Boolean(currentStudentId && formData.studentName);
  const descriptionLength = formData.description.trim().length;
  const evidenceImages = Array.isArray(formData.evidenceImages) ? formData.evidenceImages : [];
  const evidenceCount = evidenceImages.length;
  const isEvidenceLimitReached = evidenceCount >= MAX_EVIDENCE_IMAGE_COUNT;
  const hasDescription = descriptionLength > 0;
  const hasDescriptionError = hasDescription && descriptionLength < DESCRIPTION_MIN_LENGTH;
  const canSubmit = isFormComplete && !hasDescriptionError && !submitting;
  const submitStatusTone = !isFormComplete || hasDescriptionError ? 'warning' : 'ready';
  const submitStatusMessage = !isFormComplete
    ? 'Fill all fields to enable ticket submission.'
      : hasDescriptionError
        ? `Description needs at least ${DESCRIPTION_MIN_LENGTH} characters.`
        : 'Looks good. Your ticket will appear in My Tickets right after submission.';

  useEffect(() => {
    const previousEvidence = previousEvidenceRef.current;
    const currentEvidenceIds = new Set(evidenceImages.map((item) => item.id));

    previousEvidence
      .filter((item) => !currentEvidenceIds.has(item.id))
      .forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });

    previousEvidenceRef.current = evidenceImages;
  }, [evidenceImages]);

  useEffect(
    () => () => {
      previousEvidenceRef.current.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    },
    []
  );

  const handleEvidenceChange = (event) => {
    const pickedFiles = Array.from(event.target.files || []);
    if (pickedFiles.length === 0) return;

    const availableSlots = Math.max(0, MAX_EVIDENCE_IMAGE_COUNT - evidenceCount);
    const acceptedItems = [];
    const rejectedReasons = [];

    pickedFiles.slice(0, availableSlots).forEach((file) => {
      if (!ALLOWED_EVIDENCE_TYPES.has(file.type)) {
        rejectedReasons.push(`${file.name}: unsupported file type.`);
        return;
      }

      if (file.size > MAX_EVIDENCE_IMAGE_SIZE) {
        rejectedReasons.push(`${file.name}: exceeds 5MB.`);
        return;
      }

      acceptedItems.push({
        id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
        file,
        name: file.name,
        size: file.size,
        previewUrl: URL.createObjectURL(file),
      });
    });

    if (pickedFiles.length > availableSlots) {
      rejectedReasons.push(`Only ${MAX_EVIDENCE_IMAGE_COUNT} evidence images are allowed.`);
    }

    if (acceptedItems.length > 0) {
      setFormData((previous) => ({
        ...previous,
        evidenceImages: [...(Array.isArray(previous.evidenceImages) ? previous.evidenceImages : []), ...acceptedItems],
      }));
    }

    setEvidenceError(rejectedReasons.join(' '));
    event.target.value = '';
  };

  const removeEvidenceImage = (imageId) => {
    setFormData((previous) => ({
      ...previous,
      evidenceImages: (Array.isArray(previous.evidenceImages) ? previous.evidenceImages : []).filter((item) => item.id !== imageId),
    }));
    setEvidenceError('');
  };

  const handleSubmit = (event) => {
    if (!canSubmit) {
      event.preventDefault();
      return;
    }

    onSubmit(event);
  };

  return (
    <article className="panel form-panel reveal">
      <header className="panel-header form-hero">
        <div className="form-hero-copy">
          <span className="form-eyebrow">Student Support Desk</span>
          <h2>Chat to our team</h2>
          <p>Report room, facilities, or safety issues and UniNest support will follow up quickly.</p>
          <div className="form-hero-tags" aria-label="Support highlights">
            <span className="hero-tag">
              <ShieldCheck size={15} strokeWidth={2.2} aria-hidden="true" />
              Verified profile
            </span>
            <span className="hero-tag">
              <Headset size={15} strokeWidth={2.2} aria-hidden="true" />
              Fast hostel follow-up
            </span>
          </div>
        </div>

        <aside className="form-hero-side" aria-label="Ticket summary">
          <span className="hero-side-label">Current selection</span>
          <strong className="hero-side-value">{PRIORITY_LABEL[formData.priority]}</strong>
          <p className="hero-side-copy">{PRIORITY_HELP_TEXT[formData.priority]}</p>
          <div className="hero-side-meta">
            <span>{CATEGORY_LABEL[formData.category]}</span>
            <span>{currentStudentId ? 'Synced account' : 'Manual profile'}</span>
          </div>
        </aside>
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
        <div className="form-stack">
          <section className="form-section">
            <div className="section-heading">
              <span className="section-icon" aria-hidden="true">
                <UserRound size={18} strokeWidth={2.2} />
              </span>
              <div className="section-copy">
                <span className="section-kicker">Profile</span>
                <h3>Student details</h3>
                <p>We use these details to connect your request with the right hostel team.</p>
              </div>
            </div>

            <div className="section-grid section-grid-profile">
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
            </div>
          </section>

          <section className="form-section">
            <div className="section-heading">
              <span className="section-icon" aria-hidden="true">
                <MessageSquareText size={18} strokeWidth={2.2} />
              </span>
              <div className="section-copy">
                <span className="section-kicker">Issue</span>
                <h3>What happened?</h3>
                <p>Clear details help support respond faster and route the ticket correctly.</p>
              </div>
            </div>

            <div className="section-grid section-grid-issue">
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

              <div className={`form-row form-row-description${hasDescriptionError ? ' has-error' : ''}`}>
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={updateField(setFormData, 'description')}
                  placeholder="Add complete details to help support resolve quickly."
                  minLength={DESCRIPTION_MIN_LENGTH}
                  aria-invalid={hasDescriptionError}
                  required
                />
                <div className="field-meta">
                  <span className={`field-validation-note${hasDescriptionError ? ' error' : ''}`}>
                    {hasDescriptionError
                      ? `Description must be at least ${DESCRIPTION_MIN_LENGTH} characters.`
                      : `Minimum ${DESCRIPTION_MIN_LENGTH} characters.`}
                  </span>
                  <span className={`field-counter${hasDescriptionError ? ' error' : ''}`}>{descriptionLength} chars</span>
                </div>
              </div>

              <div className="form-row form-row-evidence">
                <label htmlFor="complaint-evidence-images">Evidence Photos (Optional)</label>
                <input
                  ref={evidenceInputRef}
                  id="complaint-evidence-images"
                  className="evidence-file-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  onChange={handleEvidenceChange}
                  disabled={isEvidenceLimitReached}
                />
                <button
                  className="evidence-upload-btn"
                  type="button"
                  onClick={() => evidenceInputRef.current?.click()}
                  disabled={isEvidenceLimitReached}
                >
                  <ImagePlus size={16} strokeWidth={2.2} aria-hidden="true" />
                  <span>{isEvidenceLimitReached ? 'Evidence Limit Reached' : 'Add Evidence Photos'}</span>
                </button>
                <div className="evidence-meta-row">
                  <span className="evidence-limit-note">
                    {evidenceCount}/{MAX_EVIDENCE_IMAGE_COUNT} selected • JPG, PNG, WEBP, GIF • Max 5MB each
                  </span>
                  {evidenceError ? <span className="field-validation-note error">{evidenceError}</span> : null}
                </div>
                {evidenceImages.length > 0 ? (
                  <div className="evidence-preview-grid">
                    {evidenceImages.map((image, index) => (
                      <article className="evidence-preview-card" key={image.id || `${image.name}-${index}`}>
                        <img src={image.previewUrl} alt={image.name || `Evidence ${index + 1}`} />
                        <div className="evidence-preview-copy">
                          <strong>{image.name || `Evidence ${index + 1}`}</strong>
                          <span>{formatFileSize(image.size)}</span>
                        </div>
                        <button
                          className="evidence-remove-btn"
                          type="button"
                          onClick={() => removeEvidenceImage(image.id)}
                          aria-label={`Remove ${image.name || `evidence ${index + 1}`}`}
                        >
                          <X size={15} strokeWidth={2.2} aria-hidden="true" />
                        </button>
                      </article>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="form-section priority-section">
            <div className="section-heading">
              <span className="section-icon" aria-hidden="true">
                <LayoutGrid size={18} strokeWidth={2.2} />
              </span>
              <div className="section-copy">
                <span className="section-kicker">Priority</span>
                <h3>Choose the urgency</h3>
                <p>Set the level that best matches the impact of this issue.</p>
              </div>
            </div>

            <fieldset className="priority-options">
              <legend className="priority-legend">Priority level</legend>
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
          </section>
        </div>

        <div className={`form-submit-bar ${submitStatusTone}`}>
          <div className="submit-status">
            <span className="submit-status-label">Submission status</span>
            <p className="submit-status-message">{submitStatusMessage}</p>
          </div>

          <div className="form-actions">
            <button className="primary-btn" type="submit" disabled={!canSubmit}>
              {submitting ? 'Submitting...' : 'Get in touch'}
            </button>
            <button className="ghost-btn" type="button" onClick={() => navigate('/complaints/student/tickets')}>
              Open My Tickets
            </button>
          </div>
        </div>
      </form>
    </article>
  );
};

export default StudentComplaintForm;
