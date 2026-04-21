export const CATEGORY_OPTIONS = ['maintenance', 'cleaning', 'security', 'utilities', 'general'];
export const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];
export const STATUS_OPTIONS = ['pending', 'in_progress', 'resolved', 'rejected'];
export const SUPPORT_PAGE_SIZE = 8;

export const INITIAL_FORM = {
  studentId: '',
  studentName: '',
  roomNumber: '',
  title: '',
  description: '',
  category: 'general',
  priority: 'medium',
};

export const STATUS_LABEL = {
  pending: 'Pending',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

export const PRIORITY_LABEL = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const CATEGORY_LABEL = {
  maintenance: 'Maintenance',
  cleaning: 'Cleaning',
  security: 'Security',
  utilities: 'Utilities',
  general: 'General',
};
