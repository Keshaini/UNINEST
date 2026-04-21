import { useCallback, useEffect, useState } from 'react';
import { getComplaintsByStudent } from '../../services/complaintsService';
import { getStoredStudentId, saveStudentId } from './studentStorage';

const getErrorMessage = (error) => error?.response?.data?.message || 'Failed to load student complaints.';

export const useStudentComplaints = ({ isSupportRoute, setFeedback, setFormData }) => {
  const [currentStudentId, setCurrentStudentId] = useState(getStoredStudentId);
  const [studentComplaints, setStudentComplaints] = useState([]);
  const [loadingStudentComplaints, setLoadingStudentComplaints] = useState(false);
  const [hasAutoLoaded, setHasAutoLoaded] = useState(false);

  const loadStudentComplaints = useCallback(
    async (inputStudentId, options = {}) => {
      const { showSuccess = true, showEmptyIdError = true, silentError = false } = options;
      const studentId = (inputStudentId || currentStudentId || '').trim();
      if (!studentId) {
        if (showEmptyIdError) setFeedback({ type: 'error', message: 'Student ID is required.' });
        return;
      }

      setCurrentStudentId(studentId);
      saveStudentId(studentId);
      setFormData((previous) => ({ ...previous, studentId }));
      setLoadingStudentComplaints(true);
      try {
        const response = await getComplaintsByStudent(studentId);
        setStudentComplaints(response.data || []);
        if (showSuccess) {
          setFeedback({ type: 'success', message: `Loaded ${response.count || 0} complaint(s) for ${studentId}.` });
        }
      } catch (error) {
        if (!silentError) setFeedback({ type: 'error', message: getErrorMessage(error) });
      } finally {
        setLoadingStudentComplaints(false);
      }
    },
    [currentStudentId, setFeedback, setFormData]
  );

  useEffect(() => {
    if (isSupportRoute) return setHasAutoLoaded(false);
    if (hasAutoLoaded) return;
    const savedId = (currentStudentId || getStoredStudentId()).trim();
    if (!savedId) return setHasAutoLoaded(true);
    setHasAutoLoaded(true);
    loadStudentComplaints(savedId, { showSuccess: false, showEmptyIdError: false, silentError: true });
  }, [isSupportRoute, hasAutoLoaded, currentStudentId, loadStudentComplaints]);

  useEffect(() => {
    if (!currentStudentId) return;
    setFormData((previous) => (previous.studentId === currentStudentId ? previous : { ...previous, studentId: currentStudentId }));
  }, [currentStudentId, setFormData]);

  return {
    currentStudentId,
    setCurrentStudentId,
    studentComplaints,
    loadingStudentComplaints,
    loadStudentComplaints,
  };
};
