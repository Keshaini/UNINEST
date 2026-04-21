import SupportPage from '../SupportPage';
import { useComplaintModule } from '../../hooks/useComplaintModule';

function SupportService() {
  const complaintModule = useComplaintModule(true);

  return (
    <SupportPage
      stats={complaintModule.stats}
      supportFilters={complaintModule.supportFilters}
      setSupportFilters={complaintModule.setSupportFilters}
      complaints={complaintModule.complaints}
      complaintDrafts={complaintModule.complaintDrafts}
      setComplaintDrafts={complaintModule.setComplaintDrafts}
      supportLoading={complaintModule.supportLoading}
      supportPage={complaintModule.supportPage}
      pagination={complaintModule.pagination}
      onPageChange={complaintModule.setSupportPage}
      onRefresh={complaintModule.refreshSupport}
      onSaveComplaint={complaintModule.onSaveComplaint}
      onDeleteComplaint={complaintModule.onDeleteComplaint}
    />
  );
}

export default SupportService;
