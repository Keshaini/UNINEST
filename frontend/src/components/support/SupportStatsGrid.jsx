const SupportStatsGrid = ({ stats }) => (
  <div className="stats-grid reveal">
    <article className="stat-card">
      <span>Total</span>
      <strong>{stats.totalComplaints ?? 0}</strong>
    </article>
    <article className="stat-card">
      <span>Open</span>
      <strong>{stats.openComplaints ?? 0}</strong>
    </article>
    <article className="stat-card">
      <span>Resolved</span>
      <strong>{stats.resolvedComplaints ?? 0}</strong>
    </article>
    <article className="stat-card">
      <span>Resolved Today</span>
      <strong>{stats.resolvedToday ?? 0}</strong>
    </article>
  </div>
);

export default SupportStatsGrid;
