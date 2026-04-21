import StudentComplaintForm from './StudentComplaintForm';
import './StudentPanel.css';

const StudentPanel = ({
  formData,
  setFormData,
  onSubmit,
  submitting,
  currentStudentId,
  feedback,
}) => {
  return (
    <section className="student-panel student-form-shell panel-grid">
      <StudentComplaintForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        submitting={submitting}
        currentStudentId={currentStudentId}
        feedback={feedback}
      />
    </section>
  );
};

export default StudentPanel;
