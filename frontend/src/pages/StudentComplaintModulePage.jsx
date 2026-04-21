import StudentNavbar from '../components/studentDashboard/StudentNavbar';
import ComplaintRoutes from '../components/routes/ComplaintRoutes';
import { useComplaintModule } from '../hooks/useComplaintModule';
import { useLocation } from 'react-router-dom';

const readStoredStudentProfile = () => {
  if (typeof window === 'undefined') return null;

  const rawUser = window.localStorage.getItem('user');
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
};

const StudentComplaintModulePage = () => {
  const location = useLocation();
  const complaintModule = useComplaintModule(location.pathname.startsWith('/complaints/support'));
  const profile = readStoredStudentProfile();

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0c10] text-slate-300">
      <StudentNavbar profile={profile} />
      <div className="flex-1 min-h-0">
        <ComplaintRoutes {...complaintModule} />
      </div>
    </div>
  );
};

export default StudentComplaintModulePage;
