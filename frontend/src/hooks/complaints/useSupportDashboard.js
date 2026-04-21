import { useCallback, useEffect, useState } from 'react';
import { SUPPORT_PAGE_SIZE } from '../../data/complaintData';
import { getComplaintStats, getComplaints } from '../../services/complaintsService';

const emptyPagination = { page: 1, limit: SUPPORT_PAGE_SIZE, total: 0, totalPages: 1 };
const getErrorMessage = (error) => error?.response?.data?.message || 'Failed to load support dashboard data.';

const buildDraftMap = (list) =>
  list.reduce((map, complaint) => {
    map[complaint._id] = {
      status: complaint.status,
      priority: complaint.priority,
      assignedTo: complaint.assignedTo || '',
      supportNotes: complaint.supportNotes || '',
    };
    return map;
  }, {});

const buildParams = (page, filters) => ({
  page,
  limit: SUPPORT_PAGE_SIZE,
  ...(filters.status ? { status: filters.status } : {}),
  ...(filters.priority ? { priority: filters.priority } : {}),
  ...(filters.category ? { category: filters.category } : {}),
  ...(filters.search ? { search: filters.search } : {}),
  ...(filters.newOnly ? { newOnly: 'true' } : {}),
});

export const useSupportDashboard = ({ isSupportRoute, supportFilters, setFeedback }) => {
  const [stats, setStats] = useState({});
  const [complaints, setComplaints] = useState([]);
  const [complaintDrafts, setComplaintDrafts] = useState({});
  const [supportPage, setSupportPage] = useState(1);
  const [pagination, setPagination] = useState(emptyPagination);
  const [supportLoading, setSupportLoading] = useState(false);

  const loadSupportDashboard = useCallback(
    async (page) => {
      setSupportLoading(true);
      try {
        const [statsResponse, listResponse] = await Promise.all([
          getComplaintStats(),
          getComplaints(buildParams(page, supportFilters)),
        ]);
        const list = listResponse.data || [];
        setStats(statsResponse.data || {});
        setComplaints(list);
        setPagination(listResponse.pagination || emptyPagination);
        setComplaintDrafts(buildDraftMap(list));
      } catch (error) {
        setFeedback({ type: 'error', message: getErrorMessage(error) });
      } finally {
        setSupportLoading(false);
      }
    },
    [supportFilters, setFeedback]
  );

  useEffect(() => {
    if (!isSupportRoute) return;
    if (supportPage !== 1) return setSupportPage(1);
    loadSupportDashboard(1);
  }, [isSupportRoute, supportPage, loadSupportDashboard]);

  useEffect(() => {
    if (!isSupportRoute || supportPage === 1) return;
    loadSupportDashboard(supportPage);
  }, [isSupportRoute, supportPage, loadSupportDashboard]);

  return {
    stats,
    complaints,
    complaintDrafts,
    setComplaintDrafts,
    supportLoading,
    supportPage,
    setSupportPage,
    pagination,
    loadSupportDashboard,
  };
};
