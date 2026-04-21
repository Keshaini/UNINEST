import { Navigate, Route, Routes } from 'react-router-dom';
import StudentPage from '../../pages/StudentPage';
import StudentTicketsPage from '../../pages/StudentTicketsPage';
import SupportPage from '../../pages/SupportPage';

const ComplaintRoutes = ({
  formData,
  setFormData,
  onSubmitComplaint,
  submitting,
  feedback,
  currentStudentId,
  studentComplaints,
  loadingStudentComplaints,
  onLoadMyComplaints,
  stats,
  supportFilters,
  setSupportFilters,
  complaints,
  complaintDrafts,
  setComplaintDrafts,
  supportLoading,
  supportPage,
  pagination,
  setSupportPage,
  refreshSupport,
  onSaveComplaint,
  onDeleteComplaint,
}) => {
  const studentPageElement = (
    <StudentPage
      formData={formData}
      setFormData={setFormData}
      onSubmit={onSubmitComplaint}
      submitting={submitting}
      feedback={feedback}
      currentStudentId={currentStudentId}
      studentComplaints={studentComplaints}
      loadingStudentComplaints={loadingStudentComplaints}
      onLoadMyComplaints={onLoadMyComplaints}
    />
  );

  const supportPageElement = (
    <SupportPage
      stats={stats}
      supportFilters={supportFilters}
      setSupportFilters={setSupportFilters}
      complaints={complaints}
      complaintDrafts={complaintDrafts}
      setComplaintDrafts={setComplaintDrafts}
      supportLoading={supportLoading}
      supportPage={supportPage}
      pagination={pagination}
      onPageChange={setSupportPage}
      onRefresh={refreshSupport}
      onSaveComplaint={onSaveComplaint}
      onDeleteComplaint={onDeleteComplaint}
    />
  );

  const studentTicketsPageElement = (
    <StudentTicketsPage
      formData={formData}
      feedback={feedback}
      currentStudentId={currentStudentId}
      studentComplaints={studentComplaints}
      loadingStudentComplaints={loadingStudentComplaints}
      onLoadMyComplaints={onLoadMyComplaints}
    />
  );

  return (
    <Routes>
      <Route index element={<Navigate to="student" replace />} />
      <Route path="student" element={studentPageElement} />
      <Route path="student/tickets" element={studentTicketsPageElement} />
      <Route path="support" element={supportPageElement} />
      <Route path="*" element={<Navigate to="student" replace />} />
    </Routes>
  );
};

export default ComplaintRoutes;
