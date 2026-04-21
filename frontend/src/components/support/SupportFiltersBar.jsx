import { STATUS_LABEL } from '../../data/complaintData';

const setFilterValue = (setSupportFilters, key) => (event) =>
  setSupportFilters((previous) => ({ ...previous, [key]: event.target.value }));

const selectTimelineFilter = (setSupportFilters, key) => () =>
  setSupportFilters((previous) => {
    if (key === 'all') return { ...previous, status: '', newOnly: false };
    if (key === 'new') return { ...previous, status: '', newOnly: true };
    return { ...previous, status: key, newOnly: false };
  });

const SupportFiltersBar = ({
  stats,
  supportFilters,
  setSupportFilters,
  statusOptions,
  supportLoading,
  onRefresh,
}) => {
  const activeTimeline = supportFilters.newOnly ? 'new' : supportFilters.status || 'all';
  const timelineItems = [
    { key: 'all', label: 'All', count: stats?.totalComplaints ?? 0 },
    { key: 'new', label: 'New', count: stats?.newComplaints ?? 0 },
    ...statusOptions.map((status) => ({
      key: status,
      label: STATUS_LABEL[status],
      count: stats?.byStatus?.[status] ?? 0,
    })),
  ];

  return (
    <>
      <div className="status-timeline" role="tablist" aria-label="Ticket timeline filters">
        {timelineItems.map((item) => (
          <button
            key={item.key}
            className={`status-timeline-tab${activeTimeline === item.key ? ' active' : ''}`}
            type="button"
            role="tab"
            aria-selected={activeTimeline === item.key}
            onClick={selectTimelineFilter(setSupportFilters, item.key)}
          >
            <span>{item.label}</span>
            <span className="timeline-count">{item.count}</span>
          </button>
        ))}
      </div>

      <div className="filters-grid">
        <input
          placeholder="Search title, description, student, room"
          value={supportFilters.search}
          onChange={setFilterValue(setSupportFilters, 'search')}
        />
        <button className="secondary-btn" type="button" onClick={onRefresh} disabled={supportLoading}>
          {supportLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </>
  );
};

SupportFiltersBar.defaultProps = {
  stats: {},
};

export default SupportFiltersBar;
