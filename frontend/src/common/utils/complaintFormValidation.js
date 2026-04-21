const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

const REQUIRED_COMPLAINT_FIELDS = [
  ['studentId', 'Student ID'],
  ['studentName', 'Student name'],
  ['roomNumber', 'Room number'],
  ['title', 'Issue title'],
  ['description', 'Description'],
  ['category', 'Category'],
  ['priority', 'Priority'],
];

export const getNormalizedComplaintForm = (formData = {}) => ({
  studentId: normalizeText(formData.studentId),
  studentName: normalizeText(formData.studentName),
  roomNumber: normalizeText(formData.roomNumber),
  title: normalizeText(formData.title),
  description: normalizeText(formData.description),
  category: normalizeText(formData.category).toLowerCase(),
  priority: normalizeText(formData.priority).toLowerCase(),
});

export const getMissingComplaintFields = (formData = {}) => {
  const normalized = getNormalizedComplaintForm(formData);
  return REQUIRED_COMPLAINT_FIELDS.filter(([key]) => !normalized[key]).map(([, label]) => label);
};

export const isComplaintFormComplete = (formData = {}) => getMissingComplaintFields(formData).length === 0;

export const getComplaintFormValidationMessage = (formData = {}) => {
  const missing = getMissingComplaintFields(formData);
  if (missing.length === 0) return '';
  if (missing.length === 1) return `${missing[0]} is required.`;
  return `Complete all required fields: ${missing.join(', ')}.`;
};
