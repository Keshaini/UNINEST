const { VALID_CATEGORIES, VALID_PRIORITIES, VALID_STATUSES } = require('./constants');
const { normalizeEnum, normalizeString, toRegex } = require('./utils');

const buildComplaintFilter = (query) => {
  const filter = {};

  if (query.status !== undefined) {
    const status = normalizeEnum(query.status, VALID_STATUSES);
    if (!status) return { error: `Invalid status. Allowed values: ${VALID_STATUSES.join(', ')}` };
    filter.status = status;
  }

  if (query.priority !== undefined) {
    const priority = normalizeEnum(query.priority, VALID_PRIORITIES);
    if (!priority) return { error: `Invalid priority. Allowed values: ${VALID_PRIORITIES.join(', ')}` };
    filter.priority = priority;
  }

  if (query.category !== undefined) {
    const category = normalizeEnum(query.category, VALID_CATEGORIES);
    if (!category) return { error: `Invalid category. Allowed values: ${VALID_CATEGORIES.join(', ')}` };
    filter.category = category;
  }

  const studentId = normalizeString(query.studentId);
  if (studentId) filter.studentId = studentId;

  const search = normalizeString(query.search);
  if (search) {
    const regex = toRegex(search);
    filter.$or = [{ title: regex }, { description: regex }, { studentName: regex }, { roomNumber: regex }];
  }

  return { filter };
};

module.exports = { buildComplaintFilter };
