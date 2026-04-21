import {
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
} from '../../data/complaintData';
import SupportComplaintList from './SupportComplaintList';
import SupportChatModal from './SupportChatModal';
import SupportFiltersBar from './SupportFiltersBar';
import SupportPagination from './SupportPagination';
import SupportStatsGrid from './SupportStatsGrid';
import { useSupportTicketChat } from './hooks/useSupportTicketChat';
import './SupportPanel.css';

const SupportPanel = ({
  stats,
  supportFilters,
  setSupportFilters,
  complaints,
  complaintDrafts,
  setComplaintDrafts,
  supportLoading,
  supportPage,
  pagination,
  onPageChange,
  onRefresh,
  onSaveComplaint,
  onDeleteComplaint,
}) => {
  const chat = useSupportTicketChat({ onAfterMessage: onRefresh });

  return (
    <section className="support-panel support-layout">
      <SupportStatsGrid stats={stats} />
      <article className="panel reveal delay">
        <header className="panel-header">
          <h2>Support Console</h2>
          <p>Filter, assign, and resolve complaints in one place.</p>
        </header>
        <SupportFiltersBar
          stats={stats}
          supportFilters={supportFilters}
          setSupportFilters={setSupportFilters}
          statusOptions={STATUS_OPTIONS}
          supportLoading={supportLoading}
          onRefresh={onRefresh}
        />
        <SupportComplaintList
          complaints={complaints}
          complaintDrafts={complaintDrafts}
          setComplaintDrafts={setComplaintDrafts}
          statusOptions={STATUS_OPTIONS}
          priorityOptions={PRIORITY_OPTIONS}
          onSaveComplaint={onSaveComplaint}
          onDeleteComplaint={onDeleteComplaint}
          onOpenChat={chat.openChat}
        />
        <SupportPagination supportPage={supportPage} pagination={pagination} supportLoading={supportLoading} onPageChange={onPageChange} />
      </article>
      <SupportChatModal {...chat} onClose={chat.closeChat} onSendMessage={chat.sendSupportMessage} />
    </section>
  );
};

export default SupportPanel;
