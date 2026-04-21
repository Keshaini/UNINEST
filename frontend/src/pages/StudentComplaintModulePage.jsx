import ComplaintRoutes from '../components/routes/ComplaintRoutes';
import { useComplaintModule } from '../hooks/useComplaintModule';
import { useLocation } from 'react-router-dom';

const StudentComplaintModulePage = () => {
  const location = useLocation();
  const complaintModule = useComplaintModule(location.pathname.startsWith('/complaints/support'));

  return <ComplaintRoutes {...complaintModule} />;
};

export default StudentComplaintModulePage;
