import { useCallback, useState } from 'react';
import {
  getComplaintFormValidationMessage,
  getNormalizedComplaintForm,
  isComplaintFormComplete,
} from '../../common/utils/complaintFormValidation';
import { INITIAL_FORM } from '../../data/complaintData';
import { createComplaint, deleteComplaint, updateComplaint } from '../../services/complaintsService';

const getErrorMessage = (error, fallback) => error?.response?.data?.message || fallback;

export const useComplaintActions = ({
  formData,
  setFormData,
  currentStudentId,
  setCurrentStudentId,
  setFeedback,
  isSupportRoute,
  supportPage,
  identityDefaults,
  loadStudentComplaints,
  loadSupportDashboard,
}) => {
  const [submitting, setSubmitting] = useState(false);

  const onSubmitComplaint = useCallback(
    async (event) => {
      event.preventDefault();
      setSubmitting(true);
      try {
        const normalizedForm = getNormalizedComplaintForm(formData);
        if (!isComplaintFormComplete(normalizedForm)) {
          return setFeedback({ type: 'error', message: getComplaintFormValidationMessage(normalizedForm) });
        }

        const submittedStudentId = normalizedForm.studentId;
        if (!submittedStudentId) return setFeedback({ type: 'error', message: 'Student ID is required.' });
        if (currentStudentId && submittedStudentId !== currentStudentId) {
          return setFeedback({ type: 'error', message: 'You can only submit tickets for your own account.' });
        }

        await createComplaint(normalizedForm);
        setCurrentStudentId(submittedStudentId);
        setFormData({
          ...INITIAL_FORM,
          ...identityDefaults,
          studentId: submittedStudentId || identityDefaults?.studentId || '',
        });
        setFeedback({ type: 'success', message: 'Complaint submitted successfully.' });
        await loadStudentComplaints(submittedStudentId, { showSuccess: false, showEmptyIdError: false, silentError: true });
        if (isSupportRoute) await loadSupportDashboard(supportPage);
      } catch (error) {
        setFeedback({ type: 'error', message: getErrorMessage(error, 'Failed to submit complaint.') });
      } finally {
        setSubmitting(false);
      }
    },
    [
      formData,
      currentStudentId,
      setCurrentStudentId,
      setFormData,
      setFeedback,
      isSupportRoute,
      supportPage,
      identityDefaults,
      loadStudentComplaints,
      loadSupportDashboard,
    ]
  );

  const onSaveComplaint = useCallback(
    async (complaintId, draft) => {
      try {
        await updateComplaint(complaintId, draft);
        setFeedback({ type: 'success', message: 'Complaint updated successfully.' });
        await loadSupportDashboard(supportPage);
      } catch (error) {
        setFeedback({ type: 'error', message: getErrorMessage(error, 'Failed to update complaint.') });
      }
    },
    [setFeedback, loadSupportDashboard, supportPage]
  );

  const onDeleteComplaint = useCallback(
    async (complaintId) => {
      if (!window.confirm('Delete this complaint? This action cannot be undone.')) return;
      try {
        await deleteComplaint(complaintId);
        setFeedback({ type: 'success', message: 'Complaint deleted successfully.' });
        await loadSupportDashboard(supportPage);
      } catch (error) {
        setFeedback({ type: 'error', message: getErrorMessage(error, 'Failed to delete complaint.') });
      }
    },
    [setFeedback, loadSupportDashboard, supportPage]
  );

  return { submitting, onSubmitComplaint, onSaveComplaint, onDeleteComplaint };
};
