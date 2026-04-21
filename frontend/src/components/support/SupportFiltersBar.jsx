import { CATEGORY_LABEL, PRIORITY_LABEL, STATUS_LABEL } from '../../data/complaintData';

const setFilterValue = (setSupportFilters, key) => (event) =>
  setSupportFilters((previous) => ({ ...previous, [key]: event.target.value }));

const SupportFiltersBar = ({
  supportFilters,
  setSupportFilters,
  statusOptions,
  priorityOptions,
  categoryOptions,
  supportLoading,
  onRefresh,
}) => (
  <div className="filters-grid">
    <input
      placeholder="Search title, description, student, room"
      value={supportFilters.search}
      onChange={setFilterValue(setSupportFilters, 'search')}
    />
    <select value={supportFilters.status} onChange={setFilterValue(setSupportFilters, 'status')}>
      <option value="">All Statuses</option>
      {statusOptions.map((status) => (
        <option key={status} value={status}>
          {STATUS_LABEL[status]}
        </option>
      ))}
    </select>
    <select value={supportFilters.priority} onChange={setFilterValue(setSupportFilters, 'priority')}>
      <option value="">All Priorities</option>
      {priorityOptions.map((priority) => (
        <option key={priority} value={priority}>
          {PRIORITY_LABEL[priority]}
        </option>
      ))}
    </select>
    <select value={supportFilters.category} onChange={setFilterValue(setSupportFilters, 'category')}>
      <option value="">All Categories</option>
      {categoryOptions.map((category) => (
        <option key={category} value={category}>
          {CATEGORY_LABEL[category]}
        </option>
      ))}
    </select>
    <button className="secondary-btn" type="button" onClick={onRefresh} disabled={supportLoading}>
      {supportLoading ? 'Refreshing...' : 'Refresh'}
    </button>
  </div>
);

export default SupportFiltersBar;
