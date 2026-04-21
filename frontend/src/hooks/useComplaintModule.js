import { useMemo, useState } from 'react';
import { INITIAL_FORM } from '../data/complaintData';
import { useComplaintActions } from './complaints/useComplaintActions';
import { getStoredStudentIdentity } from './complaints/studentIdentity';
import { useStudentComplaints } from './complaints/useStudentComplaints';
import { useSupportDashboard } from './complaints/useSupportDashboard';
import { getStoredStudentId } from './complaints/studentStorage';

const initialFilters = { status: '', priority: '', category: '', search: '' };

export const useComplaintModule = (isSupportRoute) => {
  const storedIdentity = getStoredStudentIdentity();
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [formData, setFormData] = useState(() => ({
    ...INITIAL_FORM,
    ...storedIdentity,
    studentId: getStoredStudentId() || storedIdentity.studentId,
  }));
  const [supportFilters, setSupportFilters] = useState(initialFilters);

  const student = useStudentComplaints({ isSupportRoute, setFeedback, setFormData });
  const support = useSupportDashboard({ isSupportRoute, supportFilters, setFeedback });
  const actions = useComplaintActions({
    formData,
    setFormData,
    currentStudentId: student.currentStudentId,
    setCurrentStudentId: student.setCurrentStudentId,
    setFeedback,
    isSupportRoute,
    supportPage: support.supportPage,
    identityDefaults: student.studentIdentity,
    loadStudentComplaints: student.loadStudentComplaints,
    loadSupportDashboard: support.loadSupportDashboard,
  });

  const hasFilters = useMemo(
    () => Boolean(supportFilters.status || supportFilters.priority || supportFilters.category || supportFilters.search),
    [supportFilters]
  );

  return {
    feedback,
    hasFilters,
    formData,
    setFormData,
    currentStudentId: student.currentStudentId,
    studentComplaints: student.studentComplaints,
    loadingStudentComplaints: student.loadingStudentComplaints,
    onLoadMyComplaints: () => student.loadStudentComplaints(student.currentStudentId),
    stats: support.stats,
    supportFilters,
    setSupportFilters,
    complaints: support.complaints,
    complaintDrafts: support.complaintDrafts,
    setComplaintDrafts: support.setComplaintDrafts,
    supportLoading: support.supportLoading,
    supportPage: support.supportPage,
    setSupportPage: support.setSupportPage,
    pagination: support.pagination,
    refreshSupport: () => support.loadSupportDashboard(support.supportPage),
    submitting: actions.submitting,
    onSubmitComplaint: actions.onSubmitComplaint,
    onSaveComplaint: actions.onSaveComplaint,
    onDeleteComplaint: actions.onDeleteComplaint,
  };
};
