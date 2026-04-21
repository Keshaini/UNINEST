import StudentTicketModal from '../components/student/StudentTicketModal';
import StudentTicketsSection from '../components/student/StudentTicketsSection';
import { useTicketModal } from '../components/student/hooks/useTicketModal';
import '../components/student/StudentPanel.css';

const StudentTicketsPage = ({
  currentStudentId,
  studentComplaints,
  loadingStudentComplaints,
  onLoadMyComplaints,
  formData,
  feedback,
}) => {
  const modal = useTicketModal({
    currentStudentId,
    onLoadMyComplaints,
    fallbackStudentName: formData.studentName,
  });

  return (
    <section className="student-panel student-tickets-shell panel-grid">
      <StudentTicketsSection
        currentStudentId={currentStudentId}
        studentComplaints={studentComplaints}
        loadingStudentComplaints={loadingStudentComplaints}
        onLoadMyComplaints={onLoadMyComplaints}
        onOpenTicket={modal.openTicketModal}
        feedback={feedback}
        showOpenButton={false}
      />
      <StudentTicketModal {...modal} />
    </section>
  );
};

export default StudentTicketsPage;
